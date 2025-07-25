import express from "express";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";
import { User } from "../models/user.js";
import Response from "../utils/Response.js";

const router = express.Router();

// Get all users
router.get("/", [auth, admin], async (req, res) => {
  const {
    search,
    orderBy,
    sortOrder = "asc",
    page = 1,
    pageSize = 10,
    ...filters
  } = req.query;

  // Start query excluding the current admin user
  let query = User.find({ _id: { $ne: req.user._id } });

  if (search) {
    query = query.or([
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ]);
  }

  // Apply exact match filters for each field if provided
  Object.keys(filters).forEach((key) => {
    if (["firstName", "lastName", "email", "role"].includes(key)) {
      query = query.where(key).equals(filters[key]);
    }
  });

  // Apply sorting
  if (orderBy) {
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    query = query.sort({ [orderBy]: sortDirection });
  }

  // Apply pagination
  const skip = (page - 1) * pageSize;
  query = query.skip(skip).limit(parseInt(pageSize));

  const users = await query.exec();

  // Count query (same filters but without pagination)
  let countQuery = User.find({ _id: { $ne: req.user._id } });

  if (search) {
    countQuery = countQuery.or([
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ]);
  }

  Object.keys(filters).forEach((key) => {
    if (["firstName", "lastName", "email", "role"].includes(key)) {
      countQuery = countQuery.where(key).equals(filters[key]);
    }
  });

  const totalCount = await countQuery.countDocuments();

  res
    .status(200)
    .send(new Response(true, "Fetched", users, totalCount, page, pageSize));
});

// Get a user by ID
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user)
    return res
      .status(404)
      .send(new Response(false, "The user with the given ID was not found."));

  res.status(200).json(new Response(true, "Success", user));
});

// Update a user by ID
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user)
    return res
      .status(404)
      .send(new Response(false, "The user with the given ID was not found."));
  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).send(new Response(true, "Success", updatedUser));
});

// Delete a user by ID
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res
      .status(404)
      .send(new Response(false, "The user with the given ID was not found."));
  }

  await User.findByIdAndDelete(id);
  res
    .status(200)
    .send(new Response(true, "Success", "User deleted successfully."));
});

export default router;
