import mongoose from "mongoose";

const KYCSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verificationType: {
      type: String,
      enum: ["passport", "id"],
      required: true,
    },
    status: {
      type: String,
      enum: ["verified", "pending"],
    },
  },
  { timestamps: true }
);

export const KYC = mongoose.model("KYC", KYCSchema);
