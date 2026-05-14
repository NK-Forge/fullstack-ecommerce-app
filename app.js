require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth.routes');
const oauthRoutes = require('./routes/oauth.routes');
const productRoutes = require('./routes/products.routes');
const userRoutes = require('./routes/users.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/orders.routes');
const paymentRoutes = require('./routes/payments.routes');
const paymentWebhookRoutes = require('./routes/paymentWebhooks.routes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/openapi.yaml');

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const clientDistPath = path.join(__dirname, 'client', 'dist');

app.use(cors({
  origin: clientOrigin,
  credentials: true
}));

app.use('/payments/webhook', express.raw({ type: 'application/json' }), paymentWebhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'E-Commerce API is running'
    });
  });
}

app.get('/health/db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');

    res.status(200).json({
      status: 'ok',
      databaseTime: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

app.use('/auth', authRoutes);
app.use('/oauth', oauthRoutes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDistPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

module.exports = app;