import express from "express";
import auth from "../middlewares/auth.js";
import { Application, validateApplication } from "../models/application.js";
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

  const applicatins = await Application.find({ jobId }).populate(
    "author",
    "firstName lastName image skills title location"
  );

  res
    .status(200)
    .json(new Response(true, "Success", applicatins, applicatins.length));
});

// GET Application by jobId and populate author
router.get("/my", auth, async (req, res) => {
  const { jobId } = req.query;
  const application = await Application.findOne({
    author: req.user._id,
    jobId,
  }).populate("author", "firstName lastName image skills title location");

  res.status(200).json(new Response(true, "Success", application));
});

// Create a new comment
router.post("/", auth, async (req, res) => {
  const { error } = validateApplication(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const application = await Application.create({
    ...req.body,
    author: req.user._id,
  });
  res.status(201).send(new Response(true, "Success", application));
});

// Delete a comment
router.delete("/:id", auth, async (req, res) => {
  const application = await Application.findByIdAndDelete(req.params.id);
  if (!application)
    return res.status(404).send("Comment with the given ID was not found.");

  res.status(200).send(new Response(true, "Success", application));
});

export default router;
