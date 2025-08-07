import mongoose from "mongoose";
import { KYC } from "./KYC.js";

const idSchema = new mongoose.Schema({
  frontImage: {
    type: String,
    required: true,
  },
  backImage: {
    type: String,
    required: true,
  },
});

export const Id = KYC.discriminator("Id", idSchema);
