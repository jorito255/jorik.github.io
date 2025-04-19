const canvas = document.getElementById("tetrisCanvas");
const context = canvas.getContext("2d");
const grid = 32;
const rows = 20;
const cols = 10;

const tetrominoes = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]]
];

let board = Array.from({ length: rows }, () => Array(cols).fill(0));
let currentTetromino = getRandomTetromino();
let offsetX = 3;
let offsetY = 0;
let score = 0;

function getRandomTetromino() {
    return tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
}

function drawBoard() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            context.fillStyle = board[row][col] ? "white" : "black";
            context.fillRect(col * grid, row * grid, grid, grid);
            context.strokeStyle = "gray";
            context.strokeRect(col * grid, row * grid, grid, grid);
        }
    }
}

function drawTetromino(tetromino, offsetX, offsetY) {
    for (let row = 0; row < tetromino.length; row++) {
        for (let col = 0; col < tetromino[row].length; col++) {
            if (tetromino[row][col]) {
                context.fillStyle = "cyan";
                context.fillRect((offsetX + col) * grid, (offsetY + row) * grid, grid, grid);
                context.strokeStyle = "white";
                context.strokeRect((offsetX + col) * grid, (offsetY + row) * grid, grid, grid);
            }
        }
    }
}

function rotateTetromino(tetromino) {
    return tetromino[0].map((_, index) => 
        tetromino.map(row => row[index]).reverse()
    );
}

function collision(tetromino, x, y) {
    for (let row = 0; row < tetromino.length; row++) {
        for (let col = 0; col < tetromino[row].length; col++) {
            if (tetromino[row][col]) {
                let newX = x + col;
                let newY = y + row;
                if (newX < 0 || newX >= cols || newY >= rows || (newY >= 0 && board[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge(tetromino, x, y) {
    for (let row = 0; row < tetromino.length; row++) {
        for (let col = 0; col < tetromino[row].length; col++) {
            if (tetromino[row][col]) {
                board[y + row][x + col] = 1;
            }
        }
    }
}

function clearLines() {
    outer: for (let row = rows - 1; row >= 0; row--) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col] === 0) {
                continue outer;
            }
        }
        board.splice(row, 1);
        board.unshift(Array(cols).fill(0));
        score += 10;
        document.getElementById("scoreDisplay").textContent = "Очки: " + score;
    }
}

document.getElementById("left").addEventListener("click", () => {
    if (!collision(currentTetromino, offsetX - 1, offsetY)) offsetX--;
});

document.getElementById("right").addEventListener("click", () => {
    if (!collision(currentTetromino, offsetX + 1, offsetY)) offsetX++;
});

document.getElementById("down").addEventListener("click", () => {
    if (!collision(currentTetromino, offsetX, offsetY + 1)) offsetY++;
});

document.getElementById("rotate").addEventListener("click", () => {
    const rotated = rotateTetromino(currentTetromino);
    if (!collision(rotated, offsetX, offsetY)) currentTetromino = rotated;
});

function gameLoop() {
    if (!collision(currentTetromino, offsetX, offsetY + 1)) {
        offsetY++;
    } else {
        merge(currentTetromino, offsetX, offsetY);
        clearLines();
        offsetX = 3;
        offsetY = 0;
        currentTetromino = getRandomTetromino();
        if (collision(currentTetromino, offsetX, offsetY)) {
            alert("Game over! Score: " + score);
            board = Array.from({ length: rows }, () => Array(cols).fill(0));
            score = 0;
            document.getElementById("scoreDisplay").textContent = "Очки: " + score;
        }
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawTetromino(currentTetromino, offsetX, offsetY);
}

setInterval(gameLoop, 500);
