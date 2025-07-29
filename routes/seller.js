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


router.get("/monthly-earnings", auth, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Fetch completed jobs in the last 6 months
    const completedJobs = await Job.find({
      seller: req.user._id,
      status: "COMPLETED",
      updatedAt: { $gte: sixMonthsAgo },
    });

    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];

    const monthlyEarnings = {};

    // Initialize the past 6 full months + current month
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      monthlyEarnings[key] = 0;
    }

    // Accumulate job earnings by month
    completedJobs.forEach(job => {
      const date = job.completedAt || job.updatedAt;
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
      if (monthlyEarnings.hasOwnProperty(key)) {
        monthlyEarnings[key] += job.budgetAmount || 0;
      }
    });

    // Format for chart: e.g., { month: "July 2025", earn: 500 }
    const chartData = Object.entries(monthlyEarnings).map(([key, value]) => {
      const [year, monthIndex] = key.split("-");
      const monthName = monthNames[parseInt(monthIndex)];
      return {
        month: `${monthName} ${year}`,
        earnings: value,
      };
    });

    res.status(200).send(new Response(true, "Monthly earnings data", {chartData}));
  } catch (error) {
    console.error("Monthly earnings error:", error);
    res.status(500).send(new Response(false, "Server error", null));
  }
});



export default router;
