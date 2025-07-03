import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      minLength: 2,
      maxLength: 1000,
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    reqTime: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Delivery date must be in the future",
      },
    },
    reqFund: {
      type: Number,
      min: [5, "Amount must be at least $5"],
      max: [10000, "Amount cannot exceed $10,000"],
    },
    reqType: {
      type: String,
      enum: ["comment", "request_fund", "request_time", "delivery"],
      default: "comment",
    },
    status: {
      type: String,
      enum: ["pending", "approve", "cancel"],
      default: "pending",
    },
    attachments: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model("Comment", commentSchema);
