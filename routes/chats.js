import express from "express";
import auth from "../middlewares/auth.js";
import { Chat } from "../models/chat.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid userId ID is required",
      });
    }

    const chats = await Chat.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("seller", "firstName lastName image role")
      .populate("buyer", "firstName lastName image role");

    res.status(200).json({
      result: chats,
      count: chats.length,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
    });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const body = req.body;

    // Check if chat already exists in either direction
    const existingChat = await Chat.findOne({
      $or: [
        { buyer: body.buyer, seller: body.seller },
        { buyer: body.seller, seller: body.buyer },
      ],
    })
      .populate("seller", "firstName lastName image role")
      .populate("buyer", "firstName lastName image role");

    if (existingChat) {
      return res.status(200).send(existingChat);
    }

    const newChat = await Chat.create(body);
    const populatedChat = await Chat.findById(newChat._id)
      .populate("seller", "firstName lastName image role")
      .populate("buyer", "firstName lastName image role");

    res.status(201).send(populatedChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create chat",
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const chat = await Chat.findById(_id);

    if (!chat) {
      return res.status(404).send("The chat with the given ID was not found.");
    }

    const deletedChat = await Chat.findByIdAndDelete(_id);
    res.status(200).send(deletedChat);
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete chat",
    });
  }
});

export default router;
