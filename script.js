document.addEventListener("DOMContentLoaded", () => {
  initNZTime();
  initMuteToggle();
  initHobbitMode();
  initFilterPills();
  initFilterPillsChevrons();
  initCarouselChevrons();
  initPageVisibility();
  initNavbarScroll();
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
  muteToggle.addEventListener("click", () => {
    const isMuted = normalAudio.muted && hobbitAudio.muted;
    if (isMuted) {
      normalAudio.muted = hobbitAudio.muted = false;
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

/* ----------------------- Page Visibility ----------------------- */
function initPageVisibility() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      const normalAudio = document.getElementById("normalAudio");
      const hobbitAudio = document.getElementById("hobbitAudio");
      if (normalAudio) normalAudio.pause();
      if (hobbitAudio) hobbitAudio.pause();
    }
  });
}

/* ----------------------- Hobbit Mode Toggle ----------------------- */
function initHobbitMode() {
  const hobbitToggle = document.getElementById("hobbitToggle");
  if (!hobbitToggle) return;
  hobbitToggle.addEventListener("change", () => {
    const isHobbitMode = hobbitToggle.checked;
    document.body.classList.toggle("hobbit-mode", isHobbitMode);
    // Switch audio only if not muted
    const normalAudio = document.getElementById("normalAudio");
    const hobbitAudio = document.getElementById("hobbitAudio");
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
    // Switch hero video if present
    const heroVideo = document.getElementById("heroVideo");
    if (heroVideo) {
      heroVideo.pause();
      heroVideo.src = isHobbitMode
        ? "assets/hobbit-mode-video.mp4"
        : "assets/normal-mode-video.mp4";
      heroVideo.load();
      heroVideo.play().catch(() => {});
    }
  });
}

/* ----------------------- Filter Pills (Single Active) ----------------------- */
function initFilterPills() {
  const filterPills = document.querySelectorAll(".filter-pill");
  const posts = document.querySelectorAll(".post");
  if (!filterPills || filterPills.length === 0) return;
  
  // Set "All" pill as active by default.
  const allPill = document.querySelector('.filter-pill[data-location="all"]');
  if (allPill) {
    allPill.classList.add("active");
  }
  
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      // Remove active from all and set clicked pill as active.
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      filterPosts();
    });
  });
  
  function filterPosts() {
    const activePill = document.querySelector(".filter-pill.active");
    if (!activePill) return;
    const selectedLocation = activePill.getAttribute("data-location").trim();
    const posts = document.querySelectorAll(".post");
    if (selectedLocation === "all") {
      posts.forEach((post) => (post.style.display = "block"));
    } else {
      posts.forEach((post) => {
        const postLocations = post
          .getAttribute("data-locations")
          .split(" ")
          .map((loc) => loc.trim());
        post.style.display = postLocations.includes(selectedLocation)
          ? "block"
          : "none";
      });
    }
  }
  // Run filter on initial load.
  filterPosts();
}

/* ----------------------- Filter Pills Chevrons ----------------------- */
function initFilterPills() {
  const filterPills = document.querySelectorAll(".filter-pill");
  const posts = document.querySelectorAll(".post");
  if (!filterPills || filterPills.length === 0) return;
  
  // "All" pill active by default.
  const allPill = document.querySelector('.filter-pill[data-location="all"]');
  if (allPill) {
    allPill.classList.add("active");
  }
  
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      // Remove active class from all pills and activate the clicked one.
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      filterPosts();
    });
  });
  
  function filterPosts() {
    const activePill = document.querySelector(".filter-pill.active");
    if (!activePill) return;
    const selectedLocation = activePill.getAttribute("data-location").trim();
    if (selectedLocation === "all") {
      posts.forEach((post) => (post.style.display = "block"));
    } else {
      posts.forEach((post) => {
        const postLocations = post.getAttribute("data-locations")
          .split(" ")
          .map((loc) => loc.trim());
        post.style.display = postLocations.includes(selectedLocation)
          ? "block"
          : "none";
      });
    }
  }
  // Run filter on initial load.
  filterPosts();
}

/* ----------------------- Carousel Chevrons ----------------------- */
function initCarouselChevrons() {
  const carouselContainers = document.querySelectorAll(".carousel-container");
  if (!carouselContainers || carouselContainers.length === 0) return;
  carouselContainers.forEach((container) => {
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
      postImages.scrollBy({ left: -200, behavior: "smooth" });
    });
    rightBtn.addEventListener("click", () => {
      postImages.scrollBy({ left: 200, behavior: "smooth" });
    });
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

document.addEventListener("DOMContentLoaded", () => {
  initNavbarScroll();
});


