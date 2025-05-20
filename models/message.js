import mongoose from "mongoose";

// Define the Chat schema
const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 10000,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      minLength: 1,
      maxLength: 10000,
    },
    files: [
      {
        type: String,
        minLength: 1,
        maxLength: 10000,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create the Contact model
export const Message = mongoose.model("Message", messageSchema);
