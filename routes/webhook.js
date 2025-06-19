import express from "express";
import { Job } from "../models/job.js";
import { Order } from "../models/order.js";
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
        const orderId = session.metadata?.orderId;
        const jobId = session.metadata?.jobId;

        const transaction = await Transaction.findOne({
          gatewayRef: session.id,
        });
        if (transaction && transaction.status !== "completed") {
          transaction.status = "completed";
          await transaction.save();

          await Transaction.findByIdAndUpdate(transactionId, {
            status: "completed",
            gatewayRef: session.id,
          });
          await Order.findByIdAndUpdate(orderId, {
            status: "in_progress",
          });
          await Job.findByIdAndUpdate(jobId, { status: "IN_PROGRESS" });
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
