import Joi from "joi";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { createHash } from "../utils/hash.js";

const userSchema = new mongoose.Schema(
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
      unique: true,
      index: true,
      required: true,
    },
    password: {
      type: String,
      minLength: 8,
      maxLength: 1000,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await createHash(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate authentication token
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_KEY,
    { expiresIn: "1h" }
  );
  return token;
};

export const User = mongoose.model("User", userSchema);

export const validateUser = (user) => {
  const schema = Joi.object({
    firstName: Joi.string().min(1).max(255).required().label("First Name"),
    lastName: Joi.string().min(1).max(255).required().label("Last Name"),
    email: Joi.string().min(5).max(255).email().required().label("Email"),
    password: Joi.string().min(8).max(1000).required().label("Password"),
  });

  return schema.validate(user, {
    abortEarly: false, // Return all validation errors at once
    messages: {
      "string.min": "{#label} must be at least {#limit} characters long",
      "string.max": "{#label} must be at most {#limit} characters long",
      "string.email": "{#label} must be a valid email",
      "any.required": "{#label} is required",
    },
  });
};
