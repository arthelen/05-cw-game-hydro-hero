let isHurt = false;
let obstacles = [];
let lives = 3;
let score = 0;
let timeElapsed = 0;
let timerInterval;

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
  console.log(`Starting level ${levelNumber}`);

  // Reset all things
  score = 0;
  timeElapsed = 0;
  obstacles = [];

  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = "0:00";

  // Start timer
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeElapsed++;
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    document.getElementById("timer").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);

  // Start game loop
  updateGame();
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

function gameOver() {
  document.getElementById("game-over").style.display = "block";

  setTimeout(() => {
    document.getElementById("game-over").style.display = "none";

    // Reset lives display
    const hearts = document.querySelectorAll(".heart");
    hearts.forEach((heart) => {
      heart.style.visibility = "visible";
    });

    lives = 3;
    startLevel(1); // restart level
  }, 2000);
}

// 🌀 Game loop
function updateGame() {
  updateObstacles();
  requestAnimationFrame(updateGame);
}

// 🔁 Spawn obstacle every 3 seconds
setInterval(spawnObstacle, 3000);
