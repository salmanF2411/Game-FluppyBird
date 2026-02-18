const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ======================
   ASSETS & SOUNDS
====================== */
const bgImg = new Image();
bgImg.src = "assets/background.png";
const pipeImg = new Image();
pipeImg.src = "assets/pipe2-.png";
const birdImg = new Image();
birdImg.src = "assets/Flappy-Bird.png";

// Sound Effects
const soundFly = document.getElementById("soundFly");
const soundScore = document.getElementById("soundScore");
const soundDie = document.getElementById("soundDie");

/* ======================
   GAME STATE
====================== */
let gameStarted = false;
let gameOver = false;
let score = 0;
let frame = 0;

let bird = {
  x: 80,
  y: 250,
  width: 40,
  height: 30,
  gravity: 0.5,
  jump: -8,
  speed: 0,
};
let pipes = [];
const pipeWidth = 60;
const pipeGap = 160;
const pipeSpeed = 2;

/* ======================
   CONTROLS
====================== */
function control() {
  if (gameOver) return;
  if (!gameStarted) {
    gameStarted = true;
  }
  bird.speed = bird.jump;

  // Putar suara kepak sayap
  soundFly.currentTime = 0;
  soundFly.play();
}

// Listeners
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") control();
});
canvas.addEventListener("click", control);
const jumpBtnMobile = document.getElementById("jumpBtnMobile");
jumpBtnMobile.addEventListener("touchstart", (e) => {
  e.preventDefault();
  control();
});

/* ======================
   GAME LOGIC
====================== */
function createPipe() {
  let minH = 50;
  let maxH = canvas.height - pipeGap - minH;
  let topH = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
  pipes.push({
    x: canvas.width,
    top: topH,
    bottom: canvas.height - topH - pipeGap,
    passed: false,
  });
}

function update() {
  if (!gameStarted || gameOver) return;

  bird.speed += bird.gravity;
  bird.y += bird.speed;

  if (bird.y < 0 || bird.y + bird.height > canvas.height) endGame();

  if (frame % 100 === 0) createPipe();

  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;
    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      score++;
      pipe.passed = true;
      soundScore.play(); // Suara poin
    }
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      endGame();
    }
  });

  pipes = pipes.filter((p) => p.x + pipeWidth > 0);
  frame++;
}

function draw() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  pipes.forEach((pipe) => {
    ctx.save();
    ctx.translate(pipe.x + pipeWidth / 2, pipe.top / 2);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, -pipeWidth / 2, -pipe.top / 2, pipeWidth, pipe.top);
    ctx.restore();
    ctx.drawImage(
      pipeImg,
      pipe.x,
      canvas.height - pipe.bottom,
      pipeWidth,
      pipe.bottom,
    );
  });

  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  // Score Pixel Art
  if (gameStarted || gameOver) {
    ctx.save();
    ctx.fillStyle = "#e3c505";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.strokeText("Score: " + score, 30, 60);
    ctx.fillText("Score: " + score, 30, 60);
    ctx.restore();
  }

  // Start Animation
  if (!gameStarted && !gameOver) {
    let scale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.strokeText("START THE GAME", 0, 0);
    ctx.fillText("START THE GAME", 0, 0);
    ctx.restore();
  }
}

function endGame() {
  if (!gameOver) {
    gameOver = true;
    soundDie.play(); // Suara mati
    document.getElementById("finalScore").innerText = score;
    document.getElementById("gameOverPopup").classList.remove("hidden");
  }
}

document.getElementById("retryBtn").addEventListener("click", () => {
  bird.y = 250;
  bird.speed = 0;
  pipes = [];
  score = 0;
  frame = 0;
  gameOver = false;
  gameStarted = false;
  document.getElementById("gameOverPopup").classList.add("hidden");
});

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();
