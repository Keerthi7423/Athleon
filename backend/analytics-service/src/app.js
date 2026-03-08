const express = require('express');
const { connectRedis, disconnectRedis } = require('./utils/redis');
const { getPlayerStats, getMatchResults } = require('./services/analyticsService');
const { emitScoreUpdate, emitFatigueAlert, emitMomentumShift } = require('./services/eventEmitters');
const { initSocketServer } = require('./utils/socketUtils');
const fatigueRoutes = require('./routes/fatigue.routes');
const emiRoutes = require('./routes/emi.routes');
const config = require('./config/env');
const http = require('http');

const app = express();
const server = http.createServer(app);

// 1. Initialize Socket.io Server
initSocketServer(server);
app.use(express.json());

// Main Fatigue Microservice Routes
app.use('/fatigue', fatigueRoutes);
app.use('/emi', emiRoutes);

// Routes using Redis Cache inside Services
app.get('/api/v1/analytics/players/:id/stats', async (req, res) => {
    try {
        const stats = await getPlayerStats(req.params.id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/v1/analytics/matches/:id/results', async (req, res) => {
    try {
        const results = await getMatchResults(req.params.id);

        // Simulate real-time event 4. Example event broadcast
        // In a real system, a webhook or DB trigger could emit these directly
        emitScoreUpdate(req.params.id, { home: results.homeTeamScore, away: results.awayTeamScore });

        // Simulating Momentum Shift
        emitMomentumShift(req.params.id, {
            team: results.homeTeamScore > results.awayTeamScore ? 'Home' : 'Away',
            probability: 0.70
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mock endpoint to simulate High Fatigue
app.post('/api/v1/analytics/players/:id/simulate-fatigue', (req, res) => {
    const playerId = req.params.id;

    // 4. Example event broadcast: Simulate a player surpassing a threshold
    emitFatigueAlert(playerId, { level: 'CRITICAL', metric: 95 });

    res.json({ message: `Fatigue alert dispatched globally for ${playerId}` });
});

/**
 * Server initialization
 */
const startServer = async () => {
    try {
        // 1. Redis Connection Setup - Make sure redis is connected on startup
        await connectRedis();

        const PORT = config.port;
        // Use the HTTP server attached with socket.io to listen
        server.listen(PORT, () => {
            console.log(`Athleon Analytics Service running on port ${PORT}`);
        });

        // Handle Graceful Shutdown
        const gracefulShutdown = async () => {
            console.log('Received kill signal, shutting down gracefully.');
            await disconnectRedis();
            server.close(() => {
                console.log('Closed out remaining connections.');
                process.exit(0);
            });
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
