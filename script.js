// Select the navbar element
const navbar = document.querySelector('.navbar');

// Listen for the scroll event
window.addEventListener('scroll', () => {
  // Check if the scroll position is greater than 0 (or your desired threshold)
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Grab elements
const hobbitToggle = document.getElementById("hobbitToggle");
const muteToggle = document.getElementById("muteToggle");
const muteIcon = document.getElementById("muteIcon");
const normalAudio = document.getElementById("normalAudio");
const hobbitAudio = document.getElementById("hobbitAudio");
const nzTimeDisplay = document.getElementById("nzTime");

// Track which mode is active
let isHobbitMode = false;

// Toggle between Normal and Hobbit Mode
hobbitToggle.addEventListener("change", () => {
  isHobbitMode = hobbitToggle.checked;
  document.body.classList.toggle("hobbit-mode", isHobbitMode);

  // If the audio is already unmuted (user clicked unmute), switch playback accordingly
  if (!normalAudio.muted && !hobbitAudio.muted) {
    if (isHobbitMode) {
      // Switch to Hobbit audio
      normalAudio.pause();
      normalAudio.currentTime = 0;
      hobbitAudio.play().catch(() => {});
    } else {
      // Switch to Normal audio
      hobbitAudio.pause();
      hobbitAudio.currentTime = 0;
      normalAudio.play().catch(() => {});
    }
  }
});

// Mute / Unmute Behavior (audio starts on unmute click)
muteToggle.addEventListener("click", () => {
  // Check if audio is currently muted
  if (normalAudio.muted && hobbitAudio.muted) {
    // Unmute both and play the active mode's audio
    normalAudio.muted = false;
    hobbitAudio.muted = false;
    if (isHobbitMode) {
      hobbitAudio.play().catch(() => {});
      normalAudio.pause();
      normalAudio.currentTime = 0;
    } else {
      normalAudio.play().catch(() => {});
      hobbitAudio.pause();
      hobbitAudio.currentTime = 0;
    }
    muteIcon.classList.remove("fa-volume-mute");
    muteIcon.classList.add("fa-volume-up");
  } else {
    // Mute and pause both audio tracks
    normalAudio.muted = true;
    hobbitAudio.muted = true;
    normalAudio.pause();
    hobbitAudio.pause();
    muteIcon.classList.remove("fa-volume-up");
    muteIcon.classList.add("fa-volume-mute");
  }
});

// Update New Zealand Time in real time
function updateNZTime() {
  const now = new Date().toLocaleTimeString("en-NZ", {
    timeZone: "Pacific/Auckland",
    hour12: false
  });
  nzTimeDisplay.textContent = "NZDT " + now;
}

setInterval(updateNZTime, 1000);
updateNZTime();
