import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "./logger.js";

dotenv.config();

const port = process.env.PORT || 5000;

const startServer = async (app) => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    logger.info("Connected to MongoDB...");
    app.listen(port, () => logger.info(`Listening on port ${port}`));
  } catch (err) {
    logger.error("Could not connect to MongoDB", err);
    process.exit(1); // Exit the process if the database connection fails
  }
};

export default startServer;
