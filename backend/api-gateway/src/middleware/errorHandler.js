"use strict";

function notFoundHandler(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message;

  if (statusCode >= 500) {
    console.error("[gateway-error]", {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method
    });
  }

  res.status(statusCode).json({ error: message });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
