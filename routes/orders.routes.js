const express = require('express');
const orderModel = require('../models/orderModel');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/:userId',
  authMiddleware.requireAuth,
  authMiddleware.requireSameUser('userId'),
  async (req, res) => {
    const userId = Number(req.params.userId);

    try {
      const order = await orderModel.createOrderFromCart(userId);

      if (order.error) {
        return res.status(400).json({
          message: order.error
        });
      }

      res.status(201).json({
        message: 'Order created successfully',
        order: order
      });
    } catch (err) {
      res.status(500).json({
        message: 'Unable to create order',
        error: err.message
      });
    }
  }
);

router.get('/', authMiddleware.requireAuth, async (req, res) => {
  try {
    const orders = await orderModel.getAllOrders();

    res.status(200).json({
      orders: orders
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to get orders',
      error: err.message
    });
  }
});

router.get(
  '/user/:userId',
  authMiddleware.requireAuth,
  authMiddleware.requireSameUser('userId'),
  async (req, res) => {
    const userId = Number(req.params.userId);

    try {
      const orders = await orderModel.getOrdersByUserId(userId);

      res.status(200).json({
        orders: orders
      });
    } catch (err) {
      res.status(500).json({
        message: 'Unable to get user orders',
        error: err.message
      });
    }
  }
);

router.get('/:id', authMiddleware.requireAuth, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const order = await orderModel.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.status(200).json({
      order: order
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to get order',
      error: err.message
    });
  }
});

router.put('/:id', authMiddleware.requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({
      message: 'Status is required'
    });
  }

  try {
    const updatedOrder = await orderModel.updateOrderStatus(id, status);

    if (!updatedOrder) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.status(200).json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to update order',
      error: err.message
    });
  }
});

router.delete('/:id', authMiddleware.requireAuth, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const deletedOrder = await orderModel.deleteOrder(id);

    if (!deletedOrder) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.status(200).json({
      message: 'Order deleted successfully',
      order: deletedOrder
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to delete order',
      error: err.message
    });
  }
});

module.exports = router;