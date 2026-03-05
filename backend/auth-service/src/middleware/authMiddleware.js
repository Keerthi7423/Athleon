"use strict";

const { verifyAccessToken } = require("../utils/jwt");

function extractBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "missing or invalid authorization header" });
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: Number(payload.sub),
      email: payload.email,
      name: payload.name
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}

module.exports = {
  requireAuth
};