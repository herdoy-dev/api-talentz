import Joi from "joi";
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      minLength: 2,
      maxLength: 1000,
      required: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    attachments: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Application = mongoose.model("Application", applicationSchema);

export const validateApplication = (application) => {
  const schema = Joi.object({
    message: Joi.string().min(2).max(1000).required().label("Message"),
    jobId: Joi.string().required().label("Job"),
    author: Joi.string().required().label("Author"),
  });
  return schema.validate(application);
};
