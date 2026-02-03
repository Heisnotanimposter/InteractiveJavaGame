class RoomManager {
    constructor(io) {
        this.io = io;
        this.rooms = {}; // { roomId: { users: { socketId: userData } } }
    }

    joinRoom(socket, roomId, userData) {
        socket.join(roomId);

        if (!this.rooms[roomId]) {
            this.rooms[roomId] = { users: {} };
        }

        this.rooms[roomId].users[socket.id] = {
            id: socket.id,
            ...userData,
            x: 0,
            y: 0,
            z: 0
        };

        // Notify others in room
        socket.to(roomId).emit('player-joined', { id: socket.id, ...userData });

        // Send current room state to new player
        socket.emit('room-state', this.rooms[roomId].users);

        console.log(`Socket ${socket.id} joined room ${roomId}`);
    }

    leaveRoom(socket) {
        for (const roomId in this.rooms) {
            if (this.rooms[roomId].users[socket.id]) {
                delete this.rooms[roomId].users[socket.id];
                socket.to(roomId).emit('player-left', socket.id);

                if (Object.keys(this.rooms[roomId].users).length === 0) {
                    delete this.rooms[roomId];
                }
                break; // Assuming user only in one room at a time for now
            }
        }
    }

    updatePlayerState(socket, roomId, state) {
        if (this.rooms[roomId] && this.rooms[roomId].users[socket.id]) {
            // Update local state
            Object.assign(this.rooms[roomId].users[socket.id], state);

            // Broadcast to others (exclude sender for efficiency usually, or include)
            socket.to(roomId).emit('player-update', { id: socket.id, ...state });
        }
    }

    broadcastChat(socket, roomId, message) {
        if (this.rooms[roomId]) {
            const user = this.rooms[roomId].users[socket.id];
            const username = user && user.username ? user.username : 'Anonymous';
            this.io.to(roomId).emit('chat-message', {
                id: socket.id,
                username: username,
                message: message,
                timestamp: Date.now()
            });
        }
    }
}

module.exports = RoomManager;
