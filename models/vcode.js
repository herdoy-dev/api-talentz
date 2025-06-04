import mongoose from "mongoose";

// Define the Contact schema
const vcodeSchema = new mongoose.Schema(
  {
    code: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Contact model
export const Vcode = mongoose.model("Vcode", vcodeSchema);
