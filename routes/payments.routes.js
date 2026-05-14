const express = require('express');
const Stripe = require('stripe');
const cartModel = require('../models/cartModel');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getClientOrigin() {
  return process.env.CLIENT_ORIGIN || 'http://localhost:5173';
}

function getCurrency() {
  return process.env.STRIPE_CURRENCY || 'usd';
}

function toStripeUnitAmount(price) {
  return Math.round(Number(price) * 100);
}

router.post('/checkout-session/:userId', authMiddleware.requireAuth, async (req, res) => {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId)) {
    return res.status(400).json({
      message: 'Valid user id is required'
    });
  }

  if (Number(req.user.id) !== userId) {
    return res.status(403).json({
      message: 'You can only create checkout sessions for your own cart'
    });
  }

  const stripe = getStripeClient();

  if (!stripe) {
    return res.status(503).json({
      message: 'Stripe is not configured'
    });
  }

  try {
    const cart = await cartModel.getCartByUserId(userId);

    if (!cart.items.length) {
      return res.status(400).json({
        message: 'Cart is empty'
      });
    }

    const lineItems = cart.items.map((item) => {
      const unitAmount = toStripeUnitAmount(item.price);

      if (!Number.isInteger(unitAmount) || unitAmount <= 0) {
        return null;
      }

      return {
        price_data: {
          currency: getCurrency(),
          product_data: {
            name: item.name,
            description: item.description || undefined
          },
          unit_amount: unitAmount
        },
        quantity: Number(item.quantity)
      };
    });

    if (lineItems.some((item) => item === null)) {
      return res.status(400).json({
        message: 'Cart contains an invalid product price'
      });
    }

    const clientOrigin = getClientOrigin();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      client_reference_id: String(userId),
      metadata: {
        userId: String(userId),
        cartId: String(cart.cart.id)
      },
      success_url: `${clientOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientOrigin}/checkout`
    });

    res.status(201).json({
      message: 'Stripe checkout session created',
      sessionId: session.id,
      url: session.url
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to create Stripe checkout session',
      error: err.message
    });
  }
});

module.exports = router;