class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 600;
        this.canvas.height = 400;
        
        // Game settings
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.gameSpeed = 100;
        
        // Initialize game
        this.setupEventListeners();
        this.updateHighScore();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
    }

    handleKeyPress(event) {
        const key = event.key;
        const directions = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        if (directions[key]) {
            const newDirection = directions[key];
            const opposites = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };

            if (this.direction !== opposites[newDirection]) {
                this.direction = newDirection;
            }
        }
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return {x, y};
    }

    moveSnake() {
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check collision with walls
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver();
            return;
        }

        // Check collision with self
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check if snake ate food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
            // Increase speed
            if (this.score % 50 === 0) {
                this.gameSpeed = Math.max(50, this.gameSpeed - 5);
                this.restartGameLoop();
            }
        } else {
            this.snake.pop();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#45a049';
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // Draw food
        this.ctx.fillStyle = '#ff5252';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.updateHighScore();
            localStorage.setItem('snakeHighScore', this.highScore);
        }
    }

    updateHighScore() {
        document.getElementById('highScore').textContent = this.highScore;
    }

    gameOver() {
        clearInterval(this.gameLoop);
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
        
        // Send score to server
        fetch('/update_score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({score: this.score})
        });
    }

    startGame() {
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        this.gameSpeed = 100;
        this.updateScore();
        this.food = this.generateFood();
        document.getElementById('gameOver').classList.add('hidden');
        this.isPaused = false;
        this.restartGameLoop();
    }

    restartGame() {
        this.startGame();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            clearInterval(this.gameLoop);
            document.getElementById('pauseBtn').textContent = 'Resume';
        } else {
            this.restartGameLoop();
            document.getElementById('pauseBtn').textContent = 'Pause';
        }
    }

    restartGameLoop() {
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            this.moveSnake();
            this.draw();
        }, this.gameSpeed);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new SnakeGame();
});
