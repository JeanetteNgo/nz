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

// Track which mode is active and whether the user has enabled audio
let isHobbitMode = false;
let audioShouldPlay = false;

// Mute/Unmute Behavior with user-gesture flag
muteToggle.addEventListener("click", () => {
  // If both audio tracks are muted, unmute and start playing
  if (normalAudio.muted && hobbitAudio.muted) {
    audioShouldPlay = true; // User wants audio to play
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
    // Otherwise, mute and pause both audio tracks
    audioShouldPlay = false;
    normalAudio.muted = true;
    hobbitAudio.muted = true;
    normalAudio.pause();
    hobbitAudio.pause();
    muteIcon.classList.remove("fa-volume-up");
    muteIcon.classList.add("fa-volume-mute");
  }
});

// Toggle between Normal and Hobbit Mode
hobbitToggle.addEventListener("change", () => {
  isHobbitMode = hobbitToggle.checked;
  document.body.classList.toggle("hobbit-mode", isHobbitMode);
  // If audio is playing, switch audio tracks accordingly
  if (audioShouldPlay) {
    if (isHobbitMode) {
      normalAudio.pause();
      normalAudio.currentTime = 0;
      hobbitAudio.play().catch(() => {});
    } else {
      hobbitAudio.pause();
      hobbitAudio.currentTime = 0;
      normalAudio.play().catch(() => {});
    }
  }
});

// Use the Page Visibility API to pause audio when the page is hidden
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Pause audio on leaving the site and reset the flag so user must click unmute upon return
    normalAudio.pause();
    hobbitAudio.pause();
    audioShouldPlay = false;
    // Also update UI: set both audio elements to muted
    normalAudio.muted = true;
    hobbitAudio.muted = true;
    muteIcon.classList.remove("fa-volume-up");
    muteIcon.classList.add("fa-volume-mute");
  }
});

// Update NZ Time every second
function updateNZTime() {
  const now = new Date().toLocaleTimeString("en-NZ", {
    timeZone: "Pacific/Auckland",
    hour12: false
  });
  nzTimeDisplay.textContent = "NZDT " + now;
}

setInterval(updateNZTime, 1000);
updateNZTime();
