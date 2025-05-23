import Joi from "joi";
import mongoose from "mongoose";

// Define the Contact schema
const balanceSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create the Contact model
export const Balance = mongoose.model("Balance", balanceSchema);

export const validateBalance = (balance) => {
  const schema = Joi.object({
    balance: Joi.number().min(20).required().label("Balance"),
  });
  return schema.validate(balance);
};
