import mongoose from "mongoose";
import { PaymentMethod } from "./PaymentMethod.js";

const bankAccountSchema = new mongoose.Schema({
  accountHolderName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 50,
  },
  bankName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  routingNumber: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 20,
  },
  accountType: {
    type: String,
    enum: ["checking", "savings"],
    required: true,
  },
});

const BankAccount = PaymentMethod.discriminator("Bank", bankAccountSchema);

export { BankAccount };
