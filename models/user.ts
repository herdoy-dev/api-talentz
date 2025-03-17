import Joi from "joi";
import jwt from "jsonwebtoken";
import mongoose, { Document, Schema, Model } from "mongoose";
import { createHash } from "../utils/hash";

// Define the User interface
interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
  generateAuthToken(): string;
}

// Define the User schema
const userSchema: Schema = new mongoose.Schema(
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
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await createHash(this.password);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Generate authentication token
userSchema.methods.generateAuthToken = function (): string {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_KEY as string,
    { expiresIn: "1h" }
  );
  return token;
};

// Create the User model
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

// Define the Joi validation schema for a user
export const validateUser = (user: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
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
