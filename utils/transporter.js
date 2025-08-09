import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "support@findtalentz.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export default transporter;
