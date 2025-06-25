import express from "express";
import auth from "../middlewares/auth.js";
import { Comment } from "../models/comment.js";
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

router.delete("/:_id", auth, async (req, res) => {
  const deletedComment = await Comment.findByIdAndDelete(req.params._id);
  return res.status(200).send(new Response(true, "Success", deletedComment));
});

export default router;
