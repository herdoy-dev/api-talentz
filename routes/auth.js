import express from "express";
import signupCode from "../mails/signupCode.js";
import auth from "../middlewares/auth.js";
import {
  User,
  validateLogin,
  validateUser,
  validatePasswordChange,
} from "../models/user.js";
import { Vcode } from "../models/vcode.js";
import generateCode from "../utils/code.js";
import { compareHash } from "../utils/hash.js";
import Response from "../utils/Response.js";
import transporter from "../utils/transporter.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Sign-up route
router.post("/sign-up", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { firstName, lastName, email, role, password } = req.body;

  // Check if user already exists
  const isExist = await User.findOne({ email });
  if (isExist)
    return res.status(409).send(new Response(false, "User already exists!"));

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

  return res.status(200).json(new Response(true, "Signup Success", token));
});

// Log-in route
router.post("/log-in", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error)
    return res.status(400).send(new Response(false, error.details[0].message));

  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).send(new Response(false, "Invalid credentials"));

  // Compare passwords
  const checkPassword = await compareHash(password, user.password);
  if (!checkPassword)
    return res.status(401).send(new Response(false, "Invalid credentials"));

  // Generate token and send response
  const token = user.generateAuthToken();

  return res.status(200).json(new Response(true, "Login success", token));
});

router.post("/verify", auth, async (req, res) => {
  const { email, code } = req.body;
  const getCode = await Vcode.findOne({ email, code });
  if (!getCode) {
    return res.json(new Response(false, "Invalid Verification Code"));
  } else {
    await User.findOneAndUpdate({ email: getCode.email }, { isVerified: true });
    await Vcode.findByIdAndDelete(getCode._id);
    return res.json(new Response(true, "Email Verification Completed"));
  }
});

router.post("/vcode/resend", auth, async (req, res) => {
  const { email } = req.body;
  const getCode = await Vcode.findOne({ email });
  if (!getCode) {
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

    return res.json(new Response(true, "Verification Code Resended"));
  } else {
    const code = generateCode();
    await Vcode.findByIdAndDelete(getCode._id);
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
    return res.json(new Response(true, "Verification Code Resended"));
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.status(404).send("User not found");
  }

  res.status(200).send(new Response(true, "Success", user));
});

router.post("/change-password", auth, async (req, res) => {
  try {
    // Validate request body
    const { error } = validatePasswordChange(req.body);
    if (error) {
      return res
        .status(400)
        .send(new Response(false, error.details[0].message));
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send(new Response(false, "User not found"));
    }

    // Verify current password
    const isPasswordValid = await compareHash(currentPassword, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .send(new Response(false, "Current password is incorrect"));
    }

    // Check if new password is different
    if (currentPassword === newPassword) {
      return res
        .status(400)
        .send(
          new Response(
            false,
            "New password must be different from current password"
          )
        );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send success response
    return res
      .status(200)
      .send(new Response(true, "Password changed successfully"));
  } catch (error) {
    console.error("Password change error:", error);
    return res.status(500).send(new Response(false, "Internal server error"));
  }
});

export default router;
