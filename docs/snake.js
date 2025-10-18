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
let dx = 1; // 水平方向速度（1右，-1左）
let dy = 0; // 垂直方向速度（1下，-1上）
let nextDx = 1; // 下一次水平方向速度（解决按键冲突）
let nextDy = 0; // 下一次垂直方向速度
let score = 0;
let gameLoop;
let isPaused = false;
let gameSpeed = 150; // 初始速度(毫秒)
let isGameRunning = false; // 新增：标记游戏是否正在运行

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
    isGameRunning = false; // 重置游戏状态
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
            gridSize - 1, // 网格间隙
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
    
    // 更新方向（解决快速按键冲突）
    dx = nextDx;
    dy = nextDy;
    
    // 创建新头部
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // 碰撞检测
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
    
    // 吃到食物处理
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        
        // 加速逻辑（每50分加速）
        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameLoop);
            gameLoop = setInterval(game, gameSpeed);
        }
    } else {
        // 没吃到食物则移除尾部
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
    isGameRunning = false;
    alert(`游戏结束! 最终得分: ${score}`);
    initGame();
    draw();
}

// 处理键盘输入（核心优化部分）
function handleKeyPress(e) {
    // 阻止按键默认行为（如页面滚动）
    e.preventDefault();
    
    const keyPressed = e.keyCode;
    
    // 当前移动方向（用于防止180度转向）
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;
    
    // 方向键/WASD控制（仅在游戏运行时生效）
    if (isGameRunning) {
        // 左移（←或A）
        if ((keyPressed === 37 || keyPressed === 65) && !goingRight) {
            nextDx = -1;
            nextDy = 0;
        }
        // 上移（↑或W）
        if ((keyPressed === 38 || keyPressed === 87) && !goingDown) {
            nextDx = 0;
            nextDy = -1;
        }
        // 右移（→或D）
        if ((keyPressed === 39 || keyPressed === 68) && !goingLeft) {
            nextDx = 1;
            nextDy = 0;
        }
        // 下移（↓或S）
        if ((keyPressed === 40 || keyPressed === 83) && !goingUp) {
            nextDx = 0;
            nextDy = 1;
        }
    }
}

// 事件监听
document.addEventListener('keydown', handleKeyPress);

// 开始游戏按钮
startBtn.addEventListener('click', () => {
    if (gameLoop) clearInterval(gameLoop);
    isPaused = false;
    isGameRunning = true; // 标记游戏开始
    pauseBtn.textContent = "暂停"; // 重置暂停按钮文字
    gameLoop = setInterval(game, gameSpeed);
});

// 暂停/继续按钮
pauseBtn.addEventListener('click', () => {
    if (!isGameRunning) return; // 游戏未开始时不响应
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "继续" : "暂停";
});

// 初始化游戏
initGame();
draw();