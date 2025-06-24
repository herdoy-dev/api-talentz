import express from "express";
import auth from "../middlewares/auth.js";
import { Comment, validateComment } from "../models/comment.js";
import Response from "../utils/Response.js";

const router = express.Router();

// GET comments by jobId and populate author
router.get("/", auth, async (req, res) => {
  const { jobId } = req.query;

  if (!jobId || typeof jobId !== "string") {
    return res
      .status(400)
      .json(new Response(false, "Valid service ID is required"));
  }

  const comments = await Comment.find({
    jobId,
    author: { $ne: req.user._id },
  }).populate("author", "firstName lastName image");

  res
    .status(200)
    .json(new Response(true, "Success", comments, comments.length));
});

// Create a new comment
router.post("/", auth, async (req, res) => {
  const { error } = validateComment(req.body);
  if (error)
    return res.status(400).send(new Response(false, error.details[0].message));

  const newComment = await Comment.create({
    ...req.body,
    author: req.user._id,
  });
  res.status(201).send(new Response(true, "Success", newComment));
});

// Delete a comment
router.delete("/:id", auth, async (req, res) => {
  const deletedComment = await Comment.findByIdAndDelete(req.params.id);
  if (!deletedComment)
    return res
      .status(404)
      .send(new Response(false, "Comment with the given ID was not found."));

  res.status(200).send(new Response(true, "Deleted", deletedComment));
});

export default router;
