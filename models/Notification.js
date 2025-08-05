import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      minLength: 2,
      maxLength: 255,
      required: true,
    },
    description: {
      type: String,
      minLength: 2,
      maxLength: 1000,
      required: true,
    },
    status: {
      type: String,
      enum: ["Read", "Unread"],
      default: "Unread",
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
