"use strict";

const { Pool } = require("pg");
const config = require("./env");

const isProduction = config.nodeEnv === "production";

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
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