import express from "express";
import mongoose from "mongoose";
import auth from "../middlewares/auth.js";
import { Package as PackageModel, validatePackage } from "../models/package.js";

const router = express.Router();

// Get packages by service ID using query param
router.get("/", async (req, res) => {
  const { serviceId } = req.query;

  if (!serviceId || typeof serviceId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Valid service ID is required",
    });
  }

  const packages = await PackageModel.find({ serviceId }).select("-__v");

  res.status(200).json({
    success: true,
    data: packages,
    count: packages.length,
  });
});

// Create new package (authenticated)
router.post("/", auth, async (req, res) => {
  const { error } = validatePackage(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((d) => d.message),
    });
  }

  const newPackage = await PackageModel.create(req.body);

  res.status(201).json({
    success: true,
    message: "Package created successfully",
    data: newPackage,
  });
});

// Update package (authenticated)
router.put("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid package ID format",
    });
  }

  const { error } = validatePackage(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((d) => d.message),
    });
  }

  const updatedPackage = await PackageModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select("-__v");

  if (!updatedPackage) {
    return res.status(404).json({
      success: false,
      message: "Package not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Package updated successfully",
    data: updatedPackage,
  });
});

// Delete package (authenticated and admin)
router.delete("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid package ID format",
    });
  }

  const deletedPackage = await PackageModel.findByIdAndDelete(req.params.id);

  if (!deletedPackage) {
    return res.status(404).json({
      success: false,
      message: "Package not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Package deleted successfully",
    data: deletedPackage,
  });
});

export default router;
