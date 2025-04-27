// ====================
// game variables
// ====================

let isHurt = false;
let currentLevel = 1;
let obstacles = [];
let droplets = [];
let dropletInterval;
let obstacleInterval;
let timerInterval;
let updateGameFrame;
let lives = 3;
let score = 0;
let timeElapsed = 0;
let backgroundX = 0;
let isPaused = false;

const player = document.getElementById("player-avatar");
const gameArea = document.querySelector(".game-area");
const gameAreaWidth = gameArea.offsetWidth;
const avatarWidth = player.offsetWidth;

let posX = 30;
let posY = 100;
let isJumping = false;
let keys = {};

// difficulty variables
let difficulty = "easy";
let obstacleFrequency;
let surviveTime;

// ====================
// difficulty functions
// ====================

function setDifficultySettings() {
  if (difficulty === "easy") {
    obstacleFrequency = 3400;
    surviveTime = 30;
    lives = 3;
  } else if (difficulty === "medium") {
    obstacleFrequency = 2700;
    surviveTime = 45;
    lives = 2;
  } else if (difficulty === "hard") {
    obstacleFrequency = 2000;
    surviveTime = 60;
    lives = 1;
  }
}

function selectDifficulty(selected) {
  difficulty = selected;
  startGame();
}

function fadeInMusic(audioElement, duration = 2000) {
  audioElement.volume = 0; // start at 0 volume
  audioElement.play();

  const step = 0.07; // how much to increase each step
  const intervalTime = duration * step; // how fast each step happens

  const fadeInterval = setInterval(() => {
    if (audioElement.volume < 1) {
      audioElement.volume = Math.min(1, audioElement.volume + step);
    } else {
      clearInterval(fadeInterval);
    }
  }, intervalTime);
}

// ====================
// start game functions
// ====================

function startGame() {
  document.getElementById("title-music").pause();
  document.getElementById("title-music").currentTime = 0;
  fadeInMusic(document.getElementById("background-music"));

  const titleWrapper = document.querySelector(".title-wrapper");
  titleWrapper.style.animation = "fadeOut 0.5s ease forwards";

  setTimeout(() => {
    titleWrapper.style.display = "none";
    document.getElementById("difficulty-select").style.display = "none";
    document.getElementById("game-screen").style.display = "block";

    setDifficultySettings();
    startLevel(1);
  }, 500);
}

// ====================
// player movement
// ====================

document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

function updatePlayer() {
  if (keys["d"] || keys["arrowright"]) {
    posX += 5;
    if (posX > 240) posX = 240;
    if (posX < 0) posX = 0;
    player.style.left = posX + "px";

    backgroundX -= 2;
    gameArea.style.backgroundPosition = `${backgroundX}px 0`;

    if (!isJumping && !isHurt) player.src = "img/walking-avatar.png";
  }

  if ((keys["w"] || keys["arrowup"]) && !isJumping) {
    isJumping = true;

    if (!isHurt) player.src = "img/jumping-avatar.png";

    const jumpHeight = 200;
    const jumpSpeed = 15;
    const gravity = 5;
    const groundLevel = 0;

    let jumpInterval = setInterval(() => {
      posY += jumpSpeed;
      player.style.bottom = posY + "px";

      if (posY >= groundLevel + jumpHeight) {
        clearInterval(jumpInterval);

        let fallInterval = setInterval(() => {
          posY -= gravity;
          player.style.bottom = posY + "px";

          if (posY <= groundLevel) {
            posY = groundLevel;
            player.style.bottom = posY + "px";
            clearInterval(fallInterval);
            isJumping = false;

            if (!isHurt) {
              if (keys["d"] || keys["arrowright"]) player.src = "img/walking-avatar.png";
              else player.src = "img/standing-avatar.png";
            }
          }
        }, 20);
      }
    }, 20);
  }

  if (!isJumping && !keys["d"] && !keys["arrowright"] && !isHurt) {
    player.src = "img/standing-avatar.png";
  }

  requestAnimationFrame(updatePlayer);
}

updatePlayer();

// ====================
// droplets and obstacles
// ====================

function createDroplet() {
  const droplet = document.createElement("img");
  droplet.src = "img/droplet.png";
  droplet.classList.add("droplet");
  droplet.style.position = "absolute";
  droplet.style.left = "500px";
  droplet.style.bottom = `${Math.floor(Math.random() * 100) + 150}px`;
  gameArea.appendChild(droplet);
  droplets.push(droplet);
}

function createObstacle(type) {
  const obstacle = document.createElement("img");
  obstacle.src = type === "rock" ? "img/rock.png" : "img/puddle.png";
  obstacle.classList.add("obstacle");
  obstacle.style.left = "800px";
  obstacle.style.bottom = "0px";
  obstacle.style.position = "absolute";
  gameArea.appendChild(obstacle);
  obstacles.push(obstacle);
}

function spawnObstacle() {
  const type = Math.random() < 0.5 ? "rock" : "puddle";
  createObstacle(type);
}

// ====================
// starting level
// ====================

function startLevel(levelNumber) {
  player.style.display = "block";
  player.src = "img/standing-avatar.png";
  posX = 30;
  posY = 0;
  player.style.left = posX + "px";
  player.style.bottom = posY + "px";

  const hearts = document.querySelectorAll(".heart");
  hearts.forEach((heart, index) => {
    heart.style.visibility = index < lives ? "visible" : "hidden";
  });

  currentLevel = levelNumber;
  score = 0;
  timeElapsed = 0;
  obstacles.forEach(o => o.remove());
  droplets.forEach(d => d.remove());
  obstacles = [];
  droplets = [];

  gameArea.style.display = "block";
  document.getElementById("level-text").textContent = difficulty;
  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = "0:00";

  clearInterval(timerInterval);
  clearInterval(dropletInterval);
  clearInterval(obstacleInterval);

  timerInterval = setInterval(() => {
    timeElapsed++;
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    document.getElementById("timer").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (timeElapsed === Math.floor(surviveTime / 2)) showHalfwayMessage();
    if (timeElapsed === surviveTime) {
      clearInterval(timerInterval);
      levelComplete();
    }
  }, 1000);

  dropletInterval = setInterval(() => {
    if (Math.random() < 0.7) createDroplet();
  }, 4000);

  obstacleInterval = setInterval(spawnObstacle, obstacleFrequency);

  updateGame();
}

function updateDroplets() {
  for (let i = droplets.length - 1; i >= 0; i--) {
    const drop = droplets[i];
    let currentLeft = parseInt(drop.style.left);
    drop.style.left = (currentLeft - 2) + "px";

    const dropRect = drop.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      dropRect.left < playerRect.right &&
      dropRect.right > playerRect.left &&
      dropRect.top < playerRect.bottom &&
      dropRect.bottom > playerRect.top
    ) {
      score += 100;
      document.getElementById("droplet-sound").play();
      document.getElementById("score").textContent = score;
      showPointPopup(100, true, dropRect.left, dropRect.top);
      drop.remove();
      droplets.splice(i, 1);
    } else if (currentLeft < -30) {
      drop.remove();
      droplets.splice(i, 1);
    }
  }
}

function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    let currentLeft = parseInt(obs.style.left);
    obs.style.left = (currentLeft - 2) + "px";

    const obsRect = obs.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      obsRect.left < playerRect.right &&
      obsRect.right > playerRect.left &&
      obsRect.top < playerRect.bottom &&
      obsRect.bottom > playerRect.top
    ) {
      score -= 15;
      document.getElementById("hit-sound").play();
      document.getElementById("score").textContent = score;
      showPointPopup(15, false, obsRect.left, obsRect.top);

      if (lives > 0) {
        lives--;
        const hearts = document.querySelectorAll(".heart");
        if (hearts[lives]) {
          hearts[lives].style.animation = "heartFade 0.5s forwards";
          setTimeout(() => {
            hearts[lives].style.visibility = "hidden";
            hearts[lives].style.animation = "";
          }, 500);
        }
        if (!isHurt) {
          isHurt = true;
          player.src = "img/hit-avatar.png";
          setTimeout(() => { isHurt = false; }, 500);
        }
        if (lives === 0) gameOver();
      }

      obs.remove();
      obstacles.splice(i, 1);
    } else if (currentLeft < -30) {
      score += 30;
      document.getElementById("score").textContent = score;
      showPointPopup(30, true, obsRect.left, obsRect.top);
      obs.remove();
      obstacles.splice(i, 1);
    }
  }
}

function updateGame() {
  updateDroplets();
  updateObstacles();
  updateGameFrame = requestAnimationFrame(updateGame);
}

// ====================
// level complete and game over
// ====================

function levelComplete() {
  cancelAnimationFrame(updateGameFrame);
  clearInterval(timerInterval);
  clearInterval(dropletInterval);
  clearInterval(obstacleInterval);

  document.getElementById("level-complete").style.display = "block";
  obstacles.forEach(o => o.remove());
  droplets.forEach(d => d.remove());
  obstacles = [];
  droplets = [];
  player.style.display = "none";
}

function gameOver() {
  cancelAnimationFrame(updateGameFrame);
  clearInterval(timerInterval);
  clearInterval(dropletInterval);
  clearInterval(obstacleInterval);

  document.getElementById("game-over").style.display = "block";
  obstacles.forEach(o => o.remove());
  droplets.forEach(d => d.remove());
  obstacles = [];
  droplets = [];
  player.style.display = "none";
}

// ====================
// helper functions
// ====================

function showPointPopup(amount, isPositive, x, y) {
  const popup = document.createElement("div");
  popup.textContent = `${isPositive ? "+" : "-"}${amount}`;
  popup.className = "point-popup";
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.color = isPositive ? "#00cc66" : "#ff4444";
  document.body.appendChild(popup);
  setTimeout(() => { popup.remove(); }, 800);
}

function showHalfwayMessage() {
  const halfwayMessage = document.getElementById("halfway-message");
  halfwayMessage.style.display = "block";
  setTimeout(() => { halfwayMessage.style.display = "none"; }, 3000);
}

function returnHome() {
  document.getElementById("background-music").pause();
  document.getElementById("background-music").currentTime = 0;
  document.getElementById("title-music").play();

  cancelAnimationFrame(updateGameFrame);
  clearInterval(timerInterval);
  clearInterval(dropletInterval);
  clearInterval(obstacleInterval);

  document.getElementById("game-over").style.display = "none";
  document.getElementById("level-complete").style.display = "none";
  document.getElementById("game-screen").style.display = "none";
  document.querySelector(".title-wrapper").style.display = "block";
  document.getElementById("title-screen").style.display = "block";

  player.style.display = "block";
  player.src = "img/standing-avatar.png";
  posX = 30;
  posY = 0;
  player.style.left = posX + "px";
  player.style.bottom = posY + "px";

  obstacles.forEach(obs => obs.remove());
  droplets.forEach(d => droplet.remove());
  obstacles = [];
  droplets = [];

  lives = 3;
  score = 0;
  timeElapsed = 0;
}

// ====================
// button listeners
// ====================

document.getElementById("go-home-btn").addEventListener("click", returnHome);
document.getElementById("return-home-btn").addEventListener("click", returnHome);

document.getElementById("retry-btn").addEventListener("click", () => {
  document.getElementById("game-over").style.display = "none";
  player.style.display = "block";

  if (difficulty === "easy") lives = 3;
  else if (difficulty === "medium") lives = 2;
  else if (difficulty === "hard") lives = 1;

  document.querySelectorAll(".heart").forEach(h => h.style.visibility = "visible");
  startLevel(currentLevel);
});

document.getElementById("pause-btn").addEventListener("click", () => {
  isPaused = !isPaused;

  if (isPaused) {
    cancelAnimationFrame(updateGameFrame);
    clearInterval(timerInterval);
    clearInterval(dropletInterval);
    clearInterval(obstacleInterval);

    document.getElementById("pause-btn").textContent = "resume";
    document.getElementById("paused-overlay").style.display = "block";
  } else {
    timerInterval = setInterval(() => {
      timeElapsed++;
      const minutes = Math.floor(timeElapsed / 60);
      const seconds = timeElapsed % 60;
      document.getElementById("timer").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      if (timeElapsed === Math.floor(surviveTime / 2)) showHalfwayMessage();
      if (timeElapsed === surviveTime) {
        clearInterval(timerInterval);
        levelComplete();
      }
    }, 1000);

    dropletInterval = setInterval(() => {
      if (Math.random() < 0.7) createDroplet();
    }, 4000);

    obstacleInterval = setInterval(spawnObstacle, obstacleFrequency);

    updateGame();
    document.getElementById("pause-btn").textContent = "pause";
    document.getElementById("paused-overlay").style.display = "none";
  }
});

window.onload = function() {
  document.getElementById("title-music").play();
};