import cors from "cors";
import express from "express";
import "express-async-errors";
import helmet from "helmet";
import applications from "./routes/applications.js";
import auth from "./routes/auth.js";
import categories from "./routes/categorys.js";
import chats from "./routes/chats.js";
import comments from "./routes/comments.js";
import contacts from "./routes/contacts.js";
import educations from "./routes/educations.js";
import jobs from "./routes/jobs.js";
import messages from "./routes/messages.js";
import orders from "./routes/orders.js";
import packages from "./routes/packages.js";
import portfolios from "./routes/portfolios.js";
import services from "./routes/services.js";
import talents from "./routes/talents.js";
import users from "./routes/users.js";
import webhook from "./routes/webhook.js";
import startServer from "./startup/start-server.js";

import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use("/api/webhook", webhook);

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/contacts", contacts);
app.use("/api/users", users);
app.use("/api/educations", educations);
app.use("/api/portfolios", portfolios);
app.use("/api/auth", auth);
app.use("/api/categorys", categories);
app.use("/api/services", services);
app.use("/api/packages", packages);
app.use("/api/jobs", jobs);
app.use("/api/comments", comments);
app.use("/api/applications", applications);
app.use("/api/chats", chats);
app.use("/api/messages", messages);
app.use("/api/talents", talents);
app.use("/api/orders", orders);

// Start server
startServer(app);
