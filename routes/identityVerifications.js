import express from "express";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";
import { Id } from "../models/Id.js";
import { KYC } from "../models/KYC.js";
import { Passport } from "../models/passport.js";
import Response from "../utils/Response.js";

const router = express.Router();

router.post("/id", auth, async (req, res) => {
  const user = req.user._id;

  const id = new Id({
    user,
    verificationType: "id",
    status: "pending",
    ...req.body,
  });

  await id.save();

  res
    .status(201)
    .json(new Response(true, "ID verification submitted successfully", id));
});

router.post("/passport", auth, async (req, res) => {
  const user = req.user._id;

  const passport = new Passport({
    user,
    verificationType: "passport",
    status: "pending",
    ...req.body,
  });

  await passport.save();

  res
    .status(201)
    .json(
      new Response(
        true,
        "Passport verification submitted successfully",
        passport
      )
    );
});

router.get("/", [auth, admin], async (req, res) => {
  const verifications = await KYC.find().select("-__v");

  res
    .status(200)
    .json(
      new Response(true, "Verifications retrieved successfully", verifications)
    );
});

router.get("/my", auth, async (req, res) => {
  const verifications = await KYC.find({
    user: req.user._id,
  }).select("-__v");

  res
    .status(200)
    .json(
      new Response(true, "Verifications retrieved successfully", verifications)
    );
});

export default router;
