import express from "express";
import auth from "../middlewares/auth.js";
import { Portfolio, validatePortfolio } from "../models/portfolio.js";

const router = express.Router();

// Get all portfolio items for the authenticated user
router.get("/", auth, async (req, res) => {
  const portfolios = await Portfolio.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).send(portfolios);
});

// Get a specific portfolio item by ID
router.get("/:id", auth, async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);

  if (!portfolio) {
    return res.status(404).send("Portfolio item not found or access denied");
  }
  res.status(200).send(portfolio);
});

// Create a new portfolio item
router.post("/", auth, async (req, res) => {
  const { error } = validatePortfolio(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const portfolio = new Portfolio({
    ...req.body,
    userId: req.user._id,
  });
  await portfolio.save();
  res.status(201).send(portfolio);
});

// Update a portfolio item
router.put("/:id", auth, async (req, res) => {
  const { error } = validatePortfolio(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const updatedPortfolio = await Portfolio.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedPortfolio) {
    return res.status(404).send("Portfolio item not found or access denied");
  }

  res.status(200).send(updatedPortfolio);
});

// Delete a portfolio item
router.delete("/:id", auth, async (req, res) => {
  const deletedPortfolio = await Portfolio.findByIdAndDelete(req.params.id);
  if (!deletedPortfolio) {
    return res.status(404).send("Portfolio item not found or access denied");
  }

  res.status(200).send(deletedPortfolio);
});

export default router;
