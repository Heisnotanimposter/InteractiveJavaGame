document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const gameRules = document.getElementById('game-rules');
    const summerImg = new Image();
    const winterImg = new Image();
    summerImg.src = 'summer_ball.jpg';
    winterImg.src = 'winter_ball.jpg';
    let currentBallImage = summerImg;
    let bounceCount = 0;
    let score = 0;

    function drawBall(x, y) {
        ctx.drawImage(currentBallImage, x - currentBallImage.width / 2, y - currentBallImage.height / 2, currentBallImage.width, currentBallImage.height);
    }

    function toggleSeason(season) {
        document.body.style.backgroundImage = `url('${season}_background.jpg')`;
        const audio = new Audio(`${season}.mp3`);
        audio.play();
        currentBallImage = season === 'summer' ? summerImg : winterImg;
    }

    // Add event listeners for menu interaction
    document.getElementById('summer').addEventListener('click', function() {
        toggleSeason('summer');
    });

    document.getElementById('winter').addEventListener('click', function() {
        toggleSeason('winter');
    });

    function updateScoreAndBounces() {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Score: ${score}, Bounces: ${bounceCount}`, canvas.width / 2 - 50, 10);
    }

    function startGame() {
        // Game start logic...
        gameRules.style.display = 'none'; // Hide game rules on start
    }

    function endGame() {
        // Game end logic...
        gameRules.style.display = 'block'; // Show game rules on end
    }

    // Main game loop...
});

document.getElementById('start').addEventListener('click', function() {
    document.getElementById('menu').style.display = 'none'; // Hide menu
    setTimeout(showGameRules, 1000); // Delay game rules display
    startCountdown();
});
function showGameRules() {
    document.getElementById('game-rules').style.display = 'block';
    setTimeout(function() {
        document.getElementById('game-rules').style.display = 'none';
    }, 5000); // Display game rules for 5 seconds
}

function startCountdown() {
    let counter = 5;
    const countdown = setInterval(function() {
        document.getElementById('status').innerHTML = counter > 0 ? counter : 'Go!';
        if (counter === 0) {
            clearInterval(countdown);
            startGame(); // Start the game after countdown
        }
        counter--;
    }, 1000);
}

let barX = 0;
let barDirection = 1;

function drawBar() {
    ctx.fillRect(barX, canvas.height - 20, 100, 10); // Draw the bar
    barX += barDirection * (canvas.width / 120); // Speed calculation for 2 sec one-way
    if (barX > canvas.width - 100 || barX < 0) {
        barDirection *= -1; // Change direction

    }
}

let isGameActive = false;

function createBall() {
    if (!isGameActive) return;

    let x, y, overlaps;
    do {
        overlaps = false;
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;

        // Check overlap with existing balls
        for (let ball of balls) {
            let dx = ball.x - x;
            let dy = ball.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < ball.radius * 2) {
                overlaps = true;
                break;
            }
        }
    } while (overlaps);

    balls.push(new Ball(x, y));
}

// Use this flag to control when to start and stop creating balls
function startGame() {
    if (isGameActive) return; // Prevent re-starting the game
    isGameActive = true;
    document.getElementById('menu').style.display = 'none';
    showGameRules();
    startCountdown();
    ballCreationInterval = setInterval(createBall, 2000);
}

function endGame() {
    isGameActive = false;
    // Clear interval if you store its ID
}

let ballCreationInterval;

function startGame() {
    isGameActive = true;
    ballCreationInterval = setInterval(createBall, 2000);
}

function endGame() {
    clearInterval(ballCreationInterval);
    clearInterval(gameInterval); // Make sure this interval is defined and running your game loop
    isGameActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    alert("Game over! Your score: " + score); // Display final score
}

function drawBall(x, y) {
    if (currentBallImage.complete) {
        ctx.drawImage(currentBallImage, x - currentBallImage.width / 2, y - currentBallImage.height / 2, currentBallImage.width, currentBallImage.height);
    }
}

function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.dx = 2 * (Math.random() - 0.5); // Speed and direction
    this.dy = 2 * (Math.random() - 0.5); // Speed and direction
    this.radius = 10; // Default radius
}


