const db = require('../db');

const createUser = async ({ username, email, passwordHash }) => {
  const result = await db.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at, updated_at`,
    [username, email, passwordHash]
  );

  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await db.query(
    `SELECT id, username, email, password_hash, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await db.query(
    `SELECT id, username, email, created_at, updated_at
     FROM users
     ORDER BY id ASC`
  );

  return result.rows;
};

const getUserById = async (id) => {
  const result = await db.query(
    `SELECT id, username, email, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

const updateUser = async (id, { username, email, passwordHash }) => {
  const result = await db.query(
    `UPDATE users
     SET
      username = COALESCE($1, username),
      email = COALESCE($2, email),
      password_hash = COALESCE($3, password_hash),
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING id, username, email, created_at, updated_at`,
    [username, email, passwordHash, id]
  );

  return result.rows[0];
};

const deleteUser = async (id) => {
  const result = await db.query(
    `DELETE FROM users
     WHERE id = $1
     RETURNING id, username, email, created_at, updated_at`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createUser: createUser,
  findUserByEmail: findUserByEmail,
  getAllUsers: getAllUsers,
  getUserById: getUserById,
  updateUser: updateUser,
  deleteUser: deleteUser
};