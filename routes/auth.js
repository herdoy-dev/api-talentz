import express from "express";
import Joi from "joi";
import _ from "lodash";
import { User, validateUser } from "../models/user.js";
import logger from "../startup/logger.js";
import { compareHash } from "../utils/hash.js";

const router = express.Router();

// Validate login data
const validateLoginData = (user) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).email().required().label("Email"),
    password: Joi.string().min(8).max(1000).required().label("Password"),
  });
  return schema.validate(user);
};

// Sign-up route
router.post("/sign-up", async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const isExist = await User.findOne({ email });
    if (isExist) return res.status(409).send("User already exists!");

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    // Generate token and send response
    const token = newUser.generateAuthToken();
    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send({
        user: _.pick(newUser, ["_id", "firstName", "lastName", "email"]),
        token,
      });
  } catch (error) {
    logger.error("Error during sign-up:", error);
    return res.status(500).send("An unexpected error occurred!");
  }
});

// Log-in route
router.post("/log-in", async (req, res) => {
  try {
    const { error } = validateLoginData(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send("Invalid credentials");

    // Compare passwords
    const checkPassword = await compareHash(password, user.password);
    if (!checkPassword) return res.status(401).send("Invalid credentials");

    // Generate token and send response
    const token = user.generateAuthToken();
    return res.status(200).send({ token });
  } catch (error) {
    logger.error("Error during log-in:", error);
    return res.status(500).send("An unexpected error occurred!");
  }
});

export default router;
