const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const Server = require('../models/Server');
const User = require('../models/User');

// SillyDev API helper
const sillyAPI = axios.create({
  baseURL: process.env.SILLY_PANEL_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get user's servers
router.get('/my-servers', authenticate, async (req, res) => {
  try {
    const servers = await Server.find({ userId: req.user._id });
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new server
router.post('/create', authenticate, async (req, res) => {
  try {
    const { serverName, serverType } = req.body;

    // Check if user has enough coins (initial cost)
    if (req.user.coins < 10) {
      return res.status(400).json({ error: 'Not enough coins to create server' });
    }

    // Call SillyDev API to create server
    // Note: This is a placeholder - adjust based on actual SillyDev API
    const sillyResponse = await sillyAPI.post('/api/servers/create', {
      name: serverName,
      type: serverType
    }, {
      auth: {
        username: process.env.SILLY_PANEL_USERNAME,
        password: process.env.SILLY_PANEL_PASSWORD
      }
    });

    // Create server in database
    const server = new Server({
      userId: req.user._id,
      serverName,
      sillyServerId: sillyResponse.data.serverId || 'silly_' + Date.now(),
      serverType,
      status: 'active'
    });

    await server.save();

    // Deduct coins
    await User.findByIdAndUpdate(req.user._id, { $inc: { coins: -10 } });

    res.json({ message: 'Server created successfully', server });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop server
router.post('/stop/:serverId', authenticate, async (req, res) => {
  try {
    const server = await Server.findOne({ _id: req.params.serverId, userId: req.user._id });
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    // Call SillyDev API to stop server
    await sillyAPI.post(`/api/servers/${server.sillyServerId}/stop`, {}, {
      auth: {
        username: process.env.SILLY_PANEL_USERNAME,
        password: process.env.SILLY_PANEL_PASSWORD
      }
    });

    server.status = 'stopped';
    await server.save();

    res.json({ message: 'Server stopped', server });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
router.post('/start/:serverId', authenticate, async (req, res) => {
  try {
    const server = await Server.findOne({ _id: req.params.serverId, userId: req.user._id });
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    // Check if user has coins
    const user = await User.findById(req.user._id);
    if (user.coins < 1) {
      return res.status(400).json({ error: 'Not enough coins to start server' });
    }

    // Call SillyDev API to start server
    await sillyAPI.post(`/api/servers/${server.sillyServerId}/start`, {}, {
      auth: {
        username: process.env.SILLY_PANEL_USERNAME,
        password: process.env.SILLY_PANEL_PASSWORD
      }
    });

    server.status = 'active';
    await server.save();

    res.json({ message: 'Server started', server });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete server
router.delete('/:serverId', authenticate, async (req, res) => {
  try {
    const server = await Server.findOne({ _id: req.params.serverId, userId: req.user._id });
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    // Call SillyDev API to delete server
    await sillyAPI.delete(`/api/servers/${server.sillyServerId}`, {
      auth: {
        username: process.env.SILLY_PANEL_USERNAME,
        password: process.env.SILLY_PANEL_PASSWORD
      }
    });

    await Server.findByIdAndDelete(req.params.serverId);

    res.json({ message: 'Server deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
