import express from "express";
import auth from "../middlewares/auth.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { chatId } = req.query;

  if (!chatId || typeof chatId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Valid chat ID is required",
    });
  }

  const messages = await Message.find({ chatId }).populate(
    "sender",
    "firstName lastName image"
  );

  res.status(200).json({
    result: messages,
    count: messages.length,
  });
});

router.post("/", auth, async (req, res) => {
  try {
    const body = req.body;
    const chat = await Chat.findById(body.chatId);
    if (!chat) return res.status(400).send("Invalid Chat");

    chat.lastMessage = body.message || "";
    await chat.save();

    const newMessage = await Message.create(body);
    res.status(201).send(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
