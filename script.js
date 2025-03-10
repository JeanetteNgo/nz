document.addEventListener("DOMContentLoaded", () => {
  initNZTime();
  initMuteToggle();
  initHobbitMode();
  initFilterPills();
  initCarouselChevrons();
  initPageVisibility();
  initNavbarScroll();
  initVideosOnLeave();
  initSmallHeroScroll();
});

/* ----------------------- NZ Time ----------------------- */
function initNZTime() {
  const nzTimeDisplay = document.getElementById("nzTime");
  if (!nzTimeDisplay) return;
  function updateNZTime() {
    const now = new Date().toLocaleTimeString("en-NZ", {
      timeZone: "Pacific/Auckland",
      hour12: false,
    });
    nzTimeDisplay.textContent = "NZDT " + now;
  }
  setInterval(updateNZTime, 1000);
  updateNZTime();
}

/* ----------------------- Mute Toggle ----------------------- */
function initMuteToggle() {
  const muteToggle = document.getElementById("muteToggle");
  const muteIcon = document.getElementById("muteIcon");
  const normalAudio = document.getElementById("normalAudio");
  const hobbitAudio = document.getElementById("hobbitAudio");
  if (!muteToggle || !muteIcon || !normalAudio || !hobbitAudio) return;
  
  // On load, ensure the audio icon shows muted (and audio remains paused/muted)
  muteIcon.classList.remove("fa-volume-up");
  muteIcon.classList.add("fa-volume-mute");
  normalAudio.pause();
  hobbitAudio.pause();
  normalAudio.muted = true;
  hobbitAudio.muted = true;
  
  muteToggle.addEventListener("click", () => {
    const isMuted = normalAudio.muted && hobbitAudio.muted;
    if (isMuted) {
      normalAudio.muted = hobbitAudio.muted = false;
      // Play the appropriate audio only if already playing was active before toggle (if not, leave paused)
      if (document.body.classList.contains("hobbit-mode")) {
        hobbitAudio.play().catch(() => {});
        normalAudio.pause();
        normalAudio.currentTime = 0;
      } else {
        normalAudio.play().catch(() => {});
        hobbitAudio.pause();
        hobbitAudio.currentTime = 0;
      }
      muteIcon.classList.replace("fa-volume-mute", "fa-volume-up");
    } else {
      normalAudio.muted = hobbitAudio.muted = true;
      normalAudio.pause();
      hobbitAudio.pause();
      muteIcon.classList.replace("fa-volume-up", "fa-volume-mute");
    }
  });
}

/* ----------------------- Hobbit Mode Toggle ----------------------- */
function initHobbitMode() {
  const hobbitToggle = document.getElementById("hobbitToggle");
  if (!hobbitToggle) return;

  // Retrieve stored Hobbit mode state from localStorage
  const storedHobbitMode = localStorage.getItem("hobbitMode");
  const isHobbit = storedHobbitMode === "true";
  
  // Set the toggle state and body class accordingly
  hobbitToggle.checked = isHobbit;
  document.body.classList.toggle("hobbit-mode", isHobbit);
  
  // Update hero video based on stored mode
  const heroVideo = document.getElementById("heroVideo");
  if (heroVideo) {
    heroVideo.src = isHobbit
      ? "assets/hobbit-mode-video.mp4"
      : "assets/normal-mode-video.mp4";
    heroVideo.load();
    heroVideo.play().catch(() => {});
  }
  
  // Audio switching logic
  const normalAudio = document.getElementById("normalAudio");
  const hobbitAudio = document.getElementById("hobbitAudio");
  if (normalAudio && hobbitAudio) {
    // On page load, if audio is playing (i.e. not muted), switch audio based on the stored mode.
    if (!normalAudio.muted && !hobbitAudio.muted) {
      if (isHobbit) {
        normalAudio.pause();
        normalAudio.currentTime = 0;
        hobbitAudio.play().catch(() => {});
      } else {
        hobbitAudio.pause();
        hobbitAudio.currentTime = 0;
        normalAudio.play().catch(() => {});
      }
    }
  }
  
  // Listen for toggle changes
  hobbitToggle.addEventListener("change", () => {
    const isHobbitMode = hobbitToggle.checked;
    document.body.classList.toggle("hobbit-mode", isHobbitMode);
    localStorage.setItem("hobbitMode", isHobbitMode);
    
    // Switch hero video if present
    if (heroVideo) {
      heroVideo.pause();
      heroVideo.src = isHobbitMode
        ? "assets/hobbit-mode-video.mp4"
        : "assets/normal-mode-video.mp4";
      heroVideo.load();
      heroVideo.play().catch(() => {});
    }
    
    // Switch audio if audio is currently active (not muted)
    if (normalAudio && hobbitAudio && !normalAudio.muted && !hobbitAudio.muted) {
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
}

/* ----------------------- Filter Pills (Single Active) ----------------------- */
function initFilterPills() {
  const filterPills = [...document.querySelectorAll(".filter-pill")];
  const posts = [...document.querySelectorAll(".post")];
  if (!filterPills.length) return;
  
  // Activate "all" pill by default.
  const allPill = filterPills.find(pill => pill.dataset.location.trim() === "all");
  if (allPill) allPill.classList.add("active");

  filterPills.forEach(pill =>
    pill.addEventListener("click", () => {
      // Make only the clicked pill active.
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      applyFilter();
    })
  );

  const applyFilter = () => {
    const selectedLocation = document.querySelector(".filter-pill.active")?.dataset.location.trim();
    if (!selectedLocation || selectedLocation === "all") {
      posts.forEach(post => post.style.display = "block");
    } else {
      posts.forEach(post => {
        const locations = post.dataset.locations.split(" ").map(loc => loc.trim());
        post.style.display = locations.includes(selectedLocation) ? "block" : "none";
      });
    }
  };

  // Run initial filter
  applyFilter();
}

/* ----------------------- Carousel Chevrons ----------------------- */
function initCarouselChevrons() {
  const carouselContainers = document.querySelectorAll(".carousel-container");
  if (!carouselContainers.length) return;
  carouselContainers.forEach(container => {
    const postImages = container.querySelector(".post-images");
    const leftBtn = container.querySelector(".carousel-btn.left-btn");
    const rightBtn = container.querySelector(".carousel-btn.right-btn");
    if (!postImages || !leftBtn || !rightBtn) return;
    function updateCarouselButtons() {
      if (postImages.scrollWidth <= container.clientWidth) {
        leftBtn.style.display = "none";
        rightBtn.style.display = "none";
        return;
      }
      leftBtn.style.display = postImages.scrollLeft === 0 ? "none" : "block";
      rightBtn.style.display =
        postImages.scrollLeft + container.clientWidth >= postImages.scrollWidth - 1
          ? "none"
          : "block";
    }
    postImages.addEventListener("scroll", updateCarouselButtons);
    window.addEventListener("resize", updateCarouselButtons);
    window.addEventListener("load", updateCarouselButtons);
    updateCarouselButtons();
    leftBtn.addEventListener("click", () => {
      postImages.scrollBy({ left: -100, behavior: "smooth" });
    });
    rightBtn.addEventListener("click", () => {
      postImages.scrollBy({ left: 100, behavior: "smooth" });
    });
  });
}

/* ----------------------- Page Visibility ----------------------- */
function initPageVisibility() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      const normalAudio = document.getElementById("normalAudio");
      const hobbitAudio = document.getElementById("hobbitAudio");
      if (normalAudio) normalAudio.pause();
      if (hobbitAudio) hobbitAudio.pause();
      
      // Update mute icon to muted state on return.
      const muteIcon = document.getElementById("muteIcon");
      if (muteIcon) {
        muteIcon.classList.remove("fa-volume-up");
        muteIcon.classList.add("fa-volume-mute");
      }
    }
  });
}

/* ----------------------- Navbar Scroll Background ----------------------- */
function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });
}

/* ----------------------- Videos on Leave ----------------------- */
function initVideosOnLeave() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Grab all videos in posts
      const allVideos = document.querySelectorAll(".post-images video");
      allVideos.forEach(video => {
        // If it's playing unmuted, let's mute it
        if (!video.paused && !video.muted) {
          video.muted = true;
        }
      });
    }
  });
}

/* ----------------------- Small Hero on Scroll ----------------------- */
function initSmallHeroScroll() {
  const smallHero = document.querySelector(".small-hero");
  if (!smallHero) return;
  const threshold = 50; // Adjust as needed

  window.addEventListener("scroll", () => {
    if (window.scrollY > threshold) {
      smallHero.classList.add("scrolled");
    } else {
      smallHero.classList.remove("scrolled");
    }
  });
}