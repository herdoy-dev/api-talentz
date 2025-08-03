import express from "express";
import orderCongratulationsEmail from "../mails/orderCongratulationsEmail.js";
import { Job } from "../models/job.js";
import { Transaction } from "../models/transaction.js";
import { User } from "../models/user.js";
import stripe from "../utils/stripe.js";
import transporter from "../utils/transporter.js";

const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    ``;

    if (!sig) {
      return res.status(400).send("Stripe signature missing");
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { transactionId, jobId, seller, amount, deliveryDate } =
          session.metadata || {};

        if (!transactionId || !jobId || !seller) {
          console.error("Missing metadata in session:", session);
          return res.status(400).send("Missing required metadata");
        }

        // Update transaction status
        await Transaction.findByIdAndUpdate(transactionId, {
          status: "completed",
          gatewayRef: session.id,
        });

        // Update job and get populated author
        const job = await Job.findByIdAndUpdate(
          jobId,
          {
            status: "IN_PROGRESS",
            seller,
            budgetAmount: amount,
            deliveryDate,
          },
          { new: true }
        ).populate("author", "firstName lastName");

        if (!job) {
          console.error("Job not found:", jobId);
          return res.status(404).send("Job not found");
        }

        // Get seller details
        const user = await User.findById(seller);
        if (!user) {
          console.error("User not found:", seller);
          return res.status(404).send("User not found");
        }

        // Send congratulation email
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || "herdoy.dev@gmail.com",
            to: user.email,
            subject: "Congratulations! You Got a New Job",
            html: orderCongratulationsEmail(
              `${user.firstName} ${user.lastName}`,
              `${job.author.firstName} ${job.author.lastName}`,
              job.title
            ),
          });
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
        }
      }

      return res.status(200).send();
    } catch (err) {
      console.error("Webhook error:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
