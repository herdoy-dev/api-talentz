import express from "express";
import auth from "../middlewares/auth.js";
import Response from "../utils/Response.js";
import { Job } from "../models/job.js";

const router = express.Router();

router.get("/spend-report", auth, async (req, res) => {
  try {
    const now = new Date();

    // Fetch all completed jobs by this user
    const jobs = await Job.find({
      author: req.user._id,
      status: "COMPLETED",
    });

    // --- Total Spend ---
    const totalSpend = jobs.reduce((sum, job) => sum + job.budgetAmount, 0);

    // --- Monthly Spend ---
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    const jobsOfCurrentMonth = jobs.filter(
      (job) =>
        job.createdAt >= startOfCurrentMonth && job.createdAt < startOfNextMonth
    );

    const monthlySpend = jobsOfCurrentMonth.reduce(
      (sum, job) => sum + job.budgetAmount,
      0
    );

    // --- Average Spend ---
    const averateProjectCost = jobs.length ? totalSpend / jobs.length : 0;

    // --- Monthly Spend for Last 6 Months ---
    const monthlySpendReport = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const nextMonthDate = new Date(currentYear, currentMonth - i + 1, 1);

      const monthLabel = monthDate.toLocaleString("default", {
        month: "long",
      });

      const spendThisMonth = jobs
        .filter(
          (job) => job.createdAt >= monthDate && job.createdAt < nextMonthDate
        )
        .reduce((sum, job) => sum + job.budgetAmount, 0);

      monthlySpendReport.push({
        month: monthLabel,
        spend: spendThisMonth,
      });
    }

    res.send(
      new Response(true, "Success", {
        totalSpend,
        monthlySpend,
        averateProjectCost: averateProjectCost.toFixed(),
        monthlySpendReport,
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).send(new Response(false, "Server error", null));
  }
});

router.get("/active-jobs-report", auth, async (req, res) => {
  try {
    const activeJobs = await Job.find({
      author: req.user._id,
      status: "OPEN",
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
