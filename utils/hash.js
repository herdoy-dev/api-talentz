import bcrypt from "bcryptjs";
import logger from "../startup/logger.js";

export const createHash = async (password) => {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    logger.error("Error occurred when hashing your password", error);
    throw error;
  }
};

export const compareHash = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error("Error occurred when comparing password with hash", error);
    throw error;
  }
};
