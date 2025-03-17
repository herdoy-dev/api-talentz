import express from "express";
import { User, validateUser } from "../models/user.js";
import logger from "../startup/logger.js";

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    logger.error("Error fetching users:", error);
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
});

// Get a user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "The user with the given ID was not found." });
    }
    return res.status(200).json(user);
  } catch (error) {
    logger.error("Error fetching user:", error);
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
});

// Update a user by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "The user with the given ID was not found." });
    }

    const { error } = validateUser(user);
    if (error) return res.status(400).send(error.details[0].message);

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    logger.error("Error updating user:", error);
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
});

// Delete a user by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "The user with the given ID was not found." });
    }

    await User.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "User deleted successfully.", user });
  } catch (error) {
    logger.error("Error deleting user:", error);
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
});

export default router;
