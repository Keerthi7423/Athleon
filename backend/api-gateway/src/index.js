"use strict";

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const services = require("./config/serviceRegistry");
const jwtAuth = require("./middleware/jwtAuth");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { createServiceProxy } = require("./routes/proxyRoutes");

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "api-gateway" });
});

app.use(jwtAuth);

app.use(services.auth.route, createServiceProxy(services.auth.target, "auth"));
app.use(services.fatigue.route, createServiceProxy(services.fatigue.target, "fatigue"));
app.use(services.emi.route, createServiceProxy(services.emi.target, "emi"));

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
