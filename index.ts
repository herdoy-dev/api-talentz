import cors from "cors";
import express from "express";
import "express-async-errors";
import helmet from "helmet";
import auth from "./routes/auth";
import contacts from "./routes/contacts";
import users from "./routes/users";
import startServer from "./startup/start-server";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/contacts", contacts);
app.use("/api/users", users);
app.use("/api/auth", auth);

// Start server
startServer(app);
