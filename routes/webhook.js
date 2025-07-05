import express from "express";
import { Job } from "../models/job.js";
import { Transaction } from "../models/transaction.js";
import stripe from "../utils/stripe.js";

const router = express.Router();

router.post(
  "/",
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
        const transactionId = session.metadata?.transactionId;
        const jobId = session.metadata?.jobId;

        await Transaction.findByIdAndUpdate(transactionId, {
          status: "completed",
          gatewayRef: session.id,
        });

        await Job.findByIdAndUpdate(jobId, { status: "IN_PROGRESS" });
      }

      res.status(200).send();
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
