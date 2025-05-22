import express from "express";
import auth from "../middlewares/auth.js";
import { Chat } from "../models/chat.js";

const router = express.Router();

router.get("/seller", auth, async (req, res) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Valid userId ID is required",
    });
  }

  const chats = await Chat.find({ seller: userId }).populate(
    "buyer",
    "firstName lastName image"
  );

  res.status(200).json({
    result: chats,
    count: chats.length,
  });
});

router.get("/buyer", auth, async (req, res) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Valid userId ID is required",
    });
  }

  const chats = await Chat.find({ buyer: userId }).populate(
    "seller",
    "firstName lastName image"
  );

  res.status(200).json({
    result: chats,
    count: chats.length,
  });
});

router.post("/", auth, async (req, res) => {
  const body = req.body;
  const ifExist = await Chat.findOne({
    seller: body.seller,
    buyer: body.buyer,
  }).populate("seller", "firstName lastName image");
  if (ifExist) return res.status(200).send(ifExist);
  const newChat = await Chat.create(body).populate(
    "seller",
    "firstName lastName image"
  );
  res.status(201).send(newChat);
});

router.delete("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const chat = await Chat.findById(_id);
  if (!chat)
    return res.status(404).send("The chat with the given ID was not found.");

  const deletedChat = await Chat.findByIdAndDelete(_id);
  res.status(200).send(deletedChat);
});

export default router;
