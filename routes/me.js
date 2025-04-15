import express from "express";
import auth from "../middlewares/auth.js";
import { User } from "../models/user.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).send("User not found");
  }

  res.status(200).send(user);
});

export default router;
