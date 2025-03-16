import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import contacts from "./routes/contacts.js";
import logger from "./startup/logger.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/contacts", contacts);

const port = process.env.PORT || 5000;
app.listen(port, () => logger.info(`Listening on port ${port}`));

mongoose
  .connect("mongodb://localhost:27017/talentz")
  .then(() => logger.info("Connected to MongoDB..."))
  .catch((err) => logger.error("Could not connect to MongoDB", err));
