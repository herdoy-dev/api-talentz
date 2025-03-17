import Joi from "joi";
import mongoose, { Document, Schema, Model } from "mongoose";

// Define the Contact interface
interface IContact extends Document {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

// Define the Contact schema
const contactSchema: Schema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minLength: 1,
      maxLength: 255,
      required: true,
    },
    lastName: {
      type: String,
      minLength: 1,
      maxLength: 255,
      required: true,
    },
    email: {
      type: String,
      minLength: 5,
      maxLength: 255,
      required: true,
    },
    message: {
      type: String,
      minLength: 20,
      maxLength: 800,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Contact model
export const Contact: Model<IContact> = mongoose.model<IContact>(
  "Contact",
  contactSchema
);

// Define the Joi validation schema for a contact
export const validateContact = (contact: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}) => {
  const schema = Joi.object({
    firstName: Joi.string().min(1).max(255).required().label("First Name"),
    lastName: Joi.string().min(1).max(255).required().label("Last Name"),
    email: Joi.string().min(5).max(255).email().required().label("Email"),
    message: Joi.string().min(20).max(800).required().label("Message"),
  });

  return schema.validate(contact, {
    abortEarly: false, // Return all validation errors at once
    messages: {
      "string.min": "{#label} must be at least {#limit} characters long",
      "string.max": "{#label} must be at most {#limit} characters long",
      "string.email": "{#label} must be a valid email",
      "any.required": "{#label} is required",
    },
  });
};
