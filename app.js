require('dotenv').config();

const express = require('express');
const db = require('./db');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const userRoutes = require('./routes/users.routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'E-Commerce API is running'
  });
});

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
app.use('/products', productRoutes);
app.use('/users', userRoutes);

module.exports = app;