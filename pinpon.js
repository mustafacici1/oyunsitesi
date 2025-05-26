// Canvas ve context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Oyun durumu
let gameRunning = true;

// Oyuncu skorları
let score1 = 0;
let score2 = 0;

// Tuş durumları
const keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false
};

// Oyuncu 1 (Sol)
const player1 = {
    x: 20,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    speed: 12,
    color: '#00ff41'
};

// Oyuncu 2 (Sağ)
const player2 = {
    x: canvas.width - 30,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    speed: 12,
    color: '#ff0080'
};

// Top
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speedX: 16,
    speedY: 10,
    color: '#ffffff',
    maxSpeed: 20,
    originalSpeed: 15
};

// Özel güçler
const powerUps = [];
const activePowers = {
    speed: { active: false, duration: 0 },
    bigBall: { active: false, duration: 0 },
    slow: { active: false, duration: 0 }
};

// Özel güç tipleri
const powerTypes = {
    speed: { color: '#ffff00', symbol: '🚀', name: 'Hız Artışı' },
    bigBall: { color: '#ff4444', symbol: '🔴', name: 'Dev Top' },
    slow: { color: '#44ff44', symbol: '🐌', name: 'Yavaşlatma' }
};

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key in keys) keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key in keys) keys[e.key] = false;
});

function movePlayer(player, upKey, downKey) {
    if (keys[upKey] && player.y > 0) player.y -= player.speed;
    if (keys[downKey] && player.y < canvas.height - player.height) player.y += player.speed;
}

function checkBallCollision(ball, paddle) {
    return ball.x - ball.radius < paddle.x + paddle.width &&
           ball.x + ball.radius > paddle.x &&
           ball.y - ball.radius < paddle.y + paddle.height &&
           ball.y + ball.radius > paddle.y;
}

function normalizeBallSpeed() {
    const speed = ball.originalSpeed;
    const angle = Math.atan2(ball.speedY, ball.speedX);
    ball.speedX = Math.cos(angle) * speed;
    ball.speedY = Math.sin(angle) * speed;
}

function createPowerUp() {
    if (Math.random() < 0.005 && powerUps.length < 2) {
        const types = Object.keys(powerTypes);
        const type = types[Math.floor(Math.random() * types.length)];
        powerUps.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: Math.random() * (canvas.height - 60) + 30,
            width: 30,
            height: 30,
            type: type,
            rotation: 0
        });
    }
}

function activatePowerUp(type) {
    switch (type) {
        case 'speed':
            activePowers.speed.active = true;
            activePowers.speed.duration = 300;
            ball.speedX *= 1.8;
            ball.speedY *= 1.8;
            break;
        case 'bigBall':
            activePowers.bigBall.active = true;
            activePowers.bigBall.duration = 300;
            ball.radius = 15;
            break;
        case 'slow':
            activePowers.slow.active = true;
            activePowers.slow.duration = 240;
            player1.speed = 2;
            player2.speed = 2;
            break;
    }
    updatePowerDisplay();
}

function deactivatePowerUp(type) {
    activePowers[type].active = false;
    switch (type) {
        case 'speed':
            normalizeBallSpeed();
            break;
        case 'bigBall':
            ball.radius = 8;
            break;
        case 'slow':
            player1.speed = 12;
            player2.speed = 12;
            break;
    }
    updatePowerDisplay();
}

function updatePowerDurations() {
    Object.keys(activePowers).forEach(power => {
        if (activePowers[power].active) {
            activePowers[power].duration--;
            if (activePowers[power].duration <= 0) {
                deactivatePowerUp(power);
            }
        }
    });
}

function updatePowerDisplay() {
    const powerStatus = document.getElementById('powerStatus');
    let activeText = 'Özel Güç: ';
    const activeList = Object.keys(activePowers).filter(p => activePowers[p].active);
    activeText += activeList.length ? activeList.map(p => powerTypes[p].name).join(', ') : 'Yok';
    powerStatus.textContent = activeText;
}

function moveBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.speedY *= -1;
    }

    if (checkBallCollision(ball, player1)) {
        const relativeIntersectY = (ball.y - (player1.y + player1.height / 2));
        const normalized = relativeIntersectY / (player1.height / 2);
        const bounceAngle = normalized * (Math.PI / 4);
        ball.speedX = Math.cos(bounceAngle) * ball.originalSpeed;
        ball.speedY = Math.sin(bounceAngle) * ball.originalSpeed;
        ball.x = player1.x + player1.width + ball.radius;
    }

    if (checkBallCollision(ball, player2)) {
        const relativeIntersectY = (ball.y - (player2.y + player2.height / 2));
        const normalized = relativeIntersectY / (player2.height / 2);
        const bounceAngle = normalized * (Math.PI / 4);
        ball.speedX = -Math.cos(bounceAngle) * ball.originalSpeed;
        ball.speedY = Math.sin(bounceAngle) * ball.originalSpeed;
        ball.x = player2.x - ball.radius;
    }

    powerUps.forEach((powerUp, index) => {
        if (
            ball.x + ball.radius > powerUp.x &&
            ball.x - ball.radius < powerUp.x + powerUp.width &&
            ball.y + ball.radius > powerUp.y &&
            ball.y - ball.radius < powerUp.y + powerUp.height
        ) {
            activatePowerUp(powerUp.type);
            powerUps.splice(index, 1);
        }
    });

    if (ball.x < 0) {
        score2++;
        resetBall();
        updateScore();
    } else if (ball.x > canvas.width) {
        score1++;
        resetBall();
        updateScore();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.radius = 8;

    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
    const direction = Math.random() < 0.5 ? -1 : 1;
    ball.speedX = Math.cos(angle) * ball.originalSpeed * direction;
    ball.speedY = Math.sin(angle) * ball.originalSpeed;

    Object.keys(activePowers).forEach(power => {
        if (activePowers[power].active) {
            deactivatePowerUp(power);
        }
    });

    powerUps.length = 0;
}

function updateScore() {
    document.getElementById('score1').textContent = score1;
    document.getElementById('score2').textContent = score2;
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillRect(x, y, width, height);
    ctx.shadowBlur = 0;
}

function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawPowerUp(powerUp) {
    const type = powerTypes[powerUp.type];
    ctx.save();
    ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
    ctx.rotate(powerUp.rotation);
    ctx.fillStyle = type.color;
    ctx.shadowColor = type.color;
    ctx.shadowBlur = 20;
    ctx.fillRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);
    ctx.shadowBlur = 0;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(type.symbol, 0, 0);
    ctx.restore();
    powerUp.rotation += 0.05;
}

function drawNet() {
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawRect(player1.x, player1.y, player1.width, player1.height, player1.color);
    drawRect(player2.x, player2.y, player2.width, player2.height, player2.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
    powerUps.forEach(drawPowerUp);
}

function gameLoop() {
    if (!gameRunning) return;
    movePlayer(player1, 'w', 's');
    movePlayer(player2, 'ArrowUp', 'ArrowDown');
    moveBall();
    createPowerUp();
    updatePowerDurations();
    draw();
    requestAnimationFrame(gameLoop);
}

// Oyunu başlat
gameLoop();
