import express from "express";
import _ from "lodash";
import { User, validateLogin, validateUser } from "../models/user.js";
import { compareHash } from "../utils/hash.js";

const router = express.Router();

// Sign-up route
router.post("/sign-up", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { firstName, lastName, email, role, password } = req.body;

  // Check if user already exists
  const isExist = await User.findOne({ email });
  if (isExist) return res.status(409).send("User already exists!");

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    role,
    password,
  });

  // Generate token and send response
  const token = newUser.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send({
      user: _.pick(newUser, ["_id", "firstName", "lastName", "email"]),
      token,
    });
});

// Log-in route
router.post("/log-in", async (req, res) => {
  const { error } = validateLogin(req.body);
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
  res.status(200).send(token);
});

export default router;
