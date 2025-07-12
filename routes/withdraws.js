import express from "express";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";
import { User } from "../models/user.js";
import { Withdraw } from "../models/withdraw.js";
import Response from "../utils/Response.js";

const router = express.Router();

// Get all withdraw requests (admin view)
router.get("/", [auth, admin], async (req, res) => {
  try {
    const {
      orderBy,
      sortOrder = "asc",
      page = 1,
      pageSize = 10,
      status,
      ...filters
    } = req.query;

    // Build base query
    let query = Withdraw.find().populate("user", "firstName lastName email");

    // Apply filters
    if (status) {
      query = query.where("status").equals(status);
    }

    // Apply sorting
    if (orderBy) {
      const sortDirection = sortOrder === "desc" ? -1 : 1;
      query = query.sort({ [orderBy]: sortDirection });
    } else {
      // Default sorting by newest first
      query = query.sort({ createdAt: -1 });
    }

    // Apply pagination
    const skip = (Number(page) - 1) * Number(pageSize);
    query = query.skip(skip).limit(Number(pageSize));

    const withdraws = await query.exec();

    // Get total count with same filters
    let countQuery = Withdraw.find();
    if (status) {
      countQuery = countQuery.where("status").equals(status);
    }
    const totalCount = await countQuery.countDocuments();

    res
      .status(200)
      .send(
        new Response(
          true,
          "Withdraw requests fetched successfully",
          withdraws,
          totalCount,
          Number(page),
          Number(pageSize)
        )
      );
  } catch (error) {
    console.error("Error fetching withdraw requests:", error);
    res.status(500).send(new Response(false, "Internal server error"));
  }
});

router.get("/earning", auth, async (req, res) => {
  try {
    const completedWithdraws = await Withdraw.find({
      user: req.user._id,
      status: "COMPLETED",
    });

    const totalEarning = completedWithdraws.reduce((total, withdraw) => {
      return total + (withdraw.amount || 0);
    }, 0);

    res
      .status(200)
      .send(
        new Response(true, "Earnings calculated successfully", totalEarning)
      );
  } catch (error) {
    console.error("Error calculating earnings:", error);
    res.status(500).send(new Response(false, "Server error"));
  }
});

router.get("/earning/pending", auth, async (req, res) => {
  try {
    const pendingWithdraws = await Withdraw.find({
      user: req.user._id,
      status: "PENDING",
    });

    const totalEarning = pendingWithdraws.reduce((total, withdraw) => {
      return total + (withdraw.amount || 0);
    }, 0);

    res
      .status(200)
      .send(
        new Response(true, "Earnings calculated successfully", totalEarning)
      );
  } catch (error) {
    console.error("Error calculating earnings:", error);
    res.status(500).send(new Response(false, "Server error"));
  }
});

// Get user's withdraw requests
router.get("/my", auth, async (req, res) => {
  try {
    const {
      orderBy,
      sortOrder = "asc",
      status,
      page = 1,
      pageSize = 10,
    } = req.query;

    // Build base query for user's withdraws
    let query = Withdraw.find({ user: req.user._id }).populate(
      "user",
      "firstName lastName email"
    );

    // Apply status filter if provided
    if (status) {
      query = query.where("status").equals(status);
    }

    // Apply sorting
    if (orderBy) {
      const sortDirection = sortOrder === "desc" ? -1 : 1;
      query = query.sort({ [orderBy]: sortDirection });
    } else {
      // Default sorting by newest first
      query = query.sort({ createdAt: -1 });
    }

    // Apply pagination
    const skip = (Number(page) - 1) * Number(pageSize);
    query = query.skip(skip).limit(Number(pageSize));

    const withdraws = await query.exec();

    // Get total count with same filters
    let countQuery = Withdraw.find({ user: req.user._id });
    if (status) {
      countQuery = countQuery.where("status").equals(status);
    }
    const totalCount = await countQuery.countDocuments();

    res
      .status(200)
      .send(
        new Response(
          true,
          "Withdraw requests fetched successfully",
          withdraws,
          totalCount,
          Number(page),
          Number(pageSize)
        )
      );
  } catch (error) {
    console.error("Error fetching user withdraw requests:", error);
    res.status(500).send(new Response(false, "Internal server error"));
  }
});

// Create new withdraw request
router.post("/", auth, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    // Validate input
    if (!amount || !paymentMethod) {
      return res
        .status(400)
        .send(new Response(false, "Amount and payment method are required"));
    }

    // Check if amount is valid
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 30 || numericAmount > 10000) {
      return res
        .status(400)
        .send(new Response(false, "Amount must be between $30 and $10,000"));
    }

    // Check user balance
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send(new Response(false, "User not found"));
    }

    if (user.walletBalance < numericAmount) {
      return res
        .status(400)
        .send(new Response(false, "Insufficient funds in your wallet"));
    }

    // Create withdraw request
    const newWithdraw = await Withdraw.create({
      amount: numericAmount,
      user: req.user._id,
      paymentMethod,
      status: "PENDING",
    });

    // Deduct from user's wallet balance
    user.walletBalance -= numericAmount;
    await user.save();

    res
      .status(201)
      .send(
        new Response(
          true,
          "Withdraw request submitted successfully",
          newWithdraw
        )
      );
  } catch (error) {
    console.error("Error creating withdraw request:", error);
    res.status(500).send(new Response(false, "Internal server error"));
  }
});

export default router;
