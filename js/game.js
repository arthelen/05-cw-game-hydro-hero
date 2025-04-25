let isHurt = false;
let currentLevel = 1;
let obstacles = [];
let dropletInterval;
let obstacleInterval;
let lives = 3;
let score = 0;
let timeElapsed = 0;
let timerInterval;
let droplets = [];
let updateGameFrame;

document.getElementById("return-home-btn").addEventListener("click", () => {
  document.getElementById("level-complete").style.display = "none";
  document.getElementById("title-screen").style.display = "block";

  // Reset visuals
  player.style.display = "block";
  player.src = "img/standing-avatar.png";
  posX = 30;
  posY = 0;
  player.style.left = posX + "px";
  player.style.bottom = posY + "px";
});

function createDroplet() {
  const droplet = document.createElement("img");
  droplet.src = "img/droplet.png"; // make sure you have this image!
  droplet.classList.add("droplet");

  droplet.style.position = "absolute";
  droplet.style.width = "20px";
  droplet.style.left = "500px";
  droplet.style.bottom = `${Math.floor(Math.random() * 100) + 150}px`; // higher up
  document.querySelector(".game-area").appendChild(droplet);
  droplets.push(droplet);
}

dropletInterval = setInterval(() => {
  if (Math.random() < 0.7) { // adjust how often they spawn
    createDroplet();
  }
}, 4000);

// 🪨 Create a DOM-based obstacle
function createObstacle(type) {
  const obstacle = document.createElement("img");
  obstacle.src = type === "rock" ? "img/rock.png" : "img/puddle.png";
  obstacle.classList.add("obstacle");
  obstacle.dataset.type = type;

  // Style/position
  obstacle.style.left = "500px"; // Start offscreen right
  obstacle.style.bottom = "0px"; // Ground level
  obstacle.style.position = "absolute";
  obstacle.style.width = "30px";

  document.querySelector(".game-area").appendChild(obstacle);
  obstacles.push(obstacle);
}

// 💧 Random obstacle generator
function spawnObstacle() {
  const type = Math.random() < 0.5 ? "rock" : "puddle";
  createObstacle(type);
}

// ⏱️ Start level
function startLevel(levelNumber) {
  player.style.display = "block";
  player.src = "img/standing-avatar.png";
  posX = 30;
  posY = 0;
  player.style.left = posX + "px";
  player.style.bottom = posY + "px";

  currentLevel = levelNumber;
  console.log(`Starting level ${levelNumber}`);

  // Reset all things
  score = 0;
  timeElapsed = 0;
  obstacles = [];

  droplets.forEach(d => d.remove());
  droplets = [];

  document.querySelector(".game-area").style.display = "block";
  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = "0:00";

  // Clear old intervals if they exist
  if (timerInterval) clearInterval(timerInterval);
  if (dropletInterval) clearInterval(dropletInterval);
  if (obstacleInterval) clearInterval(obstacleInterval);

  // Start timer
  timerInterval = setInterval(() => {
    timeElapsed++;
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    document.getElementById("timer").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (timeElapsed === 30) {
      clearInterval(timerInterval);
      levelComplete();
    }
  }, 1000);

  // Start spawning droplets again
  dropletInterval = setInterval(() => {
    if (Math.random() < 0.7) {
      createDroplet();
    }
  }, 4000);

  // Start spawning obstacles again
  obstacleInterval = setInterval(spawnObstacle, 3000);

  // Start game loop
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

// ♻️ Update obstacles and check collisions
function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    let currentLeft = parseInt(obs.style.left);
    obs.style.left = (currentLeft - 2) + "px"; // Move left

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
    
      // Lose a life
      if (lives > 0) {
        lives--;
        const hearts = document.querySelectorAll(".heart");
        if (hearts[lives]) {
          hearts[lives].style.visibility = "hidden";
        }
    
        // Hurt animation
        if (!isHurt) {
          isHurt = true;
          player.src = "img/hit-avatar.png";
          setTimeout(() => {
            isHurt = false;
          }, 500); // allow updatePlayer to resume normal sprite after 0.5s
        }
        if (lives === 0) {
          gameOver();
        }                
      }
    
      obs.remove();
      obstacles.splice(i, 1);
    } else if (currentLeft < -30) {
      score += 30;
      document.getElementById("score").textContent = score;
      showPointPopup(30, true, obs.getBoundingClientRect().left, obs.getBoundingClientRect().top);
      obs.remove();
      obstacles.splice(i, 1);
    }    
  }
}

function showPointPopup(amount, isPositive, x, y) {
  const popup = document.createElement("div");
  popup.textContent = `${isPositive ? "+" : "-"}${amount}`;
  popup.className = "point-popup";
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;

  popup.style.color = isPositive ? "#00cc66" : "#ff4444";

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 800);
}

function levelComplete() {
  // Stop everything
  cancelAnimationFrame(updateGameFrame);
  clearInterval(timerInterval);

  document.getElementById("level-complete").style.display = "block";

  // Remove active stuff
  obstacles.forEach(obs => obs.remove());
  droplets.forEach(drop => drop.remove());
  obstacles = [];
  droplets = [];

  // Optionally hide player avatar
  player.style.display = "none";
}

  document.getElementById("retry-btn").addEventListener("click", () => {
  document.getElementById("game-over").style.display = "none";
  player.style.display = "block";

  // Reset lives
  document.querySelectorAll(".heart").forEach(h => h.style.visibility = "visible");
  lives = 3;

  startLevel(currentLevel); // retry current level
});

document.getElementById("go-home-btn").addEventListener("click", () => {
  // Stop game loop and intervals
  cancelAnimationFrame(updateGameFrame);
  clearInterval(timerInterval);
  clearInterval(dropletInterval);
  clearInterval(obstacleInterval);

  // Hide all game screens
  document.getElementById("game-over").style.display = "none";
  document.getElementById("level-complete").style.display = "none";
  document.querySelector(".game-area").style.display = "none"; // 👈 HIDE GAME AREA
  document.getElementById("title-screen").style.display = "block";

  // Reset game UI state
  player.style.display = "block";
  player.src = "img/standing-avatar.png";
  posX = 30;
  posY = 0;
  player.style.left = posX + "px";
  player.style.bottom = posY + "px";

  document.querySelectorAll(".heart").forEach(h => h.style.visibility = "visible");

  // Clear elements
  document.querySelector(".game-area").innerHTML = "";

  // Reset game variables
  lives = 3;
  score = 0;
  obstacles = [];
  droplets = [];
  timeElapsed = 0;
});

function gameOver() {
  // Stop everything
  cancelAnimationFrame(updateGameFrame);
  clearInterval(timerInterval);

  document.getElementById("game-over").style.display = "block";

  // Clear remaining obstacles and droplets
  obstacles.forEach(o => o.remove());
  droplets.forEach(d => d.remove());
  obstacles = [];
  droplets = [];

  // Optionally hide player
  player.style.display = "none";
}

// 🌀 Game loop
function updateGame() {
  updateDroplets();
  updateObstacles();
  updateGameFrame = requestAnimationFrame(updateGame);
}

// 🔁 Spawn obstacle every 3 seconds
obstacleInterval = setInterval(spawnObstacle, 3000);
