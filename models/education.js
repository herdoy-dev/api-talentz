import Joi from "joi";
import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      minLength: 1,
      maxLength: 255,
      required: true,
    },
    institution: {
      type: String,
      minLength: 1,
      maxLength: 255,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Education = mongoose.model("Education", educationSchema);

export const validateEducation = (education) => {
  const schema = Joi.object({
    degree: Joi.string().min(1).max(255).required().label("Degree"),
    institution: Joi.string().min(1).max(255).required().label("Institution"),
    startDate: Joi.date().required().label("Start Date"),
    endDate: Joi.date()
      .min(Joi.ref("startDate"))
      .allow(null)
      .label("End Date")
      .messages({
        "date.min": "End date must be after start date",
      }),
  });

  return schema.validate(education);
};
