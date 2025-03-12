import express from "express";
import logger from "./startup/logger.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.PORT || 5000;

app.listen(port, () => logger.info(`Listening on port ${port}`));
