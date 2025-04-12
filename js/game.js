let timerInterval;
let timeElapsed = 0;

function startLevel(levelNumber) {
  console.log(`Starting level ${levelNumber}`);

  // Reset score + timer
  timeElapsed = 0;
  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = "0:00";

  timerInterval = setInterval(() => {
    timeElapsed++;
    let minutes = Math.floor(timeElapsed / 60);
    let seconds = timeElapsed % 60;
    document.getElementById("timer").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}