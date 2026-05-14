const express = require('express');
const Stripe = require('stripe');
const orderModel = require('../models/orderModel');

const router = express.Router();

function getStripeWebhookClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_webhook_signature_only');
}

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET;
}

async function fulfillCheckoutSession(session) {
  const userId = Number(session.metadata?.userId || session.client_reference_id);

  if (!Number.isInteger(userId)) {
    return {
      status: 400,
      body: {
        message: 'Checkout session is missing a valid user id'
      }
    };
  }

  if (session.payment_status && session.payment_status !== 'paid') {
    return {
      status: 200,
      body: {
        message: 'Checkout session payment is not complete'
      }
    };
  }

  const order = await orderModel.createOrderFromCart(userId);

  if (order.error === 'Cart is empty') {
    return {
      status: 200,
      body: {
        message: 'Checkout session already processed or cart is empty'
      }
    };
  }

  if (order.error) {
    return {
      status: 400,
      body: {
        message: order.error
      }
    };
  }

  const paidOrder = await orderModel.updateOrderStatus(order.id, 'paid');

  return {
    status: 200,
    body: {
      message: 'Checkout session fulfilled',
      order: paidOrder || order
    }
  };
}

router.post('/', async (req, res) => {
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret) {
    return res.status(503).json({
      message: 'Stripe webhook is not configured'
    });
  }

  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).json({
      message: 'Stripe signature required'
    });
  }

  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({
      message: 'Stripe webhook requires raw request body'
    });
  }

  const stripe = getStripeWebhookClient();

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    return res.status(400).json({
      message: 'Invalid Stripe webhook signature',
      error: err.message
    });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const result = await fulfillCheckoutSession(event.data.object);

      return res.status(result.status).json(result.body);
    }

    res.status(200).json({
      message: 'Stripe event received',
      type: event.type
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to process Stripe webhook',
      error: err.message
    });
  }
});

module.exports = router;