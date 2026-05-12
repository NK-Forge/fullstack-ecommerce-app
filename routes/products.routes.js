const express = require('express');
const productModel = require('../models/productModel');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await productModel.getAllProducts();

    res.status(200).json({
      products: products
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to get products',
      error: err.message
    });
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const product = await productModel.getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.status(200).json({
      product: product
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to get product',
      error: err.message
    });
  }
});

router.post('/', authMiddleware.requireAuth, async (req, res) => {
  const { name, description, price } = req.body || {};
  const inventoryQuantity = req.body.inventoryQuantity || req.body.inventory_quantity;

  if (!name || price === undefined || inventoryQuantity === undefined) {
    return res.status(400).json({
      message: 'Name, price, and inventoryQuantity are required'
    });
  }

  try {
    const newProduct = await productModel.createProduct({
      name: name,
      description: description,
      price: price,
      inventoryQuantity: inventoryQuantity
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to create product',
      error: err.message
    });
  }
});

router.put('/:id', authMiddleware.requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { name, description, price } = req.body || {};
  const inventoryQuantity = req.body.inventoryQuantity || req.body.inventory_quantity;

  try {
    const updatedProduct = await productModel.updateProduct(id, {
      name: name,
      description: description,
      price: price,
      inventoryQuantity: inventoryQuantity
    });

    if (!updatedProduct) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to update product',
      error: err.message
    });
  }
});

router.delete('/:id', authMiddleware.requireAuth, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const deletedProduct = await productModel.deleteProduct(id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.status(200).json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to delete product',
      error: err.message
    });
  }
});

module.exports = router;