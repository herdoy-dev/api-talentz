import express from "express";
import auth from "../middlewares/auth.js";
import { Chat } from "../models/chat.js";
import Response from "../utils/Response.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    })
      .populate("seller", "firstName lastName image role")
      .populate("buyer", "firstName lastName image role");
    res.status(200).json(new Response(true, "Success", chats, chats.length));
  } catch (error) {
    res.status(500).json(new Response(false, "Something went worn!"));
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { seller, buyer } = req.body;
    const currentUserId = req.user._id;

    // Check if a chat already exists between the two users
    const existingChat = await Chat.findOne({
      $or: [
        { buyer: currentUserId, seller },
        { buyer: seller, seller: currentUserId },
        { buyer, seller: currentUserId },
        { buyer: currentUserId, seller: buyer },
      ],
    })
      .populate("seller", "firstName lastName image role")
      .populate("buyer", "firstName lastName image role");

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // Create new chat - ensure one participant is always the current user
    const newChatData = {
      seller: seller || currentUserId,
      buyer: buyer || currentUserId,
    };

    // Make sure we're not creating a chat with the same user
    if (newChatData.seller.toString() === newChatData.buyer.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot create a chat with yourself",
      });
    }

    const newChat = await Chat.create(newChatData);

    const populatedChat = await Chat.findById(newChat._id)
      .populate("seller", "firstName lastName image role")
      .populate("buyer", "firstName lastName image role");

    return res.status(201).json(populatedChat);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the chat.",
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const chat = await Chat.findById(_id);

    if (!chat) {
      return res
        .status(404)
        .send(new Response(false, "The chat with the given ID was not found."));
    }

    const deletedChat = await Chat.findByIdAndDelete(_id);
    res.status(200).send(new Response(true, "Chat Deleted", deletedChat));
  } catch (error) {
    res.status(500).json(new Response(false, "Something went worn!"));
  }
});

export default router;
