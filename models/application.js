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
    buyer: {
      type: String,
      require: true,
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
    buyer: Joi.string().required().label("Buyer"),
    jobId: Joi.string().required().label("Job"),
    attachments: Joi.string().uri(),
  });
  return schema.validate(application);
};
