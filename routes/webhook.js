import express from "express";
import stripe from "../utils/stripe.js";
import { Transaction } from "../models/transaction.js";
import { User } from "../models/user.js";

const router = express.Router();

router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        const transaction = await Transaction.findOne({
          gatewayRef: session.id,
        });
        if (transaction && transaction.status !== "completed") {
          transaction.status = "completed";
          await transaction.save();

          await User.findByIdAndUpdate(userId, {
            $inc: { walletBalance: transaction.amount },
          });
        }
      }

      res.status(200).send();
    } catch (err) {
      console.error("Webhook error:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
