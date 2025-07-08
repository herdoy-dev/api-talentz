import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      min: 30,
      max: 10000,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    paymentMethod: {
      type: String,
      enum: ["BANK", "PAYPAL", "PAYONEER"],
      require: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

export const Withdraw = mongoose.model("Withdraw", withdrawSchema);
