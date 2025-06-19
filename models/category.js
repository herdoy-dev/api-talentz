import mongoose from "mongoose";
import Joi from "joi";

// Define the Contact schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 2,
      maxLength: 255,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Contact model
export const Category = mongoose.model("Category", categorySchema);

export const validateCategory = (category) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required().label("Name"),
  });
  return schema.validate(category);
};
