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
    console.log(chats);
    res.status(200).json(new Response(true, "Success", chats, chats.length));
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json(new Response(false, "Something went worn!"));
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const body = req.body;

    // Check if chat already exists in either direction
    const existingChat = await Chat.findOne({
      $or: [
        { buyer: req.user._id, seller: body.seller },
        { buyer: body.seller, seller: req.user._id },
      ],
    })
      .populate("seller", "firstName lastName image role")
      .populate("buyer", "firstName lastName image role");

    if (existingChat) {
      return res.status(200).send(existingChat);
    }

    const newChat = await Chat.create({ ...req.body, buyer: req.user._id });
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
      return res
        .status(404)
        .send(new Response(false, "The chat with the given ID was not found."));
    }

    const deletedChat = await Chat.findByIdAndDelete(_id);
    res.status(200).send(new Response(true, "Chat Deleted", deletedChat));
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json(new Response(false, "Something went worn!"));
  }
});

export default router;
