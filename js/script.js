function startGame() {
  const gameArea = document.querySelector(".game-area");

  // If player element isn't in the DOM, add it back
  if (!gameArea.contains(player)) {
    gameArea.appendChild(player);
  }

  document.getElementById("title-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";

  startLevel(1);
  console.log("game is updating");
}