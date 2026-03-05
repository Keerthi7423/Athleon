"use strict";

const jwt = require("jsonwebtoken");
const config = require("../config/env");

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = {
  generateAccessToken,
  verifyAccessToken
};