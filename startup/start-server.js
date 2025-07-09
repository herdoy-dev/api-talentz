import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import logger from "./logger.js";

dotenv.config();

const port = process.env.PORT || 5000;

// In-memory map to store connected users (userId => socketId)
const connectedUsers = new Map();

let io = null; // Will hold our Socket.IO server instance

export const notifyNewMessage = ({ senderId, receiverId, chatId }) => {
  const receiverSocketId = connectedUsers.get(receiverId);
  if (receiverSocketId && io) {
    io.to(receiverSocketId).emit("new_message", {
      senderId,
      chatId,
    });
    logger.info(
      `📨 Notified user ${receiverId} of new message in chat ${chatId}`
    );
  }
};

const startServer = async (app) => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    logger.info("✅ Connected to MongoDB...");

    const server = http.createServer(app);

    // Setup Socket.IO
    io = new Server(server, {
      cors: {
        origin: process.env.ORIGIN, // Match with your frontend origin
        credentials: true,
      },
    });

    // Optional: Auth middleware using JWT token
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));

      try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error("Invalid token"));
      }
    });

    io.on("connection", (socket) => {
      const userId = socket.user._id;
      connectedUsers.set(userId, socket.id);

      logger.info(`🔌 User connected: ${userId}`);

      socket.on("disconnect", () => {
        connectedUsers.delete(userId);
        logger.info(`❌ User disconnected: ${userId}`);
      });
    });

    server.listen(port, () => {
      logger.info(`🚀 Server is running on port ${port}`);
    });
  } catch (err) {
    logger.error("❌ Could not connect to MongoDB", err);
    process.exit(1);
  }
};

export default startServer;
