const clockCanvas = document.getElementById('clockCanvas');
const ctx = clockCanvas.getContext('2d');

// Default game state
const defaultGameState = {
    timeBucks: 0,
    timeBucksPerSecond: 0,
    buildings: [0, 0, 0, 0, 0, 0],  // Number of each building type
    upgrades: [0, 0, 0, 0],         // Upgrade status (0 or 1)
    gameTime: {
        second: 0,
        minute: 0,
        hour: 0,
        day: 1,
        month: 1,
        year: 2024
    }
};

let gameState = loadGameState() || {...defaultGameState};

function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState && parsedState.gameTime && parsedState.buildings && parsedState.upgrades) {
            return parsedState;
        }
    }
    return null;
}

function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function incrementTime(msElapsed) {
    let msPerGameSecond = 1000 - gameState.buildings.reduce((acc, curr) => acc + curr * 20, 0);
    gameState.gameTime.second += msElapsed / msPerGameSecond;

    while (gameState.gameTime.second >= 60) {
        gameState.gameTime.second -= 60;
        gameState.gameTime.minute++;
    }
    if (gameState.gameTime.minute >= 60) {
        gameState.gameTime.minute = 0;
        gameState.gameTime.hour++;
    }
    if (gameState.gameTime.hour >= 24) {
        gameState.gameTime.hour = 0;
        gameState.gameTime.day++;
    }
    if (gameState.gameTime.day > 30) {
        gameState.gameTime.day = 1;
        gameState.gameTime.month++;
    }
    if (gameState.gameTime.month > 12) {
        gameState.gameTime.month = 1;
        gameState.gameTime.year++;
    }
    gameState.timeBucks += gameState.timeBucksPerSecond * (msElapsed / 1000);
    saveGameState();
    updateGame();
}

function updateGame() {
    drawClock();
    document.getElementById('time-display').innerText =
        `Time: ${gameState.gameTime.year}-${gameState.gameTime.month}-${gameState.gameTime.day} ${gameState.gameTime.hour}:${gameState.gameTime.minute}:${gameState.gameTime.second}\n` +
        `Time Bucks: ${gameState.timeBucks} (Rate: ${gameState.timeBucksPerSecond}/sec)`;
}

function drawClock() {
    ctx.clearRect(0, 0, clockCanvas.width, clockCanvas.height);

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(150, 150, 140, 0, 2 * Math.PI);
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Draw clock center
    ctx.beginPath();
    ctx.arc(150, 150, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();

    // Draw hour marks and numbers
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
        let angle = (i - 3) * (Math.PI / 6);
        let x1 = 150 + 120 * Math.cos(angle);
        let y1 = 150 + 120 * Math.sin(angle);
        let x2 = 150 + 130 * Math.cos(angle);
        let y2 = 150 + 130 * Math.sin(angle);

        // Draw hour marks
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Draw numbers
        let numberX = 150 + 100 * Math.cos(angle);
        let numberY = 150 + 100 * Math.sin(angle);
        ctx.fillText(i.toString(), numberX, numberY);
    }

    // Draw minute marks
    for (let i = 0; i < 60; i++) {
        if (i % 5 !== 0) { // Only draw if not an hour mark
            ctx.beginPath();
            let angle = (i - 15) * (Math.PI / 30);
            let x1 = 150 + 125 * Math.cos(angle);
            let y1 = 150 + 125 * Math.sin(angle);
            let x2 = 150 + 130 * Math.cos(angle);
            let y2 = 150 + 130 * Math.sin(angle);
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    drawClockHands();
}

function drawClockHands() {
    // Draw hour hand
    let hourAngle = (gameState.gameTime.hour % 12 + gameState.gameTime.minute / 60) * (Math.PI / 6) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(150 + 70 * Math.cos(hourAngle), 150 + 70 * Math.sin(hourAngle));
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Draw minute hand
    let minuteAngle = (gameState.gameTime.minute + gameState.gameTime.second / 60) * (Math.PI / 30) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(150 + 110 * Math.cos(minuteAngle), 150 + 110 * Math.sin(minuteAngle));
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Draw second hand
    let secondAngle = gameState.gameTime.second * (Math.PI / 30) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(150 + 120 * Math.cos(secondAngle), 150 + 120 * Math.sin(secondAngle));
    ctx.strokeStyle = '#D40000';  // A vivid red color for the second hand
    ctx.lineWidth = 6;
    ctx.stroke();
}

function buyBuilding(type) {
    const costs = [100, 500, 1000, 2000, 3000, 5000];
    const increments = [1, 5, 10, 20, 50, 100];
    if (gameState.timeBucks >= costs[type - 1]) {
        gameState.timeBucks -= costs[type - 1];
        gameState.timeBucksPerSecond += increments[type - 1];
        gameState.buildings[type - 1]++;
        saveGameState();
        updateGame();
    }
}

function buyUpgrade(type) {
    const upgradeCosts = [1000, 2000, 5000, 10000];
    if (gameState.timeBucks >= upgradeCosts[type - 1] && gameState.upgrades[type - 1] === 0) {
        gameState.timeBucks -= upgradeCosts[type - 1];
        gameState.upgrades[type - 1] = 1;
        applyUpgradeEffects(type);
        saveGameState();
        updateGame();
    }
}

function applyUpgradeEffects(type) {
    const multipliers = [2, 3, 4, 5];
    gameState.timeBucksPerSecond *= multipliers[type - 1];
}

clockCanvas.addEventListener('click', function() {
    gameState.timeBucks += 1;
    saveGameState();
    updateGame();
});

function initGame() {
    setInterval(() => {
        incrementTime(1000);
    }, 1000);
}

initGame();
