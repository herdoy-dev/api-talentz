import mongoose from "mongoose";
import Joi from "joi";

// Define package label enum values
const PACKAGE_LABELS = {
  BASIC: "Basic",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

// Define the Package schema
const packageSchema = new mongoose.Schema(
  {
    serviceId: {
      type: String,
      required: [true, "Service ID is required"],
    },
    label: {
      type: String,
      enum: {
        values: Object.values(PACKAGE_LABELS),
        message: "Package label must be either Basic, Standard, or Premium",
      },
      required: [true, "Label is required"],
      trim: true,
    },
    features: [
      {
        type: String,
        minLength: [1, "Feature cannot be empty"],
        maxLength: [255, "Feature cannot exceed 255 characters"],
        trim: true,
        required: [true, "Feature is required"],
      },
    ],
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be at least 0"],
    },
  },
  {
    timestamps: true,
  }
);

// Create the Package model
export const Package = mongoose.model("Package", packageSchema);

// Validation function
export const validatePackage = (packageData) => {
  const schema = Joi.object({
    serviceId: Joi.string().required().messages({
      "string.empty": "Service ID is required",
      "any.required": "Service ID is required",
    }),
    label: Joi.string()
      .valid(...Object.values(PACKAGE_LABELS))
      .required()
      .messages({
        "string.empty": "Label is required",
        "any.only": "Package label must be either Basic, Standard, or Premium",
        "any.required": "Label is required",
      }),
    features: Joi.array()
      .items(Joi.string().min(1).max(255).required())
      .required()
      .messages({
        "array.base": "Features must be an array",
        "string.empty": "Feature cannot be empty",
        "string.min": "Feature must be at least 1 character long",
        "string.max": "Feature cannot exceed 255 characters",
        "any.required": "Features are required",
      }),
    price: Joi.number().required().min(0).messages({
      "number.base": "Price must be a number",
      "number.min": "Price must be at least 0",
      "any.required": "Price is required",
    }),
  });

  return schema.validate(packageData, { abortEarly: false });
};

// Export the enum values if needed elsewhere
export const PackageLabels = PACKAGE_LABELS;
