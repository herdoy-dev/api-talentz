import express from "express";
import { User, validateUser } from "../models/user.js";
import auth from "../middlewares/auth.js";
import admin from "../middlewares/admin.js";

const router = express.Router();

// Get all users
router.get("/", [auth, admin], async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

// Get a user by ID
router.get("/:id", [auth, admin], async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user)
    return res
      .status(404)
      .json({ message: "The user with the given ID was not found." });

  res.status(200).json(user);
});

// Update a user by ID
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user)
    return res
      .status(404)
      .json({ message: "The user with the given ID was not found." });

  const { error } = validateUser(user);
  if (error) return res.status(400).send(error.details[0].message);
  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(updatedUser);
});

// Delete a user by ID
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res
      .status(404)
      .json({ message: "The user with the given ID was not found." });
  }

  await User.findByIdAndDelete(id);
  res.status(200).json({ message: "User deleted successfully.", user });
});

export default router;
