import express from "express";
import auth from "../middlewares/auth.js";
import { Job, validateJob } from "../models/job.js";
import Response from "../utils/Response.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const {
    search,
    orderBy,
    sortOrder = "asc",
    page = 1,
    pageSize = 10,
    ...filters
  } = req.query;

  let query = Job.find({ status: "OPEN" })
    .populate("category", "name")
    .populate("author", "firstName lastName");

  if (search) {
    query = query.or([
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ]);
  }

  // Apply exact match filters for each field if provided
  Object.keys(filters).forEach((key) => {
    if (
      [
        "budget",
        "type",
        "category",
        "requiredLevel",
        "status",
        "jobLength",
        "jobSize",
      ].includes(key)
    ) {
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

  const jobs = await query.exec();

  // Create count query (should match the same filters as the main query)
  let countQuery = Job.find();

  if (search) {
    countQuery = countQuery.or([
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ]);
  }

  Object.keys(filters).forEach((key) => {
    if (
      [
        "budget",
        "type",
        "category",
        "requiredLevel",
        "jobLength",
        "jobSize",
      ].includes(key)
    ) {
      countQuery = countQuery.where(key).equals(filters[key]);
    }
  });

  const totalCount = await countQuery.countDocuments();

  res
    .status(200)
    .send(new Response(true, "Fetched", jobs, totalCount, page, pageSize));
});

router.get("/my", auth, async (req, res) => {
  const {
    search,
    orderBy,
    sortOrder = "asc",
    status,
    page = 1,
    pageSize = 10,
    ...filters
  } = req.query;

  let query = Job.find({
    $or: [{ author: req.user._id }, { seller: req.user._id }],
    status,
  })
    .populate("category", "name")
    .populate("author", "firstName lastName");

  if (search) {
    query = query.or([
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ]);
  }

  // Apply exact match filters for each field if provided
  Object.keys(filters).forEach((key) => {
    if (
      [
        "budget",
        "type",
        "category",
        "requiredLevel",
        "jobLength",
        "jobSize",
      ].includes(key)
    ) {
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

  const jobs = await query.exec();

  // Create count query (should match the same filters as the main query)
  let countQuery = Job.find();

  if (search) {
    countQuery = countQuery.or([
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ]);
  }

  Object.keys(filters).forEach((key) => {
    if (
      [
        "budget",
        "type",
        "category",
        "requiredLevel",
        "jobLength",
        "jobSize",
      ].includes(key)
    ) {
      countQuery = countQuery.where(key).equals(filters[key]);
    }
  });

  const totalCount = await countQuery.countDocuments();

  res
    .status(200)
    .send(new Response(true, "Fetched", jobs, totalCount, page, pageSize));
});

router.get("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const job = await Job.findById(_id).populate(
    "author",
    "firstName lastName image"
  );
  if (!job)
    return res.status(404).send("The job with the given ID was not found!");

  res.status(200).send(job);
});

router.post("/", auth, async (req, res) => {
  const body = req.body;
  const { error } = validateJob(body);
  if (error) return res.status(400).send(error.details[0].message);
  const newJob = await Job.create(body);
  res.status(201).send(new Response(true, "Job Created", newJob));
});

router.put("/:_id", auth, async (req, res) => {
  const _id = req.params._id;

  const updatedJob = await Job.findByIdAndUpdate(
    _id,
    req.body,
    { new: true, runValidators: true } // Added runValidators
  );

  res.status(200).send(updatedJob);
});

router.delete("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const job = await Job.findById(_id).populate("author", "_id");

  if (!job) {
    return res.status(404).send("Job not found");
  }

  // Authorization check
  if (
    job.author._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    return res.status(403).send("Unauthorized");
  }

  const deletedJob = await Job.findByIdAndDelete(_id);

  res.status(200).send({
    success: true,
    data: deletedJob,
  });
});

export default router;
