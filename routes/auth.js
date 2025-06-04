import express from "express";
import _ from "lodash";
import signupCode from "../mails/signupCode.js";
import auth from "../middlewares/auth.js";
import { User, validateLogin, validateUser } from "../models/user.js";
import { Vcode } from "../models/vcode.js";
import generateCode from "../utils/code.js";
import { compareHash } from "../utils/hash.js";
import transporter from "../utils/transporter.js";

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

  const code = generateCode();

  await transporter.sendMail({
    from: "herdoy.dev@gmail.com",
    to: email,
    subject: `Your verification code is ${code}`,
    text: "Hello world?",
    html: signupCode(code),
  });

  await Vcode.create({
    code,
    email,
  });

  // Generate token and send response
  const token = newUser.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send({
      user: _.pick(newUser, ["_id", "firstName", "lastName", "email"]),
      value: token,
      role: newUser.role,
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
  res.status(200).send({ value: token, role: user.role });
});

router.post("/verify", auth, async (req, res) => {
  const { email, code } = req.body;
  const getCode = await Vcode.findOne({ email, code });
  if (!getCode)
    return res.json({ success: false, message: "Invalid Verification Code" });
  await User.findOneAndUpdate({ email }, { isVerified: true });
  await Vcode.findByIdAndDelete(getCode._id);
  return res.json({ success: true, message: "Email Verification Completed" });
});

router.post("/vcode/resend", auth, async (req, res) => {
  const { email } = req.body;
  const getCode = await Vcode.findOne({ email });
  await Vcode.findByIdAndDelete(getCode._id);
  const code = generateCode();
  await Vcode.create({
    code,
    email,
  });

  await transporter.sendMail({
    from: "herdoy.dev@gmail.com",
    to: email,
    subject: `Your verification code is ${code}`,
    text: "Hello world?",
    html: signupCode(code),
  });

  return res.json({ success: true, message: "Verification Code Resended" });
});

export default router;
