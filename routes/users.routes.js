const express = require('express');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware.requireAuth, async (req, res) => {
  try {
    const users = await userModel.getAllUsers();

    res.status(200).json({
      users: users
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to get users',
      error: err.message
    });
  }
});

router.get('/:id', authMiddleware.requireAuth, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      user: user
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to get user',
      error: err.message
    });
  }
});

router.put('/:id', authMiddleware.requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { username, email, password } = req.body || {};

  if (!username && !email && !password) {
    return res.status(400).json({
      message: 'At least one field is required'
    });
  }

  try {
    let passwordHash;

    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await userModel.updateUser(id, {
      username: username,
      email: email,
      passwordHash: passwordHash
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        message: 'Username or email already exists'
      });
    }

    res.status(500).json({
      message: 'Unable to update user',
      error: err.message
    });
  }
});

router.delete('/:id', authMiddleware.requireAuth, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const deletedUser = await userModel.deleteUser(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to delete user',
      error: err.message
    });
  }
});

module.exports = router;