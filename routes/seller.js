import express from "express";
import auth from "../middlewares/auth.js";
import Response from "../utils/Response.js";
import { Job } from "../models/job.js";

const router = express.Router();

router.get("/active-jobs-report", auth, async (req, res) => {
  try {
    const activeJobs = await Job.find({
      seller: req.user._id,
      status: "IN_PROGRESS",
    }).populate("category");

    const activeJobCount = activeJobs.length;

    // Group by category name with null check
    const grouped = activeJobs.reduce((acc, item) => {
      const categoryName = item.category?.name || "Uncategorized";
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(item);
      return acc;
    }, {});

    // Create and sort ranked array
    const ranked = Object.entries(grouped)
      .map(([categoryName, jobs]) => ({
        category: categoryName,
        totalJobs: jobs.length,
        jobs,
      }))
      .sort((a, b) => b.totalJobs - a.totalJobs);

    // Get top categories (default to null if not available)
    const [
      rankOneByCategory = null,
      rankTwoByCategory = null,
      rankThreeByCategory = null,
      rankFourByCategory = null,
    ] = ranked;

    res.send(
      new Response(true, "Success", {
        activeJobCount,
        ranked, // Consider including full ranked array
        rankOneByCategory,
        rankTwoByCategory,
        rankThreeByCategory,
        rankFourByCategory,
      })
    );
  } catch (error) {
    console.error("Active jobs report error:", error);
    res.status(500).send(new Response(false, "Server error", null));
  }
});

export default router;
