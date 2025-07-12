import express from "express";
import { Transaction } from "../models/transaction.js";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";
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
    let query = Transaction.find().populate("user", "firstName lastName email");

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
    let countQuery = Transaction.find();
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

export default router;
