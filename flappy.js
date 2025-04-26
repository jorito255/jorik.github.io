let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 300;

// Налаштування пташки
let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    vy: 0
};

const gravity = 0.25;
const jumpStrength = -5;

// Налаштування труб (перешкод)
let pipes = [];
const pipeWidth = 50;
const pipeGap = 100; 
const pipeSpeed = 2.5;
let pipeInterval = 1500; // Інтервал у мілісекундах
let lastPipeTime = Date.now();

// Головні ігрові змінні
let score = 0;
let gameOver = false;

// Обробка натискання клавіші Space для стрибка або перезапуску гри
document.addEventListener("keydown", (e) => {
    if(e.code === "Space"){
        if(gameOver) {
            resetGame();
        } else {
            bird.vy = jumpStrength;
        }
    }
});

// Обробка сенсорного керування для мобільних пристроїв
document.addEventListener("touchstart", (e) => {
    // Запобігаємо небажаним подіям (наприклад, скролінг)
    e.preventDefault();
    if(gameOver) {
        resetGame();
    } else {
        bird.vy = jumpStrength;
    }
});

function update() {
    if (!gameOver) {
        // Фізика пташки: додавання гравітації та оновлення позиції
        bird.vy += gravity;
        bird.y += bird.vy;
        
        // Генерація нових труб через певні інтервали часу
        let now = Date.now();
        if (now - lastPipeTime > pipeInterval) {
            // gapY: випадкове положення для початку зазору (залишаючи невеликі відступи зверху та знизу)
            let gapY = Math.floor(Math.random() * (canvas.height - pipeGap - 40)) + 20;
            pipes.push({ x: canvas.width, gapY: gapY, scored: false });
            lastPipeTime = now;
        }
        
        // Оновлення позиції кожної труби та перевірка на проходження і зіткнення
        for (let i = 0; i < pipes.length; i++) {
            let p = pipes[i];
            p.x -= pipeSpeed;
            
            // Якщо пташка пройшла трубу, рахуємо лише один раз
            if (!p.scored && (bird.x > p.x + pipeWidth)) {
                score++;
                p.scored = true;
            }
            
            // Перевірка колізії: якщо пташка в зоні труби, але поза зазором
            if (bird.x + bird.width > p.x && bird.x < p.x + pipeWidth) {
                if (bird.y < p.gapY || bird.y + bird.height > p.gapY + pipeGap) {
                    gameOver = true;
                }
            }
        }
        
        // Видалення труб, що вийшли за межі екрану
        pipes = pipes.filter(p => p.x + pipeWidth > 0);
        
        // Перевірка зіткнення пташки з верхньою та нижньою межами екрану
        if (bird.y < 0 || bird.y + bird.height > canvas.height) {
            gameOver = true;
        }
    }
}

function draw() {
    // Очищення полотна
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Малювання пташки – представлено колом для плавного вигляду
    ctx.fillStyle = "yellow";
    let birdCenterX = bird.x + bird.width / 2;
    let birdCenterY = bird.y + bird.height / 2;
    ctx.beginPath();
    ctx.arc(birdCenterX, birdCenterY, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Малювання труб
    ctx.fillStyle = "green";
    pipes.forEach(p => {
        // Верхня труба
        ctx.fillRect(p.x, 0, pipeWidth, p.gapY);
        // Нижня труба
        ctx.fillRect(p.x, p.gapY + pipeGap, pipeWidth, canvas.height - (p.gapY + pipeGap));
    });
    
    // Відображення рахунку
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);
    
    // Відображення повідомлення при завершенні гри
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Press Space or Tap to Restart", canvas.width / 2 - 130, canvas.height / 2 + 30);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function resetGame() {
    // Скидання початкових параметрів гри
    bird.x = 50;
    bird.y = canvas.height / 2;
    bird.vy = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    lastPipeTime = Date.now();
}

// Запуск ігрового циклу
loop();
