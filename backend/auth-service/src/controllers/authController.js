"use strict";

const bcrypt = require("bcrypt");

const userModel = require("../models/userModel");
const config = require("../config/env");
const { generateAccessToken } = require("../utils/jwt");

function sanitizeRegistrationBody(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    const error = new Error("name, email and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (name.length < 2 || name.length > 120) {
    const error = new Error("name must be between 2 and 120 characters");
    error.statusCode = 400;
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = new Error("invalid email format");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8 || password.length > 72) {
    const error = new Error("password must be between 8 and 72 characters");
    error.statusCode = 400;
    throw error;
  }

  return { name, email, password };
}

function sanitizeLoginBody(body) {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    const error = new Error("email and password are required");
    error.statusCode = 400;
    throw error;
  }

  return { email, password };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = sanitizeRegistrationBody(req.body);

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      const error = new Error("email already in use");
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
    const user = await userModel.createUser({ name, email, passwordHash });
    const token = generateAccessToken(user);

    return res.status(201).json({
      message: "user registered successfully",
      token,
      user
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = sanitizeLoginBody(req.body);

    const user = await userModel.findByEmail(email);
    if (!user) {
      const error = new Error("invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      const error = new Error("invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const token = generateAccessToken(user);

    return res.status(200).json({
      message: "login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function profile(req, res, next) {
  try {
    const user = await userModel.findPublicById(req.user.id);
    if (!user) {
      const error = new Error("user not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  profile
};