import express from "express";
import auth from "../middlewares/auth.js";
import { Education, validateEducation } from "../models/education.js";
import Response from "../utils/Response.js";

const router = express.Router();

// Get all educations for the authenticated user
router.get("/", auth, async (req, res) => {
  const educations = await Education.find({ userId: req.user._id });
  res.status(200).send(new Response(true, "Success", educations));
});

router.get("/user", async (req, res) => {
  const { userId } = req.query;
  const educations = await Education.find({ userId });
  res.status(200).send(new Response(true, "Success", educations));
});

// Get a specific education by ID
router.get("/:id", auth, async (req, res) => {
  const education = await Education.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!education) {
    return res
      .status(404)
      .json(new Response(false, "Education not found or access denied"));
  }

  res.status(200).send(new Response(true, "Success", education));
});

// Create a new education
router.post("/", auth, async (req, res) => {
  const { error } = validateEducation(req.body);
  if (error)
    return res.status(400).json(new Response(false, error.details[0].message));

  const newEducation = await Education.create({
    ...req.body,
    userId: req.user._id,
  });

  res.status(201).json(new Response(true, "Success", newEducation));
});

// Update an education
router.put("/:id", auth, async (req, res) => {
  const { error } = validateEducation(req.body);
  if (error) {
    return res.status(400).json(new Response(false, error.details[0].message));
  }

  const updatedEducation = await Education.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user._id,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedEducation) {
    return res
      .status(404)
      .json(new Response(false, "Education not found or access denied"));
  }

  res.status(200).json(new Response(true, "Success", updatedEducation));
});

// Delete an education
router.delete("/:id", auth, async (req, res) => {
  const deletedEducation = await Education.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!deletedEducation) {
    return res
      .status(404)
      .json(new Response(false, "Education not found or access denied"));
  }

  res.status(200).json(new Response(true, "Success", deletedEducation));
});

export default router;
