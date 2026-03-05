"use strict";

function notFoundHandler(req, res, next) {
  return res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const statusCode = Number(err.statusCode) || 500;
  const isProd = process.env.NODE_ENV === "production";
  const message = isProd && statusCode >= 500 ? "Internal server error" : err.message;

  if (statusCode >= 500) {
    console.error("[auth-service-error]", {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method
    });
  }

  return res.status(statusCode).json({ error: message });
}

module.exports = {
  notFoundHandler,
  errorHandler
};