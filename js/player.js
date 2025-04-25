let backgroundX = 0;
const player = document.getElementById("player-avatar");
const gameArea = document.querySelector(".game-area");
const gameAreaWidth = gameArea.offsetWidth;
const avatarWidth = player.offsetWidth;

let posX = 30;
let posY = 100;
let isJumping = false;
let keys = {};

// These keys are managed in game.js globally
// let isHurt is already declared in game.js

document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

function updatePlayer() {
  // ▶️ move right (Hold D or →)
  if (keys["d"] || keys["arrowright"]) {
    posX += 5;
    if (posX > 240) posX = 240;
    if (posX < 0) posX = 0;
    player.style.left = posX + "px";

    // Scroll background
    backgroundX -= 2;
    document.querySelector(".game-area").style.backgroundPosition = `${backgroundX}px 0`;

    // Only change to walking sprite if not jumping or hurt
    if (!isJumping && !isHurt) {
      player.src = "img/walking-avatar.png";
    }
  }

  // ⬆️ jump (Press W or ↑)
  if ((keys["w"] || keys["arrowup"]) && !isJumping) {
    isJumping = true;

    if (!isHurt) {
      player.src = "img/jumping-avatar.png";
    }

    const jumpHeight = 150;
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

            // return to appropriate sprite
            if (!isHurt) {
              if (keys["d"] || keys["arrowright"]) {
                player.src = "img/walking-avatar.png";
              } else {
                player.src = "img/standing-avatar.png";
              }
            }
          }
        }, 20);
      }
    }, 20);
  }

  // 🧍 if standing still
  if (!isJumping && !keys["d"] && !keys["arrowright"] && !isHurt) {
    player.src = "img/standing-avatar.png";
  }

  requestAnimationFrame(updatePlayer);
}

updatePlayer();