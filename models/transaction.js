import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["deposit"] },
  amount: Number,
  status: { type: String, enum: ["pending", "completed", "failed"] },
  gatewayRef: String, // Stripe session ID
  createdAt: { type: Date, default: Date.now },
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
