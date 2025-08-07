import Joi from "joi";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { createHash } from "../utils/hash.js";

// Define the User schema
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
    image: {
      type: String,
      default: "https://i.ibb.co/pBFLMc0m/placeholder.jpg",
      minLength: 5,
      maxLength: 10000,
    },
    phone: {
      type: String,
      minLength: 5,
      maxLength: 255,
    },
    title: {
      type: String,
      minLength: 1,
      maxLength: 255,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    skills: [{ type: String, minLength: 1, maxLength: 255 }],
    languages: [{ type: String, minLength: 1, maxLength: 255 }],
    location: {
      type: String,
      minLength: 1,
      maxLength: 255,
    },
    about: {
      type: String,
      minLength: 100,
      maxLength: 10000,
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
    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
    },
    identityStatus: {
      type: String,
      enum: ["unverified", "verified"],
      default: "unverified",
    },
    isVerified: {
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
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      isAdmin: this.isAdmin,
      role: this.role,
      isVerified: this.isVerified,
    },
    process.env.JWT_KEY
  );
  return token;
};

// Create the User model
export const User = mongoose.model("User", userSchema);

// Joi validation for user registration
export const validateUser = (user) => {
  const schema = Joi.object({
    firstName: Joi.string().min(1).max(255).required().label("First Name"),
    lastName: Joi.string().min(1).max(255).required().label("Last Name"),
    email: Joi.string().min(5).max(255).email().required().label("Email"),
    role: Joi.string().valid("client", "freelancer").label("Role"),
    password: Joi.string().min(8).max(1000).required().label("Password"),
  });

  return schema.validate(user);
};

// Optional: Joi validation for user login
export const validateLogin = (credentials) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).email().required().label("Email"),
    password: Joi.string().min(8).max(1000).required().label("Password"),
  });

  return schema.validate(credentials);
};

// Add to your user validation file (where validateUser and validateLogin are defined)
export const validatePasswordChange = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required().min(8).label("Current Password"),
    newPassword: Joi.string().required().min(8).label("New Password"),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("newPassword"))
      .label("Confirm Password")
      .messages({
        "any.only": "Passwords do not match",
      }),
  });
  return schema.validate(data);
};
