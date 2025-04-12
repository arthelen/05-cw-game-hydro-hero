let player = document.getElementById("player-avatar");

let posX = 30;
let posY = 100;
let velocityX = 0;
let isJumping = false;

let keys = {};

// Track key states
document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Game loop for smooth movement
function updatePlayer() {
  // Move Right
  if (keys["d"] || keys["arrowright"]) {
    posX += 5;
    player.style.left = posX + "px";

    // Trigger walking animation here!
    player.classList.add("walking");
  } else {
    player.classList.remove("walking");
  }

  // Jump
  if ((keys["w"] || keys["arrowup"]) && !isJumping) {
    isJumping = true;
    let jumpHeight = 80;
    let jumpSpeed = 15;
    let gravity = 5;
    let groundLevel = 100;

    let jumpInterval = setInterval(() => {
      posY += jumpSpeed;
      player.style.bottom = posY + "px";

      if (posY >= groundLevel + jumpHeight) {
        clearInterval(jumpInterval);

        // Fall
        let fallInterval = setInterval(() => {
          posY -= gravity;
          player.style.bottom = posY + "px";

          if (posY <= groundLevel) {
            posY = groundLevel;
            player.style.bottom = posY + "px";
            clearInterval(fallInterval);
            isJumping = false;
          }
        }, 20);
      }
    }, 20);
  }

  requestAnimationFrame(updatePlayer);
}

updatePlayer(); // start the loop
