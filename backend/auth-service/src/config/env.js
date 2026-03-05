"use strict";

function getEnvVar(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

function getNumberEnvVar(name, fallback) {
  const raw = getEnvVar(name, fallback);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return parsed;
}

const config = {
  nodeEnv: getEnvVar("NODE_ENV", "development"),
  port: getNumberEnvVar("PORT", 4001),
  databaseUrl: getEnvVar("DATABASE_URL"),
  jwtSecret: getEnvVar("JWT_SECRET"),
  jwtExpiresIn: getEnvVar("JWT_EXPIRES_IN", "1d"),
  bcryptSaltRounds: getNumberEnvVar("BCRYPT_SALT_ROUNDS", 12),
  allowedOrigin: getEnvVar("ALLOWED_ORIGIN", "*")
};

module.exports = config;