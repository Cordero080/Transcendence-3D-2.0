const els = {
  gameOverOverlay: document.getElementById("gameOverOverlay"),
  reasonElement: document.getElementById("gameOverReason"),
  petChat: document.querySelector(".infoBox_petChat"),
  hungerTimer: document.getElementById("hungerTimer"),
  funTimer: document.getElementById("funTimer"),
  sleepTimer: document.getElementById("sleepTimer"),
  powerTimer: document.getElementById("powerTimer"),
  overlayTexts: document.querySelectorAll(
    ".overlay-content h2, .overlay-content p"
  ),
  overlay: document.getElementById("pageOverlay"),
  overlayStartBtn: document.getElementById("overlayStartButton"),
  regularStartBtn: document.querySelector(".startButtonContainer .StartButton"),
  resetBtn: document.querySelector(".ResetButton"),
  buttons: document.querySelectorAll(".Buttons"),
  feedButton: document.querySelectorAll(".Buttons")[0],
  danceButton: document.querySelectorAll(".Buttons")[1],
  sleepButton: document.querySelectorAll(".Buttons")[2],
  trainButton: document.querySelectorAll(".Buttons")[3],
  btn: document.getElementById("infoDropdownBtn"),
  menu: document.getElementById("infoDropdownMenu"),
  container: document.querySelector(".dropdown-container"),
  feedIndicator: document.querySelector("#hungerTimer"),
  danceIndicator: document.querySelector("#funTimer"),
  sleepIndicator: document.querySelector("#sleepTimer"),
  powerIndicator: document.querySelector("#powerTimer"),
  glitchStutterOverlay: document.getElementById("glitchStutterOverlay"),
  glitchStutterOverlay2: document.getElementById("glitchStutterOverlay2"),
};

export default els;
