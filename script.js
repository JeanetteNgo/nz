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
const heroVideo = document.getElementById("heroVideo")

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

  // Switch audio tracks if audio is playing
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

  // Switch hero video source depending on mode
  heroVideo.pause();
  heroVideo.src = isHobbitMode
    ? "assets/hobbit-mode-video.mp4"
    : "assets/normal-mode-video.mp4";
  heroVideo.load();
  heroVideo.play().catch(() => {});
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


//----------------------------------------------------------//
//                       FILTER PILLS                       //
//----------------------------------------------------------//

document.addEventListener("DOMContentLoaded", () => {
  const filterPills = document.querySelectorAll(".filter-pill");
  const posts = document.querySelectorAll(".post");

  // Set "All" as active on load
  const allPill = document.querySelector('.filter-pill[data-location="all"]');
  if (allPill) {
    allPill.classList.add("active");
  }

  // Attach event listeners
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      // For multiple selection, toggle active state (except for "all")
      if (pill.getAttribute("data-location") === "all") {
        // If "all" is clicked, clear others and set only "all"
        filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
      } else {
        // If any non-"all" pill is clicked, toggle its active state
        pill.classList.toggle("active");
        // Also remove active from "all" if it is active
        allPill && allPill.classList.remove("active");
        // If no filter is active, default back to "all"
        if (![...filterPills].some(p => p.classList.contains("active"))) {
          allPill && allPill.classList.add("active");
        }
      }
      filterPosts();
    });
  });

  function filterPosts() {
    // Get all active filters (ignore "all" if other filters are selected)
    let activeFilters = [...filterPills]
      .filter(p => p.classList.contains("active"))
      .map(p => p.getAttribute("data-location").trim());

    console.log("Active Filters:", activeFilters);

    // If "all" is active (or if it's the only one) show all posts
    if (activeFilters.includes("all") || activeFilters.length === 0) {
      posts.forEach(post => post.style.display = "block");
    } else {
      posts.forEach(post => {
        const postLocations = post.getAttribute("data-locations").split(" ").map(loc => loc.trim());
        // Show post if it matches any active filter
        const show = activeFilters.some(filter => postLocations.includes(filter));
        post.style.display = show ? "block" : "none";
      });
    }
  }

  // Initial filter on load
  filterPosts();
});



//----------------------------------------------------------//
//                         CAROUSEL                         //
//----------------------------------------------------------//

document.addEventListener('DOMContentLoaded', () => {
  const carouselContainer = document.querySelector('.carousel-container');
  const postImages = document.querySelector('.post-images');
  const leftBtn = document.querySelector('.carousel-btn.left-btn');
  const rightBtn = document.querySelector('.carousel-btn.right-btn');

  // Update chevron visibility based on scroll position
  function updateCarouselButtons() {
    // Check if container overflows horizontally
    if (postImages.scrollWidth <= carouselContainer.clientWidth) {
      leftBtn.style.display = 'none';
      rightBtn.style.display = 'none';
      return;
    }
    
    // Show/hide left button
    if (postImages.scrollLeft === 0) {
      leftBtn.style.display = 'none';
    } else {
      leftBtn.style.display = 'block';
    }
    
    // Show/hide right button
    if (postImages.scrollLeft + carouselContainer.clientWidth >= postImages.scrollWidth - 1) {
      rightBtn.style.display = 'none';
    } else {
      rightBtn.style.display = 'block';
    }
  }

  // Attach scroll event to update buttons as the user scrolls
  postImages.addEventListener('scroll', updateCarouselButtons);
  window.addEventListener('resize', updateCarouselButtons);
  updateCarouselButtons();

  // Chevron button event listeners to scroll the images
  leftBtn.addEventListener('click', () => {
    postImages.scrollBy({
      left: -200,  // Adjust scroll amount as needed
      behavior: 'smooth'
    });
  });

  rightBtn.addEventListener('click', () => {
    postImages.scrollBy({
      left: 200,  // Adjust scroll amount as needed
      behavior: 'smooth'
    });
  });
});
