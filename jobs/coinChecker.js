const Server = require('../models/Server');
const User = require('../models/User');
const axios = require('axios');

const sillyAPI = axios.create({
  baseURL: process.env.SILLY_PANEL_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

exports.checkAndStopServers = async () => {
  try {
    const activeServers = await Server.find({ status: 'active' });

    for (const server of activeServers) {
      const user = await User.findById(server.userId);

      if (!user) continue;

      // Check if an hour has passed since last deduction
      const hoursPassed = (Date.now() - server.lastCoinDeduction) / (1000 * 60 * 60);

      if (hoursPassed >= 1) {
        // Deduct coins
        const coinsToDeduct = Math.floor(hoursPassed) * server.coinsPerHour;
        user.coins -= coinsToDeduct;

        // If user has less than 0 coins, stop the server
        if (user.coins < 0) {
          user.coins = 0;
          
          // Stop server via SillyDev API
          try {
            await sillyAPI.post(`/api/servers/${server.sillyServerId}/stop`, {}, {
              auth: {
                username: process.env.SILLY_PANEL_USERNAME,
                password: process.env.SILLY_PANEL_PASSWORD
              }
            });
          } catch (apiError) {
            console.error('Error stopping server via API:', apiError.message);
          }

          server.status = 'suspended';
          console.log(`⚠️ Server ${server.serverName} suspended due to insufficient coins`);
        }

        await user.save();
        server.lastCoinDeduction = Date.now();
        await server.save();
      }
    }

    console.log('✅ Coin checker job completed');
  } catch (error) {
    console.error('❌ Coin checker error:', error.message);
  }
};
