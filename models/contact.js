import Joi from "joi";
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
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

export const Contact = mongoose.model("Contact", contactSchema);

export const validateContact = (contact) => {
  const schema = Joi.object({
    firstName: Joi.string().min(1).max(255).required().label("First Name"),
    lastName: Joi.string().min(1).max(255).required().label("Last Name"),
    email: Joi.string().min(5).max(255).email().required().label("Email"),
    message: Joi.string().min(20).max(800).required().label("Message"),
  });
  return schema.validate(contact);
};
