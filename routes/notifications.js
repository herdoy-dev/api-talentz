import { Notification } from "../models/Notification.js";
import Response from "../utils/Response.js";
import auth from "../middlewares/auth.js";
import express from "express";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  }).populate("user", "firstName lastName");
  res.status(200).send(new Response(true, "Success", notifications));
});

router.put("/:_id", auth, async (req, res) => {
  const { _id } = req.params;
  const notification = await Notification.findByIdAndUpdate(_id, {
    ...req.body,
  });
  res.status(200).send(new Response(true, "Success", notification));
});

export default router;
