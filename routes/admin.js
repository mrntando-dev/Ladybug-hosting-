const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Server = require('../models/Server');

// Admin login (reveals panel credentials)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const user = await User.findOne({ username: process.env.ADMIN_USERNAME });
      
      // Return admin credentials for SillyDev panel
      res.json({
        message: 'Admin login successful',
        panelCredentials: {
          url: process.env.SILLY_PANEL_URL,
          username: process.env.SILLY_PANEL_USERNAME,
          password: process.env.SILLY_PANEL_PASSWORD
        },
        user: user || { username, isAdmin: true }
      });
    } else {
      res.status(401).json({ error: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all servers
router.get('/servers', authenticate, isAdmin, async (req, res) => {
  try {
    const servers = await Server.find().populate('userId', 'username email');
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add coins to user
router.post('/add-coins', authenticate, isAdmin, async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { coins: amount } },
      { new: true }
    ).select('-password');

    res.json({ message: 'Coins added', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get panel credentials
router.get('/panel-credentials', authenticate, isAdmin, (req, res) => {
  res.json({
    url: process.env.SILLY_PANEL_URL,
    username: process.env.SILLY_PANEL_USERNAME,
    password: process.env.SILLY_PANEL_PASSWORD
  });
});

module.exports = router;
