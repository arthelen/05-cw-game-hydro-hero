// game variables
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

// difficulty Variables
let difficulty = "easy"; // Will be set by player choosing
let obstacleFrequency;
let surviveTime;

// difficulty settings
function setDifficultySettings() {
  if (difficulty === "easy") {
    obstacleFrequency = 3000; // spawn every 3 sec
    surviveTime = 30; // survive 30 seconds
    lives = 3;
  } else if (difficulty === "medium") {
    obstacleFrequency = 2000;
    surviveTime = 45;
    lives = 2;
  } else if (difficulty === "hard") {
    obstacleFrequency = 1000;
    surviveTime = 60;
    lives = 1;
  }
}

function selectDifficulty(selected) {
  difficulty = selected;
  startGame();
}

// event listeners for difficulty buttons
document.getElementById("return-home-btn").addEventListener("click", () => {
  document.getElementById("level-complete").style.display = "none";
  document.getElementById("title-screen").style.display = "block";

  player.style.display = "block";
  player.src = "img/standing-avatar.png";
  posX = 30;
  posY = 0;
  player.style.left = posX + "px";
  player.style.bottom = posY + "px";
});

// droplets
function createDroplet() {
  const droplet = document.createElement("img");
  droplet.src = "img/droplet.png";
  droplet.classList.add("droplet");

  droplet.style.position = "absolute";
  droplet.style.width = "20px";
  droplet.style.left = "500px";
  droplet.style.bottom = `${Math.floor(Math.random() * 100) + 150}px`;
  document.querySelector(".game-area").appendChild(droplet);
  droplets.push(droplet);
}
// obstacles
function createObstacle(type) {
  const obstacle = document.createElement("img");
  obstacle.src = type === "rock" ? "img/rock.png" : "img/puddle.png";
  obstacle.classList.add("obstacle");
  obstacle.dataset.type = type;

  obstacle.style.left = "500px";
  obstacle.style.bottom = "0px";
  obstacle.style.position = "absolute";
  obstacle.style.width = "30px";

  document.querySelector(".game-area").appendChild(obstacle);
  obstacles.push(obstacle);
}

function spawnObstacle() {
  const type = Math.random() < 0.5 ? "rock" : "puddle";
  createObstacle(type);
}

// start game
function startGame() {
  document.getElementById("title-screen").style.display = "none";
  document.getElementById("difficulty-select").style.display = "none";
  document.getElementById("game-screen").style.display = "block";

  setDifficultySettings();
  startLevel(1);
  console.log("game is updating");
}

// start level
function startLevel(levelNumber) {
  player.style.display = "block";
  player.src = "img/standing-avatar.png";
  posX = 30;
  posY = 0;
  player.style.left = posX + "px";
  player.style.bottom = posY + "px";

  currentLevel = levelNumber;
  score = 0;
  timeElapsed = 0;
  obstacles = [];
  droplets.forEach(d => d.remove());
  droplets = [];

  document.querySelector(".game-area").style.display = "block";
  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = "0:00";

  if (timerInterval) clearInterval(timerInterval);
  if (dropletInterval) clearInterval(dropletInterval);
  if (obstacleInterval) clearInterval(obstacleInterval);

  timerInterval = setInterval(() => {
    timeElapsed++;
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    document.getElementById("timer").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

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

// udpate functions
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
      console.log("HIT!");
      score -= 15;
      document.getElementById("score").textContent = score;
      showPointPopup(15, false, obsRect.left, obsRect.top);

      if (lives > 0) {
        lives--;
        const hearts = document.querySelectorAll(".heart");
        if (hearts[lives]) hearts[lives].style.visibility = "hidden";

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

// end game
function levelComplete() {
  cancelAnimationFrame(updateGameFrame);
  clearInterval(timerInterval);

  document.getElementById("level-complete").style.display = "block";

  obstacles.forEach(obs => obs.remove());
  droplets.forEach(drop => drop.remove());
  obstacles = [];
  droplets = [];

  player.style.display = "none";
}

function gameOver() {
  cancelAnimationFrame(updateGameFrame);
  clearInterval(timerInterval);

  document.getElementById("game-over").style.display = "block";

  obstacles.forEach(obs => obs.remove());
  droplets.forEach(drop => drop.remove());
  obstacles = [];
  droplets = [];

  player.style.display = "none";
}

// popup points
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

// retry and home buttons
document.getElementById("retry-btn").addEventListener("click", () => {
  document.getElementById("game-over").style.display = "none";
  player.style.display = "block";

  document.querySelectorAll(".heart").forEach(h => h.style.visibility = "visible");
  startLevel(currentLevel);
});

document.getElementById("go-home-btn").addEventListener("click", () => {
  cancelAnimationFrame(updateGameFrame);
  clearInterval(timerInterval);
  clearInterval(dropletInterval);
  clearInterval(obstacleInterval);

  document.getElementById("game-over").style.display = "none";
  document.getElementById("level-complete").style.display = "none";
  document.querySelector(".game-area").style.display = "none";
  document.getElementById("title-wrapper").style.display = "block";

  player.style.display = "block";
  player.src = "img/standing-avatar.png";
  posX = 30;
  posY = 0;
  player.style.left = posX + "px";
  player.style.bottom = posY + "px";

  document.querySelectorAll(".heart").forEach(h => h.style.visibility = "visible");

  document.querySelector(".game-area").innerHTML = "";
  lives = 3;
  score = 0;
  obstacles = [];
  droplets = [];
  timeElapsed = 0;
});
