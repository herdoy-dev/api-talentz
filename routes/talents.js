import express from "express";
import { User } from "../models/user.js";
import { Job } from "../models/job.js";
import Response from "../utils/Response.js";

const router = express.Router();

// Default pagination values
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

// Fields to exclude from user responses
const USER_EXCLUDED_FIELDS = {
  password: 0,
  email: 0,
  phone: 0,
  __v: 0,
};

// Get all users (excluding freelancers and admins)
router.get("/", async (req, res) => {
  const {
    search,
    orderBy,
    sortOrder = "asc",
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    ...filters
  } = req.query;

  // Base query to exclude freelancers and admins
  const baseQuery = {
    role: { $nin: ["client", "admin"] },
  };

  // Initialize query with projection to exclude sensitive fields
  let query = User.find(baseQuery, USER_EXCLUDED_FIELDS);

  // Apply search filter if provided
  if (search) {
    const searchRegex = new RegExp(search, "i");
    query = query.or([
      { firstName: searchRegex },
      { lastName: searchRegex },
      { title: searchRegex },
    ]);
  }

  // Apply exact match filters for valid fields
  const validFilterFields = ["firstName", "lastName", "role"];
  Object.keys(filters).forEach((key) => {
    if (validFilterFields.includes(key)) {
      query = query.where(key).equals(filters[key]);
    }
  });

  // Apply sorting if orderBy is provided
  if (orderBy) {
    const sortDirection = sortOrder.toLowerCase() === "desc" ? -1 : 1;
    query = query.sort({ [orderBy]: sortDirection });
  }

  // Parse pagination parameters
  const pageNum = parseInt(page);
  const size = parseInt(pageSize);
  const skip = (pageNum - 1) * size;

  // Apply pagination
  query = query.skip(skip).limit(size);

  // Execute query
  const talents = await query.exec();

  // Prepare count query with same filters
  let countQuery = User.find(baseQuery);

  if (search) {
    const searchRegex = new RegExp(search, "i");
    countQuery = countQuery.or([
      { firstName: searchRegex },
      { lastName: searchRegex },
      { title: searchRegex },
    ]);
  }

  // Apply filters to count query
  Object.keys(filters).forEach((key) => {
    if (validFilterFields.includes(key)) {
      countQuery = countQuery.where(key).equals(filters[key]);
    }
  });

  // Get total count
  const totalCount = await countQuery.countDocuments();

  // Calculate page count
  const pageCount = Math.ceil(totalCount / size);

  // Send response
  res
    .status(200)
    .send(new Response(true, "Fetched", talents, pageCount, page, pageSize));
});

router.get("/total-job-count", async (req, res) => {
  const { userId } = req.query;
  const countCompletedJob = await Job.countDocuments({
    status: "COMPLETED",
    seller: userId,
  });

  res.status(200).send(new Response(true, "Success", countCompletedJob));
});

export default router;
