import express from "express";
import auth from "../middlewares/auth.js";
import { Balance, validateBalance } from "../models/balence.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const balance = await Balance.findOne({ user: req.user._id });

  if (!balance) {
    return res.status(404).json({
      success: false,
      message: "Balance not found for this user",
    });
  }

  res.status(200).send(balance);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateBalance(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const { balance: amount } = req.body;
  const user = req.user._id;

  let userBalance = await Balance.findOne({ user });

  if (userBalance) {
    userBalance.balance += amount;
    await userBalance.save();
    return res.status(200).send(userBalance);
  }

  const newBalance = await Balance.create({
    balance: amount,
    user,
  });

  res.status(201).send(newBalance);
});

export default router;
