import mongoose from "mongoose";

// Define the Chat schema
const chatSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Contact model
export const Chat = mongoose.model("Chat", chatSchema);
