import Joi from "joi";
import mongoose from "mongoose";

// Define the Order schema
const orderSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller ID is required"],
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer ID is required"],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
    },
    deliveryDate: {
      type: Date,
      required: [true, "Delivery date is required"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Delivery date must be in the future",
      },
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [5, "Amount must be at least $5"],
      max: [10000, "Amount cannot exceed $10,000"],
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Joi validation schema
export const orderJoiSchema = Joi.object({
  seller: Joi.string().required(),
  buyer: Joi.string().required(),
  job: Joi.string().required(),
  amount: Joi.number().min(5).max(10000).required(),
  deliveryDate: Joi.date().greater("now").required(),
});

// Create the Order model
export const Order = mongoose.model("Order", orderSchema);

// Validation function with proper typing
export const validateOrder = (order) => {
  return orderJoiSchema.validate(order);
};
