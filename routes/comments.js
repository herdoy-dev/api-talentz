import express from "express";
import mongoose from "mongoose";
import auth from "../middlewares/auth.js";
import { Comment } from "../models/comment.js";
import { Job } from "../models/job.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/user.js";
import Response from "../utils/Response.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { job } = req.query;
  const comments = await Comment.find({ job })
    .sort("-createdAt")
    .populate("job", "_id title")
    .populate("author", "_id firstName lastName image");
  return res.status(200).send(new Response(true, "Success", comments));
});

router.post("/", auth, async (req, res) => {
  const { message, reqType, job, reqFund, reqTime, attachments } = req.body;
  const newComment = await Comment.create({
    message,
    reqType,
    job,
    reqFund,
    reqTime,
    attachments,
    author: req.user._id,
  });

  return res.status(201).send(new Response(true, "Success", newComment));
});

router.put("/:_id", auth, async (req, res) => {
  const _id = req.params._id;
  const updatedComment = await Comment.findByIdAndUpdate(_id, req.body);
  return res.status(201).send(new Response(true, "Success", updatedComment));
});

router.post("/delivery", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { commentId, jobId, sellerId } = req.body;

    // Validate required parameters
    if (!commentId || !jobId || !sellerId) {
      return res
        .status(400)
        .send(new Response(false, "Missing required parameters"));
    }

    // Execute all operations as a transaction
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { status: "approved" },
      { new: true, session }
    );

    if (!updatedComment) {
      throw new Error("Comment not found");
    }

    const job = await Job.findByIdAndUpdate(
      jobId,
      { status: "COMPLETED" },
      { new: true, session }
    );

    if (!job) {
      throw new Error("Job not found");
    }

    const user = await User.findByIdAndUpdate(
      sellerId,
      { $inc: { walletBalance: job.budgetAmount * 0.9 } },
      { new: true, session }
    );

    if (!user) {
      throw new Error("User not found");
    }

    await Notification.create({
      title: "Delivery Accepted",
      description:
        "Your client has accepted the delivered work. Payment will be processed according to your agreement.",
      user: user._id,
    });

    await session.commitTransaction();
    return res.status(200).send(
      new Response(true, "Delivery approved successfully", {
        comment: updatedComment,
        job,
        user,
      })
    );
  } catch (error) {
    await session.abortTransaction();
    return res
      .status(500)
      .send(new Response(false, error.message || "Failed to approve delivery"));
  } finally {
    session.endSession();
  }
});

router.get("/all", auth, async (req, res) => {
  try {
    // First find jobs created by the current user
    const userJobs = await Job.find({ author: req.user._id }).select("_id");

    // Then find comments that belong to these jobs
    const jobComments = await Comment.find({
      job: { $in: userJobs.map((job) => job._id) },
    })
      .limit(3)
      .sort("-createdAt")
      .populate("author", "name email"); // optionally populate author info

    res.status(200).json(new Response(true, "Success", jobComments));
  } catch (error) {
    console.error(error);
    res.status(500).json(new Response(false, "Server error"));
  }
});

router.delete("/:_id", auth, async (req, res) => {
  const deletedComment = await Comment.findByIdAndDelete(req.params._id);
  return res.status(200).send(new Response(true, "Success", deletedComment));
});

export default router;
