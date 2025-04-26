/********** Лаунчер: перемикання секцій **********/
document.getElementById("btnFlappy").addEventListener("click", () => {
  showSection("flappy");
});
document.getElementById("btnTetris").addEventListener("click", () => {
  showSection("tetris");
});
document.getElementById("backFromFlappy").addEventListener("click", () => {
  stopFlappy();
  showSection("menu");
});
document.getElementById("backFromTetris").addEventListener("click", () => {
  stopTetris();
  showSection("menu");
});

function showSection(section) {
  // Перемикаємо видимість блоків
  document.getElementById("menuSection").style.display = (section === "menu") ? "block" : "none";
  document.getElementById("flappySection").style.display = (section === "flappy") ? "block" : "none";
  document.getElementById("tetrisSection").style.display = (section === "tetris") ? "block" : "none";
  
  if (section === "flappy") startFlappy();
  if (section === "tetris") startTetris();
}

/********** МОДУЛЬ Flappy Bird **********/
let flappyCanvas, flappyCtx;
let flappyBird, flappyGravity, flappyJumpStrength;
let flappyPipes, flappyPipeWidth, flappyPipeGap, flappyPipeSpeed;
let flappyPipeInterval, flappyLastPipeTime;
let flappyScore, flappyGameOver;
let flappyAnimationFrameId;

function initFlappy() {
  flappyCanvas = document.getElementById("flappyCanvas");
  flappyCtx = flappyCanvas.getContext("2d");
  
  flappyBird = { x: 50, y: flappyCanvas.height / 2, width: 20, height: 20, vy: 0 };
  flappyGravity = 0.25;
  flappyJumpStrength = -5;
  
  flappyPipes = [];
  flappyPipeWidth = 50;
  flappyPipeGap = 100;
  flappyPipeSpeed = 2.5;
  flappyPipeInterval = 1500;  
  flappyLastPipeTime = Date.now();
  
  flappyScore = 0;
  flappyGameOver = false;
}

function updateFlappy() {
  if (!flappyGameOver) {
    // Анімована фізика пташки
    flappyBird.vy += flappyGravity;
    flappyBird.y += flappyBird.vy;
    
    // Створення нових труб через заданий інтервал
    const now = Date.now();
    if (now - flappyLastPipeTime > flappyPipeInterval) {
      const gapY = Math.floor(Math.random() * (flappyCanvas.height - flappyPipeGap - 40)) + 20;
      flappyPipes.push({ x: flappyCanvas.width, gapY: gapY, scored: false });
      flappyLastPipeTime = now;
    }
    
    // Переміщення труб та перевірка проходження/зіткнення
    flappyPipes.forEach(p => {
      p.x -= flappyPipeSpeed;
      if (!p.scored && (flappyBird.x > p.x + flappyPipeWidth)) {
        flappyScore++;
        p.scored = true;
      }
      if (flappyBird.x + flappyBird.width > p.x &&
          flappyBird.x < p.x + flappyPipeWidth) {
        if (flappyBird.y < p.gapY || flappyBird.y + flappyBird.height > p.gapY + flappyPipeGap) {
          flappyGameOver = true;
        }
      }
    });
    // Видаляємо труби, що вийшли за межі canvas
    flappyPipes = flappyPipes.filter(p => p.x + flappyPipeWidth > 0);
    
    // Перевірка на вихід за межі екрану
    if (flappyBird.y < 0 || flappyBird.y + flappyBird.height > flappyCanvas.height) {
      flappyGameOver = true;
    }
  }
}

function drawFlappy() {
  flappyCtx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);
  
  // Малюємо пташку (коло)
  flappyCtx.fillStyle = "yellow";
  let birdCenterX = flappyBird.x + flappyBird.width / 2;
  let birdCenterY = flappyBird.y + flappyBird.height / 2;
  flappyCtx.beginPath();
  flappyCtx.arc(birdCenterX, birdCenterY, flappyBird.width / 2, 0, Math.PI * 2);
  flappyCtx.fill();
  
  // Малюємо труби
  flappyCtx.fillStyle = "green";
  flappyPipes.forEach(p => {
    // Верхня труба
    flappyCtx.fillRect(p.x, 0, flappyPipeWidth, p.gapY);
    // Нижня труба
    flappyCtx.fillRect(p.x, p.gapY + flappyPipeGap, flappyPipeWidth, flappyCanvas.height - (p.gapY + flappyPipeGap));
  });
  
  // Відображаємо рахунок
  flappyCtx.fillStyle = "black";
  flappyCtx.font = "20px Arial";
  flappyCtx.fillText("Score: " + flappyScore, 10, 25);
  
  // При завершенні гри виводимо повідомлення
  if (flappyGameOver) {
    flappyCtx.fillStyle = "red";
    flappyCtx.font = "30px Arial";
    flappyCtx.fillText("Game Over", flappyCanvas.width / 2 - 70, flappyCanvas.height / 2);
    flappyCtx.font = "20px Arial";
    flappyCtx.fillText("Tap or Space to Restart", flappyCanvas.width / 2 - 100, flappyCanvas.height / 2 + 30);
  }
}

function flappyLoop() {
  updateFlappy();
  drawFlappy();
  flappyAnimationFrameId = requestAnimationFrame(flappyLoop);
}

function flappyJump() {
  if (flappyGameOver) {
    // Якщо гра завершилася – перезапуск
    initFlappy();
  } else {
    flappyBird.vy = flappyJumpStrength;
  }
}

// Обробка клавіатурних і сенсорних подій для Flappy Bird
function flappyKeyHandler(e) {
  if (document.getElementById("flappySection").style.display === "block" && e.code === "Space") {
    flappyJump();
  }
}
function flappyTouchHandler(e) {
  if (document.getElementById("flappySection").style.display === "block") {
    e.preventDefault();
    flappyJump();
  }
}
document.addEventListener("keydown", flappyKeyHandler);
document.addEventListener("touchstart", flappyTouchHandler);

function startFlappy() {
  initFlappy();
  flappyLoop();
}

function stopFlappy() {
  cancelAnimationFrame(flappyAnimationFrameId);
}

/********** МОДУЛЬ Tetris **********/
let tetrisCanvas, tetrisCtx;
let tetrisGrid, tetrisRows, tetrisCols;
let tetrominoes, board, currentTetromino;
let tetrisOffsetX, tetrisOffsetY;
let tetrisScore;
let tetrisGameInterval;
let tetrisTouchStartX = 0, tetrisTouchStartY = 0;
const tetrisThreshold = 30;

function initTetris() {
  tetrisCanvas = document.getElementById("tetrisCanvas");
  tetrisCtx = tetrisCanvas.getContext("2d");
  tetrisGrid = 32;
  tetrisRows = 20;
  tetrisCols = 10;
  tetrominoes = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]]
  ];
  
  board = Array.from({ length: tetrisRows }, () => Array(tetrisCols).fill(0));
  currentTetromino = getRandomTetromino();
  tetrisOffsetX = 3;
  tetrisOffsetY = 0;
  tetrisScore = 0;
  updateScoreDisplay();

  // Додаємо touch-події до canvas Tetris
  tetrisCanvas.addEventListener("touchstart", tetrisTouchStart);
  tetrisCanvas.addEventListener("touchend", tetrisTouchEnd);
}

function getRandomTetromino() {
  return tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
}

function drawTetrisBoard() {
  for (let row = 0; row < tetrisRows; row++) {
    for (let col = 0; col < tetrisCols; col++) {
      tetrisCtx.fillStyle = board[row][col] ? "white" : "black";
      tetrisCtx.fillRect(col * tetrisGrid, row * tetrisGrid, tetrisGrid, tetrisGrid);
      tetrisCtx.strokeStyle = "gray";
      tetrisCtx.strokeRect(col * tetrisGrid, row * tetrisGrid, tetrisGrid, tetrisGrid);
    }
  }
}

function drawTetromino(tetromino, offsetX, offsetY) {
  for (let row = 0; row < tetromino.length; row++) {
    for (let col = 0; col < tetromino[row].length; col++) {
      if (tetromino[row][col]) {
        tetrisCtx.fillStyle = "cyan";
        tetrisCtx.fillRect((offsetX + col) * tetrisGrid, (offsetY + row) * tetrisGrid, tetrisGrid, tetrisGrid);
        tetrisCtx.strokeStyle = "white";
        tetrisCtx.strokeRect((offsetX + col) * tetrisGrid, (offsetY + row) * tetrisGrid, tetrisGrid, tetrisGrid);
      }
    }
  }
}

function rotateTetromino(tetromino) {
  return tetromino[0].map((_, index) =>
    tetromino.map(row => row[index]).reverse()
  );
}

function collisionTetris(tetromino, x, y) {
  for (let row = 0; row < tetromino.length; row++) {
    for (let col = 0; col < tetromino[row].length; col++) {
      if (tetromino[row][col]) {
        let newX = x + col;
        let newY = y + row;
        if (newX < 0 || newX >= tetrisCols || newY >= tetrisRows || (newY >= 0 && board[newY][newX])) {
          return true;
        }
      }
    }
  }
  return false;
}

function mergeTetris(tetromino, x, y) {
  for (let row = 0; row < tetromino.length; row++) {
    for (let col = 0; col < tetromino[row].length; col++) {
      if (tetromino[row][col]) {
        board[y + row][x + col] = 1;
      }
    }
  }
}

function clearTetrisLines() {
  outer: for (let row = tetrisRows - 1; row >= 0; row--) {
    for (let col = 0; col < tetrisCols; col++) {
      if (board[row][col] === 0) continue outer;
    }
    board.splice(row, 1);
    board.unshift(Array(tetrisCols).fill(0));
    tetrisScore += 10;
    updateScoreDisplay();
  }
}

function updateScoreDisplay() {
  document.getElementById("scoreDisplay").textContent = "Очки: " + tetrisScore;
}

// Обробка клавіатурних подій для Tetris
document.addEventListener("keydown", tetrisKeyHandler);
function tetrisKeyHandler(e) {
  if (document.getElementById("tetrisSection").style.display === "block") {
    switch (e.key) {
      case "ArrowLeft":
        if (!collisionTetris(currentTetromino, tetrisOffsetX - 1, tetrisOffsetY))
          tetrisOffsetX--;
        break;
      case "ArrowRight":
        if (!collisionTetris(currentTetromino, tetrisOffsetX + 1, tetrisOffsetY))
          tetrisOffsetX++;
        break;
      case "ArrowDown":
        if (!collisionTetris(currentTetromino, tetrisOffsetX, tetrisOffsetY + 1))
          tetrisOffsetY++;
        break;
      case "ArrowUp":
        const rotated = rotateTetromino(currentTetromino);
        if (!collisionTetris(rotated, tetrisOffsetX, tetrisOffsetY))
          currentTetromino = rotated;
        break;
    }
  }
}

// Обробка жестів для Tetris
function tetrisTouchStart(e) {
  const touch = e.touches[0];
  tetrisTouchStartX = touch.clientX;
  tetrisTouchStartY = touch.clientY;
}
function tetrisTouchEnd(e) {
  const touch = e.changedTouches[0];
  let deltaX = touch.clientX - tetrisTouchStartX;
  let deltaY = touch.clientY - tetrisTouchStartY;
  
  if (Math.abs(deltaX) < tetrisThreshold && Math.abs(deltaY) < tetrisThreshold) {
    // Тап – поворот фігури
    const rotated = rotateTetromino(currentTetromino);
    if (!collisionTetris(rotated, tetrisOffsetX, tetrisOffsetY))
      currentTetromino = rotated;
  } else {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Горизонтальний свайп
      if (deltaX > 0) {
        if (!collisionTetris(currentTetromino, tetrisOffsetX + 1, tetrisOffsetY))
          tetrisOffsetX++;
      } else {
        if (!collisionTetris(currentTetromino, tetrisOffsetX - 1, tetrisOffsetY))
          tetrisOffsetX--;
      }
    } else {
      // Вертикальний свайп (тільки вниз)
      if (deltaY > 0) {
        if (!collisionTetris(currentTetromino, tetrisOffsetX, tetrisOffsetY + 1))
          tetrisOffsetY++;
      }
    }
  }
}

function tetrisGameLoop() {
  if (!collisionTetris(currentTetromino, tetrisOffsetX, tetrisOffsetY + 1)) {
    tetrisOffsetY++;
  } else {
    mergeTetris(currentTetromino, tetrisOffsetX, tetrisOffsetY);
    clearTetrisLines();
    tetrisOffsetX = 3;
    tetrisOffsetY = 0;
    currentTetromino = getRandomTetromino();
    if (collisionTetris(currentTetromino, tetrisOffsetX, tetrisOffsetY)) {
      alert("Game over! Score: " + tetrisScore);
      board = Array.from({ length: tetrisRows }, () => Array(tetrisCols).fill(0));
      tetrisScore = 0;
      updateScoreDisplay();
    }
  }
  tetrisCtx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
  drawTetrisBoard();
  drawTetromino(currentTetromino, tetrisOffsetX, tetrisOffsetY);
}

function startTetris() {
  initTetris();
  tetrisGameInterval = setInterval(tetrisGameLoop, 500);
}

function stopTetris() {
  clearInterval(tetrisGameInterval);
}
