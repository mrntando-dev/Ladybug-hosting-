const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serverName: {
    type: String,
    required: true
  },
  sillyServerId: {
    type: String,
    required: true
  },
  serverType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'stopped', 'suspended'],
    default: 'active'
  },
  coinsPerHour: {
    type: Number,
    default: parseInt(process.env.COINS_PER_HOUR) || 1
  },
  lastCoinDeduction: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Server', serverSchema);
