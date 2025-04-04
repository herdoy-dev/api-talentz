import Joi from "joi";
import mongoose from "mongoose";

// Define the Job schema
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minLength: 1,
      maxLength: 255,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      minLength: 300,
      maxLength: 10000,
      required: true,
    },
    budget: {
      type: Number,
      min: 5,
      max: 10000,
    },
    type: {
      type: String,
      enum: ["fixed", "hourly"],
      required: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    requiredLevel: {
      type: String,
      enum: ["entry", "intermediate", "expert"],
      required: true,
    },
    jobLength: {
      type: String,
    },
    jobSize: {
      type: String,
      enum: ["large", "medium", "small"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Job model
export const Job = mongoose.model("Job", jobSchema);

// Define the Joi validation schema for a job
export const validateJob = (job) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).required().label("Title"),
    author: Joi.string().required().label("Author"),
    description: Joi.string()
      .min(300)
      .max(10000)
      .required()
      .label("Description"),
    budget: Joi.number().min(5).max(10000).label("Budget"),
    type: Joi.string().valid("fixed", "hourly").required().label("Type"),
    category: Joi.string().required().label("Category"),
    requiredLevel: Joi.string()
      .valid("entry", "intermediate", "expert")
      .required()
      .label("Required Level"),
    jobLength: Joi.string().label("Job Length"),
    jobSize: Joi.string()
      .valid("large", "medium", "small")
      .required()
      .label("Job Size"),
  });

  return schema.validate(job);
};

export const validateUpdatableData = (job) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).label("Title"),
    description: Joi.string().min(300).max(10000).label("Description"),
    budget: Joi.number().min(5).max(10000).label("Budget"),
    type: Joi.string().valid("fixed", "hourly").label("Type"),
    category: Joi.string().label("Category"),
    requiredLevel: Joi.string()
      .valid("entry", "intermediate", "expert")
      .label("Required Level"),
    jobLength: Joi.string().label("Job Length"),
    jobSize: Joi.string().valid("large", "medium", "small").label("Job Size"),
  });

  return schema.validate(job);
};
