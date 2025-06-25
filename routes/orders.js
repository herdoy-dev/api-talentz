import express from "express";
import auth from "../middlewares/auth.js";
import { Job } from "../models/job.js";
import { Transaction } from "../models/transaction.js";
import stripe from "../utils/stripe.js";
const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { amount, seller, deliveryDate, job } = req.body;

    const userId = req.user._id;

    const transaction = await Transaction.create({
      userId,
      type: "checkout",
      amount,
      status: "pending",
    });

    await Job.findByIdAndUpdate(job, {
      seller,
      budgetAmount: amount,
      deliveryDate,
    });

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
      metadata: {
        transactionId: transaction._id.toString(), // Convert to string
        jobId: job.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
