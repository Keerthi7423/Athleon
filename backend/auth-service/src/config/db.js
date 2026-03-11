"use strict";

const { Pool } = require("pg");
const config = require("./env");

const isProduction = config.nodeEnv === "production";

const dbSsl = process.env.DB_SSL === "true" || (isProduction && process.env.DB_SSL !== "false");

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: dbSsl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on("error", (error) => {
  console.error("[db-pool-error]", error);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query
};