import express from "express";
import auth from "../middlewares/auth.js";
import { Application } from "../models/application.js";
import { Job } from "../models/job.js";
import Response from "../utils/Response.js";

const router = express.Router();

// GET Application by jobId and populate author
router.get("/", auth, async (req, res) => {
  const { jobId, isAll } = req.query;

  if (isAll) {
    const applications = await Application.find({ buyer: req.user.id });
    res.status(200).send(new Response(true, "Success", applications));
  }

  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Valid service ID is required",
    });
  }

  const applicatins = await Application.find({ job: jobId }).populate(
    "author",
    "firstName lastName image skills title location"
  );

  res
    .status(200)
    .json(new Response(true, "Success", applicatins, applicatins.length));
});

// GET Application by jobId and populate author
router.get("/my", auth, async (req, res) => {
  try {
    const { jobId } = req.query;

    const application = await Application.findOne({
      author: req.user._id,
      job: jobId,
    }).populate("author", "firstName lastName image skills title location");

    if (!application) {
      return res.status(404).json(new Response(false, "Application not found"));
    }

    res.status(200).json(new Response(true, "Success", application));
  } catch (error) {
    res.status(500).json(new Response(false, "Server error"));
  }
});

// Create a new comment
router.post("/", auth, async (req, res) => {
  try {
    const { message, jobId, attachments = [] } = req.body;

    // Validate required fields
    if (!message || !jobId) {
      return res
        .status(400)
        .send(new Response(false, "Message and job ID are required"));
    }

    // Validate message length
    if (message.length < 2) {
      return res
        .status(400)
        .send(new Response(false, "Message must be at least 2 characters"));
    }

    // Check if job exists
    const jobExists = await Job.findById(jobId);
    if (!jobExists) {
      return res.status(404).send(new Response(false, "Job not found"));
    }

    // Create the application
    const application = await Application.create({
      message,
      buyer: jobExists.author,
      attachments: Array.isArray(attachments) ? attachments : [],
      author: req.user._id,
      job: jobId,
    });

    return res
      .status(201)
      .send(
        new Response(true, "Application created successfully", application)
      );
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).send(new Response(false, error.message));
    }

    if (error.name === "CastError") {
      return res.status(400).send(new Response(false, "Invalid job ID format"));
    }

    return res.status(500).send(new Response(false, "Internal server error"));
  }
});

// Delete a comment
router.delete("/:id", auth, async (req, res) => {
  const application = await Application.findByIdAndDelete(req.params.id);
  if (!application)
    return res.status(404).send("Comment with the given ID was not found.");

  res.status(200).send(new Response(true, "Success", application));
});

export default router;
