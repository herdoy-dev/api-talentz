import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "./logger";
import { Application } from "express";

dotenv.config();

const port = process.env.PORT || 5000;

const startServer = async (app: Application): Promise<void> => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    logger.info("Connected to MongoDB...");

    app.listen(port, () => {
      logger.info(`Listening on port ${port}`);
    });
  } catch (err) {
    logger.error("Could not connect to MongoDB", err);
    process.exit(1);
  }
};

export default startServer;
