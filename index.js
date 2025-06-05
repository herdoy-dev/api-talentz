import cors from "cors";
import express from "express";
import "express-async-errors";
import helmet from "helmet";
import applications from "./routes/applications.js";
import auth from "./routes/auth.js";
import balances from "./routes/balances.js";
import categories from "./routes/categorys.js";
import chats from "./routes/chats.js";
import comments from "./routes/comments.js";
import contacts from "./routes/contacts.js";
import educations from "./routes/educations.js";
import jobs from "./routes/jobs.js";
import me from "./routes/me.js";
import messages from "./routes/messages.js";
import packages from "./routes/packages.js";
import portfolios from "./routes/portfolios.js";
import services from "./routes/services.js";
import talents from "./routes/talents.js";
import users from "./routes/users.js";
import startServer from "./startup/start-server.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://talentz.netlify.app",
      "https://findtalentz.com",
    ],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/contacts", contacts);
app.use("/api/users", users);
app.use("/api/educations", educations);
app.use("/api/portfolios", portfolios);
app.use("/api/me", me);
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
app.use("/api/balances", balances);

// Start server
startServer(app);
