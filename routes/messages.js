import express from "express";
import auth from "../middlewares/auth.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import Response from "../utils/Response.js";
import { notifyNewMessage } from "../startup/start-server.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { chatId } = req.query;

  if (!chatId || typeof chatId !== "string") {
    return res
      .status(400)
      .json(new Response(true, "Valid chat ID is required"));
  }

  const messages = await Message.find({ chatId }).populate(
    "sender",
    "firstName lastName image"
  );

  res
    .status(200)
    .json(new Response(true, "Success", messages, messages.length));
});

router.post("/", auth, async (req, res) => {
  try {
    const body = req.body;
    const chat = await Chat.findById(body.chatId);
    if (!chat) return res.status(400).send(new Response(false, "Invalid Chat"));

    chat.lastMessage = body.message || "Files";
    await chat.save();

    const newMessage = await Message.create(body);

    // Identify receiver and notify them
    const receiverId =
      body.sender === chat.buyer.toString()
        ? chat.seller.toString()
        : chat.buyer.toString();

    notifyNewMessage({
      senderId: body.sender,
      receiverId,
      chatId: body.chatId,
    });

    res.status(201).send(new Response(true, "Success", newMessage));
  } catch (error) {
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

export default router;
