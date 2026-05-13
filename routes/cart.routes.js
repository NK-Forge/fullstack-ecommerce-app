const express = require('express');
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/:userId',
  authMiddleware.requireAuth,
  authMiddleware.requireSameUser('userId'),
  async (req, res) => {
    const userId = Number(req.params.userId);

    try {
      const cart = await cartModel.getCartByUserId(userId);

      res.status(200).json({
        cart: cart.cart,
        items: cart.items
      });
    } catch (err) {
      res.status(500).json({
        message: 'Unable to get cart',
        error: err.message
      });
    }
  }
);

router.post(
  '/:userId/items',
  authMiddleware.requireAuth,
  authMiddleware.requireSameUser('userId'),
  async (req, res) => {
    const userId = Number(req.params.userId);
    const { productId, quantity } = req.body || {};

    if (!productId || !quantity) {
      return res.status(400).json({
        message: 'ProductId and quantity are required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: 'Quantity must be greater than zero'
      });
    }

    try {
      const product = await productModel.getProductById(productId);

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      const cartItem = await cartModel.addItemToCart({
        userId: userId,
        productId: productId,
        quantity: quantity
      });

      res.status(201).json({
        message: 'Item added to cart',
        item: cartItem
      });
    } catch (err) {
      res.status(500).json({
        message: 'Unable to add item to cart',
        error: err.message
      });
    }
  }
);

router.put(
  '/:userId/items/:productId',
  authMiddleware.requireAuth,
  authMiddleware.requireSameUser('userId'),
  async (req, res) => {
    const userId = Number(req.params.userId);
    const productId = Number(req.params.productId);
    const { quantity } = req.body || {};

    if (!quantity) {
      return res.status(400).json({
        message: 'Quantity is required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: 'Quantity must be greater than zero'
      });
    }

    try {
      const updatedItem = await cartModel.updateCartItem({
        userId: userId,
        productId: productId,
        quantity: quantity
      });

      if (!updatedItem) {
        return res.status(404).json({
          message: 'Cart item not found'
        });
      }

      res.status(200).json({
        message: 'Cart item updated successfully',
        item: updatedItem
      });
    } catch (err) {
      res.status(500).json({
        message: 'Unable to update cart item',
        error: err.message
      });
    }
  }
);

router.delete(
  '/:userId/items/:productId',
  authMiddleware.requireAuth,
  authMiddleware.requireSameUser('userId'),
  async (req, res) => {
    const userId = Number(req.params.userId);
    const productId = Number(req.params.productId);

    try {
      const removedItem = await cartModel.removeCartItem({
        userId: userId,
        productId: productId
      });

      if (!removedItem) {
        return res.status(404).json({
          message: 'Cart item not found'
        });
      }

      res.status(200).json({
        message: 'Cart item removed successfully',
        item: removedItem
      });
    } catch (err) {
      res.status(500).json({
        message: 'Unable to remove cart item',
        error: err.message
      });
    }
  }
);

router.delete(
  '/:userId',
  authMiddleware.requireAuth,
  authMiddleware.requireSameUser('userId'),
  async (req, res) => {
    const userId = Number(req.params.userId);

    try {
      const removedItems = await cartModel.clearCart(userId);

      res.status(200).json({
        message: 'Cart cleared successfully',
        items: removedItems
      });
    } catch (err) {
      res.status(500).json({
        message: 'Unable to clear cart',
        error: err.message
      });
    }
  }
);

module.exports = router;