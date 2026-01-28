
class LobbyGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.player = {
            x: this.width / 2,
            y: this.height / 2,
            size: 20,
            speed: 5,
            color: '#00ffcc', // Cyan neon
            name: 'Player'
        };

        this.otherPlayers = {}; // id -> {x, y, color}

        // Portals configuration
        this.portals = [
            { id: 'minecraft', x: 200, y: 200, w: 100, h: 100, color: '#4CAF50', label: 'Minecraft', url: 'games/minecraft/index.html' },
            { id: 'idlerpg', x: this.width - 300, y: 200, w: 100, h: 100, color: '#FF5722', label: 'Idle RPG', url: 'games/idle-rpg/index.html' },
            { id: 'ball', x: 200, y: this.height - 300, w: 100, h: 100, color: '#2196F3', label: 'Ball Intercept', url: 'games/ball-interceptor/index.html' },
            { id: 'jumper', x: this.width - 300, y: this.height - 300, w: 100, h: 100, color: '#FFC107', label: 'Jumper', url: 'games/jumper/index.html' },
            { id: 'golf', x: this.width / 2 - 50, y: 100, w: 100, h: 100, color: '#8BC34A', label: 'Golf', url: 'games/golf/index.html' }
        ];

        this.keys = {};

        // Resize listener
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        });

        // Input listeners
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);

        // Multiplayer integration
        this.mp = new MultiplayerClient();
        this.setupMultiplayer();

        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    setupMultiplayer() {
        this.mp.onPlayerUpdate = (data) => {
            if (data.id !== this.mp.myId) {
                this.otherPlayers[data.id] = data;
            }
        };

        this.mp.onPlayerLeft = (id) => {
            delete this.otherPlayers[id];
        };

        this.mp.connect();
        this.mp.joinRoom('lobby');
    }

    update() {
        let dx = 0;
        let dy = 0;

        if (this.keys['ArrowUp'] || this.keys['w']) dy = -this.player.speed;
        if (this.keys['ArrowDown'] || this.keys['s']) dy = this.player.speed;
        if (this.keys['ArrowLeft'] || this.keys['a']) dx = -this.player.speed;
        if (this.keys['ArrowRight'] || this.keys['d']) dx = this.player.speed;

        this.player.x += dx;
        this.player.y += dy;

        // Bounds checking
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.width) this.player.x = this.width;
        if (this.player.y < 0) this.player.y = 0;
        if (this.player.y > this.height) this.player.y = this.height;

        // Portal collision
        this.checkPortals();

        // Send update
        if (dx !== 0 || dy !== 0) {
            this.mp.sendUpdate({
                x: this.player.x,
                y: this.player.y,
                color: this.player.color
            });
        }
    }

    checkPortals() {
        for (let p of this.portals) {
            if (
                this.player.x > p.x && this.player.x < p.x + p.w &&
                this.player.y > p.y && this.player.y < p.y + p.h
            ) {
                // Navigate
                window.location.href = p.url;
            }
        }
    }

    draw() {
        // Clear background
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw grid/floor
        this.drawGrid();

        // Draw Portals
        for (let p of this.portals) {
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = p.color;
            this.ctx.fillRect(p.x, p.y, p.w, p.h);

            // Label
            this.ctx.fillStyle = '#fff';
            this.ctx.shadowBlur = 0;
            this.ctx.font = '16px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(p.label, p.x + p.w / 2, p.y - 10);
        }

        // Draw Other Players
        for (let id in this.otherPlayers) {
            const p = this.otherPlayers[id];
            this.drawCharacter(p.x, p.y, p.color || '#fff', 'User');
        }

        // Draw Local Player
        this.drawCharacter(this.player.x, this.player.y, this.player.color, 'You');
    }

    drawCharacter(x, y, color, label) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
        this.ctx.fill();

        // Name
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, x, y - 15);
    }

    drawGrid() {
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1;
        const cellSize = 50;

        for (let x = 0; x <= this.width; x += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.height; y += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }
}

// Start game when page loads
window.onload = () => {
    new LobbyGame('gameCanvas');
};
