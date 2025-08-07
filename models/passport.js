import mongoose from "mongoose";
import { KYC } from "./KYC.js";

const passportSchema = new mongoose.Schema({
  passportImage: {
    type: String,
    required: true,
  },
});

export const Passport = KYC.discriminator("Passport", passportSchema);
