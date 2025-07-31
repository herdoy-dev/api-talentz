import mongoose from "mongoose";
import { PaymentMethod } from "./PaymentMethod.js";

const paypalAccountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
});

export const PaypalAccount = PaymentMethod.discriminator(
  "Paypal",
  paypalAccountSchema
);
