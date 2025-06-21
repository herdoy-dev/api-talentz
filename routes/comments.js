import express from "express";
import auth from "../middlewares/auth.js";
import { Comment, validateComment } from "../models/comment.js";

const router = express.Router();

// GET comments by jobId and populate author
router.get("/", auth, async (req, res) => {
  const { jobId } = req.query;

  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Valid service ID is required",
    });
  }

  const comments = await Comment.find({
    jobId,
    author: { $ne: req.user._id },
  }).populate("author", "firstName lastName image");

  res.status(200).json({
    result: comments,
    count: comments.length,
  });
});

// Create a new comment
router.post("/", auth, async (req, res) => {
  const { error } = validateComment(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newComment = await Comment.create(req.body);
  res.status(201).send(newComment);
});

// Delete a comment
router.delete("/:id", auth, async (req, res) => {
  const deletedComment = await Comment.findByIdAndDelete(req.params.id);
  if (!deletedComment)
    return res.status(404).send("Comment with the given ID was not found.");

  res.status(200).send(deletedComment);
});

export default router;
