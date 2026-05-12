const db = require('../db');

const getAllProducts = async () => {
  const result = await db.query(
    `SELECT id, name, description, price, inventory_quantity, created_at, updated_at
     FROM products
     ORDER BY id ASC`
  );

  return result.rows;
};

const getProductById = async (id) => {
  const result = await db.query(
    `SELECT id, name, description, price, inventory_quantity, created_at, updated_at
     FROM products
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

const createProduct = async ({ name, description, price, inventoryQuantity }) => {
  const result = await db.query(
    `INSERT INTO products (name, description, price, inventory_quantity)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, price, inventory_quantity, created_at, updated_at`,
    [name, description, price, inventoryQuantity]
  );

  return result.rows[0];
};

const updateProduct = async (id, { name, description, price, inventoryQuantity }) => {
  const result = await db.query(
    `UPDATE products
     SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      price = COALESCE($3, price),
      inventory_quantity = COALESCE($4, inventory_quantity),
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING id, name, description, price, inventory_quantity, created_at, updated_at`,
    [name, description, price, inventoryQuantity, id]
  );

  return result.rows[0];
};

const deleteProduct = async (id) => {
  const result = await db.query(
    `DELETE FROM products
     WHERE id = $1
     RETURNING id, name, description, price, inventory_quantity, created_at, updated_at`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  getAllProducts: getAllProducts,
  getProductById: getProductById,
  createProduct: createProduct,
  updateProduct: updateProduct,
  deleteProduct: deleteProduct
};