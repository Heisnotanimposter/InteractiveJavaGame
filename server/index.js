const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// Routes
const authRoutes = require('./routes/auth');
const communityRoutes = require('./routes/community');
const gameRoutes = require('./routes/game');

app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/game', gameRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Socket.io connection
const RoomManager = require('./multiplayer/RoomManager');
const roomManager = new RoomManager(io);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', ({ roomId, userData }) => {
        roomManager.joinRoom(socket, roomId, userData);
    });

    socket.on('update-state', ({ roomId, state }) => {
        roomManager.updatePlayerState(socket, roomId, state);
    });

    socket.on('chat-message', ({ roomId, message }) => {
        roomManager.broadcastChat(socket, roomId, message);
    });

    socket.on('disconnect', () => {
        roomManager.leaveRoom(socket);
        console.log('User disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
