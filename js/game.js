let obstacles = [];
let score = 0;

// Load images
const rockImg = new Image();
rockImg.src = "img/rock.png";

const puddleImg = new Image();
puddleImg.src = "img/puddle.png";

// Obstacle class
class Obstacle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.type = type;
    this.image = type === "rock" ? rockImg : puddleImg;
  }

  draw() {
    const ctx = document.getElementById("game-canvas").getContext("2d");
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  update() {
    this.x -= 2;
    this.draw();
  }

  checkCollision(playerBox) {
    return (
      this.x < playerBox.x + playerBox.width &&
      this.x + this.width > playerBox.x &&
      this.y < playerBox.y + playerBox.height &&
      this.y + this.height > playerBox.y
    );
  }
}

// Spawn new obstacle randomly
function spawnObstacle() {
  const type = Math.random() < 0.5 ? "rock" : "puddle";
  const y = 160; // Adjust to ground level as needed
  const x = 500; // Spawn just off-screen right
  obstacles.push(new Obstacle(x, y, type));
}

// Run every 3 seconds
setInterval(spawnObstacle, 3000);

// Timer
let timerInterval;
let timeElapsed = 0;

function startLevel(levelNumber) {
  console.log(`Starting level ${levelNumber}`);

  // Reset values
  timeElapsed = 0;
  score = 0;
  obstacles = [];

  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = "0:00";

  timerInterval = setInterval(() => {
    timeElapsed++;
    let minutes = Math.floor(timeElapsed / 60);
    let seconds = timeElapsed % 60;
    document.getElementById("timer").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);

  updateGame();
}

function updateGame() {
  const ctx = document.getElementById("game-canvas").getContext("2d");
  ctx.clearRect(0, 0, 500, 300); // Adjust canvas size as needed

  // Update + draw all obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.update();

    // Basic player collision box
    const playerBox = {
      x: posX,
      y: 200 - posY, // adjust depending on your avatar position logic
      width: player.offsetWidth,
      height: player.offsetHeight,
    };

    if (obs.checkCollision(playerBox)) {
      score -= 10;
      document.getElementById("score").textContent = score;
      obstacles.splice(i, 1); // Remove on hit
    } else if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1); // Remove if off screen
    }
  }

  requestAnimationFrame(updateGame);
}
