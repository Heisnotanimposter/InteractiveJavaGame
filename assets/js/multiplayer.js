class MultiplayerClient {
    constructor() {
        this.socket = null;
        this.users = {}; // { id: userData }
        this.myId = null;
        this.roomId = null;

        // Callbacks
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onPlayerUpdate = null;
        this.onRoomState = null;
    }

    connect(url = '/') {
        // Assumes socket.io client is loaded via CDN or bundle
        this.socket = io(url);

        this.socket.on('connect', () => {
            console.log('Connected to multiplayer server', this.socket.id);
            this.myId = this.socket.id;
        });

        this.socket.on('room-state', (users) => {
            this.users = users;
            if (this.onRoomState) this.onRoomState(users);
        });

        this.socket.on('player-joined', (user) => {
            this.users[user.id] = user;
            if (this.onPlayerJoined) this.onPlayerJoined(user);
        });

        this.socket.on('player-left', (id) => {
            delete this.users[id];
            if (this.onPlayerLeft) this.onPlayerLeft(id);
        });

        this.socket.on('player-update', (data) => {
            if (this.users[data.id]) {
                Object.assign(this.users[data.id], data);
                if (this.onPlayerUpdate) this.onPlayerUpdate(data);
            }
        });
    }

    joinRoom(roomId, userData = {}) {
        this.roomId = roomId;
        this.socket.emit('join-room', { roomId, userData });
    }

    sendUpdate(state) {
        if (this.socket && this.roomId) {
            this.socket.emit('update-state', { roomId: this.roomId, state });
        }
    }
}

// Make it globally available
window.MultiplayerClient = MultiplayerClient;
