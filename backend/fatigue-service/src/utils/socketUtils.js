const socketIo = require('socket.io');

let io;

/**
 * 1. Socket.io server setup
 * Initialize the Socket.io server and attach it to an existing HTTP server
 * @param {import('http').Server} server - The HTTP server instance
 */
const initSocketServer = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST']
        }
    });

    // 3. Client connection handling
    io.on('connection', (socket) => {
        console.log(`[Socket.io] New client connected: ${socket.id}`);

        // Optional: Allow clients to join specific match rooms for targeted events
        socket.on('join_match', (matchId) => {
            if (matchId) {
                socket.join(`match_${matchId}`);
                console.log(`[Socket.io] Client ${socket.id} joined room match_${matchId}`);
            }
        });

        socket.on('leave_match', (matchId) => {
            if (matchId) {
                socket.leave(`match_${matchId}`);
                console.log(`[Socket.io] Client ${socket.id} left room match_${matchId}`);
            }
        });

        // 5. Error handling for specific socket connections
        socket.on('error', (error) => {
            console.error(`[Socket.io] Error from client ${socket.id}:`, error);
        });

        socket.on('disconnect', (reason) => {
            console.log(`[Socket.io] Client disconnected: ${socket.id}, reason: ${reason}`);
        });
    });

    console.log('[Socket.io] Server initialized successfully.');
    return io;
};

/**
 * Get the initialized socket.io instance
 * Handles error thrown if called before initialization
 * @returns {import('socket.io').Server}
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized. Call initSocketServer first.');
    }
    return io;
};

module.exports = {
    initSocketServer,
    getIO
};
