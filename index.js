import cors from "cors";
import express from "express";
import helmet from "helmet";
import contacts from "./routes/contacts.js";
import startServer from "./startup/start-server.js";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/contacts", contacts);

// Start server
startServer(app);
