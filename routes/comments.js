import express from "express";
import mongoose from "mongoose";
import auth from "../middlewares/auth.js";
import { Comment } from "../models/comment.js";
import { Job } from "../models/job.js";
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
    console.error("Delivery approval error:", error);
    return res
      .status(500)
      .send(new Response(false, error.message || "Failed to approve delivery"));
  } finally {
    session.endSession();
  }
});

router.delete("/:_id", auth, async (req, res) => {
  const deletedComment = await Comment.findByIdAndDelete(req.params._id);
  return res.status(200).send(new Response(true, "Success", deletedComment));
});

export default router;
