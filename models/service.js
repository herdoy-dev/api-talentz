import mongoose from "mongoose";
import Joi from "joi";

const serviceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 255,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 10000,
    },
    image: {
      type: String,
      trim: true,
      minLength: 5,
      maxLength: 10000,
    },
    details: [
      {
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 255,
      },
    ],
    tools: [
      {
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 255,
      },
    ],
    features: [
      {
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 255,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const validateService = (service) => {
  const schema = Joi.object({
    userId: Joi.string().required().label("User ID"),
    title: Joi.string().min(1).max(255).required().label("Title"),
    description: Joi.string().min(1).max(10000).required().label("Description"),
    image: Joi.string().uri().min(5).max(10000).allow("").label("Image URL"),
    details: Joi.array().items(Joi.string().min(1).max(255)).label("Details"),
    tools: Joi.array().items(Joi.string().min(1).max(255)).label("Tools"),
    features: Joi.array().items(Joi.string().min(1).max(255)).label("Features"),
  });

  return schema.validate(service, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });
};

export const Service = mongoose.model("Service", serviceSchema);
