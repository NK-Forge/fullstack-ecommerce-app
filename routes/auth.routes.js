const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  try {
    const existingUser = await userModel.findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        message: 'A user with that email already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
      username: email,
      email: email,
      passwordHash: passwordHash
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to register user',
      error: err.message
    });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  try {
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to log in',
      error: err.message
    });
  }
});

router.get('/me', authMiddleware.requireAuth, (req, res) => {
  res.status(200).json({
    user: req.user
  });
});

module.exports = router;