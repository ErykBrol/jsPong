// Runs 60 times per second
var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {window.setTimeout(callback, 1000/60)};

// Where all the drawing will take place
var canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 600;

// Allows for 2d rendering
var context = canvas.getContext('2d');

window.onload = function() {
    document.body.appendChild(canvas);
    animate(step);
};

// Main function that updates and draws everything
var step = function() {
    if (!end) {
        update();
    }
    render();
    animate(step);
};

var player = new Player();
var ai = new Computer();
var ball = new Ball(200, 300);

var keysDown = {};
var end = false;

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});

function Player() {
    this.paddle = new Paddle(150, 540, 100, 10, "#1B35D2");
    this.score = 0;
}

Player.prototype.render = function() {
    this.paddle.render();
};

Player.prototype.update = function() {
    player.paddle.xVel = 0;

    for (var key in keysDown) {
        var keyVal= Number(key);

        if (keyVal == 87 || keyVal == 37) {
            player.paddle.x += -6;
            player.paddle.xVel = -6;
        } else if (keyVal == 65 || keyVal == 39) {
            player.paddle.x += 6;
            player.paddle.xVel = 6;
        }
    }
    this.paddle.update();
};

function Computer() {
    this.paddle = new Paddle(150, 50, 100, 10, "#FF1A42");
    this.score = 0;
}

Computer.prototype.render = function() {
    this.paddle.render();
};

Computer.prototype.update = function() {
    this.paddle.xVel = 0;
    if (ball.x < (this.paddle.x)) {
        this.paddle.x += -6;
        this.paddle.xVel = -6;
    } else if (ball.x > (this.paddle.x + this.paddle.width)) {
        this.paddle.x += 6;
        this.paddle.xVel = 6;
    }

    this.paddle.update();
};

function Paddle(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.xVel = 0;
    this.yVel = 0;
}

Paddle.prototype.render = function() {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.update = function() {
    if (this.x < 0) {
        this.x = 0;
        this.xVel = 0;
    } else if ((this.x + this.width) > 400) {
        this.x = 400 - this.width;
        this.xVel = 0;
    }
};

function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.xVel = 0;
    this.yVel = 7;
    this.rad = 10;
}

Ball.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.rad, 0, 2*Math.PI);
    context.fillStyle = "#ffe0ff";
    context.fill();
};

// paddle 1 is bottom paddle, paddle2 is top paddle
Ball.prototype.update = function(paddle1, paddle2) {
    this.x += this.xVel;
    this.y += this.yVel;
    var topX = this.x - this.rad;
    var topY = this.y - this.rad;
    var botX = this.x + this.rad;
    var botY = this.y + this.rad;

    if (topX < 0) { // Left wall
        this.x = this.rad;
        this.xVel = -this.xVel;
    } else if (botX > 400) { // Right wall
        this.x = 400 - this.rad;
        this.xVel = -this.xVel;
    }

    // Goals
    if (topY < 0) {
        player.score++;
        this.xVel = 0;
        this.yVel = 5;
        this.x = 200;
        this.y = 300;
    } else if (botY > 600) {
        ai.score++;
        this.xVel = 0;
        this.yVel = 5;
        this.x = 200;
        this.y = 300;
    }

    if (player.score == 5 || ai.score == 5) {
        end = true;
    }

    // Top paddle
    if (topX < (paddle2.x + paddle2.width)  && botX > paddle2.x
        && topY < (paddle2.y + paddle2.height) && botY > paddle2.y)
    {
        this.yVel = -this.yVel;
        this.xVel += (paddle2.xVel);
        this.y += this.yVel;
    }
    // Bottom paddle
    else if (this.x < (paddle1.x + paddle1.width)  && (this.x + this.rad) > paddle1.x
        && this.y < (paddle1.y + paddle1.height) && this.rad + this.y > paddle1.y)
    {
        this.yVel = -this.yVel;
        this.xVel += (paddle1.xVel);
        this.y += this.yVel;
    }
};

var drawScores = function() {
    var topScore = ai.score;
    var botScore = player.score;

    context.font = "150px Calibri";
    context.fillStyle = "#333333";
    context.textAlign = "center";
    context.fillText(topScore.toString(), 200, 250);
    context.fillText("-", 200, 345);
    context.fillText(botScore.toString(), 200, 450);
}

var endGame = function() {
    var winner = "Blue";
    if (ai.score > player.score) {
        winner = "Red";
    }

    context.fillStyle = context.fillStyle = "#B5ECF7";
    context.fillRect(0,0,canvas.width,canvas.height);

    context.font = "90px Calibri";
    context.fillStyle = "#333333";
    context.textAlign = "center";
    context.fillText(winner, 200, 250);
    context.fillText("wins!", 200, 350);
    context.font = "20px Calibri";
    context.fillText("Press 'R' to restart match", 200, 450);
}

var restart = function() {
    for (var key in keysDown) {
        var keyVal = Number(key);
        if (keyVal == 82) {
            ai.score = 0;
            player.score = 0;

            ai.paddle.x = 150;
            player.paddle.x = 150;
            ball.x = 200;
            ball.y = 300;

            end = false;
        }
    }
}

var update = function() {
    player.update();
    ai.update();
    ball.update(player.paddle, ai.paddle);
};

var render = function() {
    context.fillStyle = "#B5ECF7";
    context.fillRect(0,0,canvas.width,canvas.height);
    drawScores();
    player.render();
    ai.render();
    ball.render();

    if (end) {
        endGame();
        restart();
    }
};
