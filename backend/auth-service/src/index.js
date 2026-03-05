"use strict";

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const config = require("./config/env");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { initSchema } = require("./db/init");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: config.allowedOrigin === "*" ? true : config.allowedOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok", service: "auth-service" });
});

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await db.query("SELECT 1");
    await initSchema();

    const server = app.listen(config.port, () => {
      console.log(`Auth service listening on port ${config.port}`);
    });

    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down auth service...`);
      server.close(async () => {
        await db.pool.end();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start auth service", error);
    process.exit(1);
  }
}

startServer();
