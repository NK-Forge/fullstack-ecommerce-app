const { assert } = require('chai');
const request = require('supertest');

const app = require('../app');
const Stripe = require('stripe');

describe('E-Commerce API smoke test', () => {
  const unique = Date.now();

  const testUser = {
    username: `smokeuser_${unique}`,
    email: `smokeuser_${unique}@example.com`,
    password: 'test123'
  };

  const testProduct = {
    name: `Smoke Test Product ${unique}`,
    description: 'Temporary product for automated smoke test',
    price: 19.99,
    inventoryQuantity: 10
  };

  let token;
  let userId;
  let productId;
  let orderId;
  let secondUserId;
  let secondToken;

  it('returns API health status', async () => {
    const response = await request(app)
      .get('/');

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'E-Commerce API is running');
  });

  it('returns database health status', async function () {
    this.timeout(5000);

    const response = await request(app)
      .get('/health/db');

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'ok');
    assert.exists(response.body.databaseTime);
  });

  it('registers a user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send(testUser);

    assert.equal(response.status, 201);
    assert.equal(response.body.message, 'User registered successfully');
    assert.equal(response.body.user.email, testUser.email);
    assert.notExists(response.body.user.password_hash);

    userId = response.body.user.id;
  });

  it('logs in a user and returns a token', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'Login successful');
    assert.exists(response.body.token);
    assert.equal(response.body.user.email, testUser.email);

    token = response.body.token;
  });

  it('registers a second user for ownership tests', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        username: 'ownership_user',
        email: 'ownership_user@example.com',
        password: 'password123'
      });

    assert.equal(response.status, 201);
    assert.exists(response.body.user.id);

    secondUserId = response.body.user.id;
  });

  it('logs in the second user and returns a token', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'ownership_user@example.com',
        password: 'password123'
      });

    assert.equal(response.status, 200);
    assert.exists(response.body.token);

    secondToken = response.body.token;
  });

  it('rejects auth/me without a token', async () => {
    const response = await request(app)
      .get('/auth/me');

    assert.equal(response.status, 401);
    assert.equal(response.body.message, 'Authorization token required');
  });

  it('returns current user payload with a token', async () => {
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.user.id, userId);
    assert.equal(response.body.user.email, testUser.email);
  });

  it('returns configuration error when Google OAuth is not configured', async () => {
    const originalClientId = process.env.GOOGLE_CLIENT_ID;
    const originalClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const originalCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

    try {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
      delete process.env.GOOGLE_CALLBACK_URL;

      const response = await request(app)
        .get('/oauth/google');

      assert.equal(response.status, 503);
      assert.equal(response.body.message, 'Google OAuth is not configured');
    } finally {
      if (originalClientId) {
        process.env.GOOGLE_CLIENT_ID = originalClientId;
      }

      if (originalClientSecret) {
        process.env.GOOGLE_CLIENT_SECRET = originalClientSecret;
      }

      if (originalCallbackUrl) {
        process.env.GOOGLE_CALLBACK_URL = originalCallbackUrl;
      }
    }
  });

  it('rejects Google OAuth callback without code and state', async () => {
    const originalClientId = process.env.GOOGLE_CLIENT_ID;
    const originalClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const originalCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

    try {
      process.env.GOOGLE_CLIENT_ID = 'google-client-id-test';
      process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret-test';
      process.env.GOOGLE_CALLBACK_URL = 'http://localhost:4001/oauth/google/callback';

      const response = await request(app)
        .get('/oauth/google/callback');

      assert.equal(response.status, 400);
      assert.equal(response.body.message, 'Google OAuth code and state are required');
    } finally {
      if (originalClientId) {
        process.env.GOOGLE_CLIENT_ID = originalClientId;
      } else {
        delete process.env.GOOGLE_CLIENT_ID;
      }

      if (originalClientSecret) {
        process.env.GOOGLE_CLIENT_SECRET = originalClientSecret;
      } else {
        delete process.env.GOOGLE_CLIENT_SECRET;
      }

      if (originalCallbackUrl) {
        process.env.GOOGLE_CALLBACK_URL = originalCallbackUrl;
      } else {
        delete process.env.GOOGLE_CALLBACK_URL;
      }
    }
  });

  it('creates a product', async () => {
    const response = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send(testProduct);

    assert.equal(response.status, 201);
    assert.equal(response.body.message, 'Product created successfully');
    assert.equal(response.body.product.name, testProduct.name);

    productId = response.body.product.id;
  });

  it('gets all products', async () => {
    const response = await request(app)
      .get('/products');

    assert.equal(response.status, 200);
    assert.isArray(response.body.products);
  });

  it('gets one product by id', async () => {
    const response = await request(app)
      .get(`/products/${productId}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.product.id, productId);
  });

  it('updates a product', async () => {
    const response = await request(app)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        price: 17.99,
        inventoryQuantity: 8
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'Product updated successfully');
    assert.equal(response.body.product.inventory_quantity, 8);
  });

  it('adds an item to the cart', async () => {
    const response = await request(app)
      .post(`/cart/${userId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: productId,
        quantity: 2
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.message, 'Item added to cart');
    assert.equal(response.body.item.product_id, productId);
    assert.equal(response.body.item.quantity, 2);
  });

  it('gets the user cart', async () => {
    const response = await request(app)
      .get(`/cart/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.cart.user_id, userId);
    assert.isArray(response.body.items);
  });

  it('returns configuration error when Stripe webhook is not configured', async () => {
    const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const response = await request(app)
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          id: 'evt_missing_secret',
          object: 'event'
        }));

      assert.equal(response.status, 503);
      assert.equal(response.body.message, 'Stripe webhook is not configured');
    } finally {
      if (originalWebhookSecret) {
        process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
      }
    }
  });

  it('rejects Stripe webhook without a signature', async () => {
    const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';

      const response = await request(app)
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          id: 'evt_missing_signature',
          object: 'event'
        }));

      assert.equal(response.status, 400);
      assert.equal(response.body.message, 'Stripe signature required');
    } finally {
      if (originalWebhookSecret) {
        process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
      } else {
        delete process.env.STRIPE_WEBHOOK_SECRET;
      }
    }
  });

  it('rejects Stripe webhook with an invalid signature', async () => {
    const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';

      const response = await request(app)
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'invalid-signature')
        .send(JSON.stringify({
          id: 'evt_invalid_signature',
          object: 'event'
        }));

      assert.equal(response.status, 400);
      assert.equal(response.body.message, 'Invalid Stripe webhook signature');
    } finally {
      if (originalWebhookSecret) {
        process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
      } else {
        delete process.env.STRIPE_WEBHOOK_SECRET;
      }
    }
  });

  it('accepts a valid signed Stripe webhook event', async () => {
    const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const webhookSecret = 'whsec_test_secret';
    const stripe = new Stripe('sk_test_webhook_signature_only');

    const payload = JSON.stringify({
      id: `evt_${unique}`,
      object: 'event',
      type: 'payment_intent.created',
      data: {
        object: {
          id: `pi_${unique}`,
          object: 'payment_intent'
        }
      }
    });

    const signature = stripe.webhooks.generateTestHeaderString({
      payload: payload,
      secret: webhookSecret
    });

    try {
      process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;

      const response = await request(app)
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', signature)
        .send(payload);

      assert.equal(response.status, 200);
      assert.equal(response.body.message, 'Stripe event received');
      assert.equal(response.body.type, 'payment_intent.created');
    } finally {
      if (originalWebhookSecret) {
        process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
      } else {
        delete process.env.STRIPE_WEBHOOK_SECRET;
      }
    }
  });

  it('rejects Stripe checkout session without a token', async () => {
    const response = await request(app)
      .post(`/payments/checkout-session/${userId}`);

    assert.equal(response.status, 401);
    assert.equal(response.body.message, 'Authorization token required');
  });

  it('rejects Stripe checkout session for another user', async () => {
    const response = await request(app)
      .post(`/payments/checkout-session/${userId + 999}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'You can only create checkout sessions for your own cart');
  });

  it('returns configuration error when Stripe checkout is not configured', async () => {
    const originalStripeSecretKey = process.env.STRIPE_SECRET_KEY;

    try {
      delete process.env.STRIPE_SECRET_KEY;

      const response = await request(app)
        .post(`/payments/checkout-session/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      assert.equal(response.status, 503);
      assert.equal(response.body.message, 'Stripe is not configured');
    } finally {
      if (originalStripeSecretKey) {
        process.env.STRIPE_SECRET_KEY = originalStripeSecretKey;
      }
    }
  });

  it('rejects cart access for another user', async () => {
    const response = await request(app)
      .get(`/cart/${userId}`)
      .set('Authorization', `Bearer ${secondToken}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'You can only access your own resources');
  });

  it('rejects adding cart items for another user', async () => {
    const response = await request(app)
      .post(`/cart/${userId}/items`)
      .set('Authorization', `Bearer ${secondToken}`)
      .send({
        productId: productId,
        quantity: 1
      });

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'You can only access your own resources');
  });

  it('rejects creating an order for another user', async () => {
    const response = await request(app)
      .post(`/orders/${userId}`)
      .set('Authorization', `Bearer ${secondToken}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'You can only access your own resources');
  });

  it('rejects viewing another user order history', async () => {
    const response = await request(app)
      .get(`/orders/user/${userId}`)
      .set('Authorization', `Bearer ${secondToken}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'You can only access your own resources');
  });

  it('updates a cart item', async () => {
    const response = await request(app)
      .put(`/cart/${userId}/items/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        quantity: 3
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'Cart item updated successfully');
    assert.equal(response.body.item.quantity, 3);
  });

  it('creates an order from the cart', async () => {
    const response = await request(app)
      .post(`/orders/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 201);
    assert.equal(response.body.message, 'Order created successfully');
    assert.equal(response.body.order.user_id, userId);
    assert.isArray(response.body.order.items);

    orderId = response.body.order.id;
  });

  it('gets all orders', async () => {
    const response = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.isArray(response.body.orders);
  });

  it('gets one order by id', async () => {
    const response = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.order.id, orderId);
  });

  it('gets orders by user id', async () => {
    const response = await request(app)
      .get(`/orders/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.isArray(response.body.orders);
  });

  it('updates an order status', async () => {
    const response = await request(app)
      .put(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'shipped'
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'Order updated successfully');
    assert.equal(response.body.order.status, 'shipped');
  });

  it('gets all users', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.isArray(response.body.users);
  });

  it('gets one user by id', async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.user.id, userId);
  });

  it('updates a user', async () => {
    const response = await request(app)
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: `${testUser.username}_updated`
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'User updated successfully');
    assert.equal(response.body.user.username, `${testUser.username}_updated`);
  });

  it('deletes the test order', async () => {
    const response = await request(app)
      .delete(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'Order deleted successfully');
  });

  it('deletes the test product', async () => {
    const response = await request(app)
      .delete(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'Product deleted successfully');
  });

  it('deletes the test user', async () => {
    const response = await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'User deleted successfully');
  });

  it('deletes the second test user', async () => {
    const response = await request(app)
      .delete(`/users/${secondUserId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
  });
});