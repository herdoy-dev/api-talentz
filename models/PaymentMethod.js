import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    methodType: {
      type: String,
      enum: ["bank", "paypal"],
      required: true,
    },
  },
  { timestamps: true }
);

export const PaymentMethod = mongoose.model(
  "PaymentMethod",
  paymentMethodSchema
);
