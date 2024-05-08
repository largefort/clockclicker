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

// Load or initialize game state
let gameState = loadGameState() || {...defaultGameState};

function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Validate the loaded state to ensure it has all necessary properties
        if (parsedState && parsedState.gameTime && parsedState.buildings && parsedState.upgrades) {
            return parsedState;
        }
    }
    return null;
}

function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function incrementTime() {
    gameState.gameTime.second++;
    if (gameState.gameTime.second >= 60) {
        gameState.gameTime.second = 0;
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
    gameState.timeBucks += gameState.timeBucksPerSecond;
    saveGameState();
    updateGame();
}

function drawClock() {
    ctx.clearRect(0, 0, clockCanvas.width, clockCanvas.height);
    ctx.beginPath();
    ctx.arc(150, 150, 140, 0, 2 * Math.PI);
    ctx.strokeStyle = '#28a745';
    ctx.stroke();
    drawClockHands();
}

function drawClockHands() {
    let hourAngle = (gameState.gameTime.hour % 12 + gameState.gameTime.minute / 60) * (Math.PI / 6);
    let minuteAngle = (gameState.gameTime.minute + gameState.gameTime.second / 60) * (Math.PI / 30);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#28a745";
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(150 + 70 * Math.cos(hourAngle - Math.PI / 2), 150 + 70 * Math.sin(hourAngle - Math.PI / 2));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(150 + 100 * Math.cos(minuteAngle - Math.PI / 2), 150 + 100 * Math.sin(minuteAngle - Math.PI / 2));
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function handleClockClick() {
    gameState.timeBucks += 1;
    saveGameState();
    updateGame();
}

clockCanvas.addEventListener('click', handleClockClick);

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
    if (gameState.timeBucks >= upgradeCosts[type - 1] && !gameState.upgrades[type - 1]) {
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

function updateGame() {
    drawClock();
    document.getElementById('time-display').innerText =
        `Time: ${gameState.gameTime.year}-${gameState.gameTime.month}-${gameState.gameTime.day} ${gameState.gameTime.hour}:${gameState.gameTime.minute}:${gameState.gameTime.second}\n` +
        `Time Bucks: ${gameState.timeBucks} (Rate: ${gameState.timeBucksPerSecond}/sec)`;
}

function initGame() {
    setInterval(incrementTime, 1000);
}

initGame();
