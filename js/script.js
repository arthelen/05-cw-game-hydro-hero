function startGame() {
  document.querySelector(".title-wrapper").style.display = "none"; // << hide wrapper
  document.getElementById("title-screen").style.display = "none";
  document.getElementById("difficulty-select").style.display = "none";
  document.getElementById("game-screen").style.display = "block";

  setDifficultySettings();
  startLevel(1);
  console.log("game is updating");
}