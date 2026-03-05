"use strict";

const db = require("../config/db");

async function findByEmail(email) {
  const query = `
    SELECT id, name, email, password_hash, created_at, updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const { rows } = await db.query(query, [email]);
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash }) {
  const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at, updated_at
  `;

  const { rows } = await db.query(query, [name, email, passwordHash]);
  return rows[0];
}

async function findPublicById(id) {
  const query = `
    SELECT id, name, email, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0] || null;
}

module.exports = {
  findByEmail,
  createUser,
  findPublicById
};