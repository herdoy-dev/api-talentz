import Joi from "joi";
import mongoose from "mongoose";

// Simple & Clean Job Schema
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minlength: 1,
      maxlength: 255,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      minlength: 300,
      maxlength: 10000,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      minlength: 1,
      maxlength: 255,
      required: true,
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["fixed", "hourly", "full-time"],
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    company: {
      type: String,
      minlength: 1,
      maxlength: 255,
      required: true,
      trim: true,
    },
    budgetAmount: { type: Number, required: true, min: 5, max: 10000 },
    budgetType: { type: String, enum: ["fixed", "custom"], required: true },
    requiredExperienceLevel: {
      type: String,
      enum: ["entry", "intermediate", "expert"],
      required: true,
    },
    requiredSkills: [{ type: String, minlength: 1, maxlength: 255 }],
    duration: {
      type: String,
      enum: ["large", "medium", "small"],
      required: true,
    },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);

// Basic but effective Joi validation
export const validateJob = (job) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    title: Joi.string().min(1).max(255).required(),
    location: Joi.string().min(1).max(255).required(),
    author: Joi.string().required(),
    description: Joi.string().min(300).max(10000).required(),
    jobType: Joi.string().valid("fixed", "hourly", "full-time").required(),
    category: Joi.string().required(),
    company: Joi.string().min(1).max(255).required(),
    budgetAmount: Joi.number().min(5).max(10000).required(),
    budgetType: Joi.string().valid("fixed", "custom").required(),
    requiredExperienceLevel: Joi.string()
      .valid("entry", "intermediate", "expert")
      .required(),
    requiredSkills: Joi.array().items(Joi.string().min(1).max(255)),
    duration: Joi.string().valid("large", "medium", "small").required(),
  });

  return schema.validate(job);
};

// Same for updates, but all fields optional
export const validateUpdatableJobData = (job) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255),
    author: Joi.string().required(),
    location: Joi.string().min(1).max(255),
    description: Joi.string().min(300).max(10000),
    jobType: Joi.string().valid("fixed", "hourly", "full-time"),
    category: Joi.string(),
    company: Joi.string().min(1).max(255),
    budgetAmount: Joi.number().min(5).max(10000),
    budgetType: Joi.string().valid("fixed", "custom"),
    requiredExperienceLevel: Joi.string().valid(
      "entry",
      "intermediate",
      "expert"
    ),
    requiredSkills: Joi.array().items(Joi.string().min(1).max(255)),
    duration: Joi.string().valid("large", "medium", "small"),
  });

  return schema.validate(job);
};
