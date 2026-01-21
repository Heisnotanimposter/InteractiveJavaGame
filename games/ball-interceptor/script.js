
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let health = 100;
let particles = [];
let balls = [];
let gameActive = false;
let animationId;
let spawnRate = 1000;
let lastSpawn = 0;

// Mouse tracking
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mousedown', (e) => {
    checkClick(e.clientX, e.clientY);
});

class Ball {
    constructor() {
        // Spawn at random edge
        if (Math.random() < 0.5) {
            this.x = Math.random() < 0.5 ? -20 : canvas.width + 20;
            this.y = Math.random() * canvas.height;
        } else {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() < 0.5 ? -20 : canvas.height + 20;
        }

        // Target center
        const angle = Math.atan2(canvas.height / 2 - this.y, canvas.width / 2 - this.x);
        const speed = 2 + Math.random() * 2 + (score / 500); // Speed up as score increases
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.radius = 10 + Math.random() * 10;
        this.color = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`; // Cyan/Blueish
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Check collision with center
        const dist = Math.hypot(this.x - canvas.width / 2, this.y - canvas.height / 2);
        if (dist < 30) {
            health -= 10;
            createParticles(this.x, this.y, '#ff0000');
            return true; // destroy
        }
        return false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.life = 1;
        this.color = color;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
    }
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function checkClick(x, y) {
    if (!gameActive) return;

    for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        const dist = Math.hypot(b.x - x, b.y - y);
        if (dist < b.radius + 20) { // Forgiving hitbox
            balls.splice(i, 1);
            score += 100;
            createParticles(b.x, b.y, b.color);
            break; // Destroy one at a time
        }
    }
}

function init() {
    balls = [];
    particles = [];
    score = 0;
    health = 100;
    gameActive = true;
    animate();
    document.getElementById('ui').style.display = 'none';
}

function animate(time) {
    if (!gameActive) return;
    animationId = requestAnimationFrame(animate);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Trails
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Center Base
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${120 * (health / 100)}, 100%, 50%)`;
    ctx.shadowBlur = 20;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Spawn balls
    if (time - lastSpawn > spawnRate) {
        balls.push(new Ball());
        lastSpawn = time;
        if (spawnRate > 200) spawnRate -= 5;
    }

    balls.forEach((b, index) => {
        if (b.update()) {
            balls.splice(index, 1);
        } else {
            b.draw();
        }
    });

    particles.forEach((p, index) => {
        p.update();
        if (p.life <= 0) particles.splice(index, 1);
        else p.draw();
    });

    // UI
    ctx.fillStyle = '#fff';
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Health: ${health}`, 20, 60);

    if (health <= 0) {
        gameOver();
    }
}

function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationId);
    document.getElementById('ui').style.display = 'flex';
    document.getElementById('final-score').innerText = score;
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
