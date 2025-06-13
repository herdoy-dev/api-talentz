import express from "express";
const router = express.Router();
import { Transaction } from "../models/transaction.js";
import { User } from "../models/user.js";
import stripe from "../utils/stripe.js";

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { amount, userId } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Wallet Deposit",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.ORIGIN}/deposit-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.ORIGIN}/deposit-cancelled`,
      metadata: { userId },
    });

    await Transaction.create({
      userId,
      type: "deposit",
      amount,
      status: "pending",
      gatewayRef: session.id,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
