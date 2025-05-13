import express from "express";
import mongoose from "mongoose";
import auth from "../middlewares/auth.js";
import { Service, validateService } from "../models/service.js";

const router = express.Router();

// GET all services or by userId (query param)
router.get("/", async (req, res) => {
  const services = await Service.find().select("-__v");
  res.status(200).json({
    result: services,
    count: services.length,
  });
});

// GET all services or by userId (query param)
router.get("/my", auth, async (req, res) => {
  const services = await Service.find({ userId: req.user._id });
  res.status(200).json({
    result: services,
    count: services.length,
  });
});

// POST a new service (auth required)
router.post("/", auth, async (req, res) => {
  const { error } = validateService(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((d) => d.message),
    });
  }

  try {
    const newService = await Service.create(req.body);
    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: newService,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create service",
      error: err.message,
    });
  }
});

// PUT update a service by ID (auth required)
router.put("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid service ID format",
    });
  }

  const { error } = validateService(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((d) => d.message),
    });
  }

  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update service",
      error: err.message,
    });
  }
});

// DELETE a service by ID (auth required)
router.delete("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid service ID format",
    });
  }

  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);

    if (!deletedService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      data: deletedService,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete service",
      error: err.message,
    });
  }
});

export default router;
