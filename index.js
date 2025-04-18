import cors from "cors";
import express from "express";
import "express-async-errors";
import helmet from "helmet";
import auth from "./routes/auth.js";
import categories from "./routes/categorys.js";
import contacts from "./routes/contacts.js";
import educations from "./routes/educations.js";
import jobs from "./routes/jobs.js";
import me from "./routes/me.js";
import portfolios from "./routes/portfolios.js";
import users from "./routes/users.js";
import startServer from "./startup/start-server.js";

const app = express();

// Middleware
app.use(cors());
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
app.use("/api/jobs", jobs);

// Start server
startServer(app);
