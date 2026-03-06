require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    // 4. TTL Configuration (in seconds)
    ttl: {
      default: parseInt(process.env.REDIS_DEFAULT_TTL, 10) || 3600, // 1 hour
      playerStats: parseInt(process.env.REDIS_PLAYER_STATS_TTL, 10) || 300, // 5 minutes
      matchResults: parseInt(process.env.REDIS_MATCH_RESULTS_TTL, 10) || 86400, // 24 hours
    }
  }
};
