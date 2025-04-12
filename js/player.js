const player = document.getElementById("player-avatar");
const gameArea = document.querySelector(".game-area");
const gameAreaWidth = gameArea.offsetWidth;
const avatarWidth = player.offsetWidth;

let posX = 30;
let posY = 100;
let isJumping = false;
let keys = {};

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
    player.style.left = posX + "px";

    // Only change to walking sprite if not jumping
    if (!isJumping) {
      player.src = "img/walking-avatar.png";
    }
  }

  // ⬆️ jump (Press W or ↑)
  if ((keys["w"] || keys["arrowup"]) && !isJumping) {
    isJumping = true;
    player.src = "img/jumping-avatar.png";

    const jumpHeight = 80;
    const jumpSpeed = 15;
    const gravity = 5;
    const groundLevel = 100;

    let jumpInterval = setInterval(() => {
      posY += jumpSpeed;
      player.style.bottom = posY + "px";

      if (posY >= groundLevel + jumpHeight) {
        clearInterval(jumpInterval);

        // fall back down
        let fallInterval = setInterval(() => {
          posY -= gravity;
          player.style.bottom = posY + "px";

          if (posY <= groundLevel) {
            posY = groundLevel;
            player.style.bottom = posY + "px";
            clearInterval(fallInterval);
            isJumping = false;

            // swap to walk or stand based on key held
            if (keys["d"] || keys["arrowright"]) {
              player.src = "img/walking-avatar.png";
            } else {
              player.src = "img/standing-avatar.png";
            }
          }
        }, 20);
      }
    }, 20);
  }

  // 🧍‍♂️ if not jumping or moving → standing
  if (!isJumping && !keys["d"] && !keys["arrowright"]) {
    player.src = "img/standing-avatar.png";
  }

  requestAnimationFrame(updatePlayer);
}

updatePlayer();
