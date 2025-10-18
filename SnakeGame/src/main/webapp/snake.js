// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// 游戏设置
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 1; // 水平方向速度
let dy = 0; // 垂直方向速度
let nextDx = 1; // 下一次水平方向速度
let nextDy = 0; // 下一次垂直方向速度
let score = 0;
let gameLoop;
let isPaused = false;
let gameSpeed = 150; // 初始速度(毫秒)

// 初始化游戏
function initGame() {
    snake = [{x: 10, y: 10}];
    dx = 1;
    dy = 0;
    nextDx = 1;
    nextDy = 0;
    score = 0;
    scoreElement.textContent = score;
    generateFood();
}

// 生成食物
function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    // 确保食物不会出现在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// 绘制游戏元素
function draw() {
    // 清空画布
    ctx.fillStyle = '#e6f7ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    ctx.fillStyle = '#4CAF50';
    for (let segment of snake) {
        ctx.fillRect(
            segment.x * gridSize, 
            segment.y * gridSize, 
            gridSize - 1, // 减1是为了显示网格效果
            gridSize - 1
        );
    }
    
    // 绘制食物
    ctx.fillStyle = '#f44336';
    ctx.fillRect(
        food.x * gridSize, 
        food.y * gridSize, 
        gridSize - 1, 
        gridSize - 1
    );
}

// 更新游戏状态
function update() {
    if (isPaused) return;
    
    // 更新方向
    dx = nextDx;
    dy = nextDy;
    
    // 创建新头部
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // 检查碰撞
    // 墙壁碰撞
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // 自身碰撞
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    // 添加新头部
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        
        // 每得50分加速一次
        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameLoop);
            gameLoop = setInterval(game, gameSpeed);
        }
    } else {
        // 没吃到食物就移除尾部
        snake.pop();
    }
    
    draw();
}

// 游戏主循环
function game() {
    update();
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    alert(`游戏结束! 最终得分: ${score}`);
    initGame();
    draw();
}

// 处理键盘输入
function handleKeyPress(e) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const W_KEY = 87;
    const A_KEY = 65;
    const S_KEY = 83;
    const D_KEY = 68;
    
    const keyPressed = e.keyCode;
    
    // 防止180度转向
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;
    
    if ((keyPressed === LEFT_KEY || keyPressed === A_KEY) && !goingRight) {
        nextDx = -1;
        nextDy = 0;
    }
    if ((keyPressed === UP_KEY || keyPressed === W_KEY) && !goingDown) {
        nextDx = 0;
        nextDy = -1;
    }
    if ((keyPressed === RIGHT_KEY || keyPressed === D_KEY) && !goingLeft) {
        nextDx = 1;
        nextDy = 0;
    }
    if ((keyPressed === DOWN_KEY || keyPressed === S_KEY) && !goingUp) {
        nextDx = 0;
        nextDy = 1;
    }
}

// 事件监听
document.addEventListener('keydown', handleKeyPress);

startBtn.addEventListener('click', () => {
    if (gameLoop) clearInterval(gameLoop);
    isPaused = false;
    gameLoop = setInterval(game, gameSpeed);
});

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "继续" : "暂停";
});

// 初始化游戏
initGame();
draw();