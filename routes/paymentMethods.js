import express from "express";
import auth from "../middlewares/auth.js";
import { BankAccount } from "../models/BankAccount.js";
import { PaymentMethod } from "../models/PaymentMethod.js";
import { PaypalAccount } from "../models/PaypalAccount.js";
import Response from "../utils/Response.js";

const router = express.Router();

router.post("/bank-accounts", auth, async (req, res) => {
  const user = req.user._id;
  const bankAccount = new BankAccount({ user, ...req.body });
  await bankAccount.save();

  res.status(201).json(new Response(true, "Success"));
});

router.post("/paypal-accounts", auth, async (req, res) => {
  const user = req.user._id;
  const paypalAccount = new PaypalAccount({ user, ...req.body });
  await paypalAccount.save();

  res.status(201).send(new Response(true, "Success"));
});

router.get("/", auth, async (req, res) => {
  const paymentMethods = await PaymentMethod.find({
    user: req.user._id,
  });
  res.status(200).send(new Response(true, "Success", paymentMethods));
});

export default router;
