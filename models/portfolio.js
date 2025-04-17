import Joi from "joi";
import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      minLength: 1,
      maxLength: 255,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      minLength: 1,
      maxLength: 10000,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      minLength: 1,
      maxLength: 255,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      minLength: 5,
      maxLength: 10000,
      trim: true,
    },
    skills: [
      {
        type: String,
        minLength: 1,
        maxLength: 255,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export const validatePortfolio = (portfolio) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).required().label("Title"),
    description: Joi.string().min(1).max(10000).required().label("Description"),
    role: Joi.string().min(1).max(255).required().label("Role"),
    image: Joi.string().min(5).max(10000).uri().allow("").label("Image URL"),
    skills: Joi.array().items(Joi.string().min(1).max(255)).label("Skills"),
  });

  return schema.validate(portfolio, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });
};
