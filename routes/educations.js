import express from "express";
import auth from "../middlewares/auth.js";
import { Education, validateEducation } from "../models/education.js";

const router = express.Router();

// Get all educations for the authenticated user
router.get("/", auth, async (req, res) => {
  const educations = await Education.find({ userId: req.user._id });
  res.status(200).send(educations);
});

// Get a specific education by ID
router.get("/:id", auth, async (req, res) => {
  const education = await Education.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!education) {
    return res.status(404).json({
      success: false,
      message: "Education not found or access denied",
    });
  }

  res.status(200).send(education);
});

// Create a new education
router.post("/", auth, async (req, res) => {
  const { error } = validateEducation(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const newEducation = await Education.create({
    ...req.body,
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: newEducation,
  });
});

// Update an education
router.put("/:id", auth, async (req, res) => {
  const { error } = validateEducation(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
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
    return res.status(404).json({
      success: false,
      message: "Education not found or access denied",
    });
  }

  res.status(200).json({
    success: true,
    data: updatedEducation,
  });
});

// Delete an education
router.delete("/:id", auth, async (req, res) => {
  const deletedEducation = await Education.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!deletedEducation) {
    return res.status(404).json({
      success: false,
      message: "Education not found or access denied",
    });
  }

  res.status(200).json({
    success: true,
    data: deletedEducation,
  });
});

export default router;
