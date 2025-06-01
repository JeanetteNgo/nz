document.addEventListener("DOMContentLoaded", () => {
  initNZTime();
  initMuteToggle();
  initHobbitMode();
  initFilterPills();
  initCarouselChevrons();
  initPageVisibility();
  initNavbarScroll();
  initVideosOnLeave();
  initFilterPillsScroll();
  initImageModal();
  initFilterPillCounters();
});

let isHobbitMode = false;
let audioShouldPlay = false;

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
  const heroVideo = document.getElementById("heroVideo");
  if (!muteToggle || !muteIcon || !heroVideo) return;

  heroVideo.muted = true;
  audioShouldPlay = false;
  updateMuteIcon(true);

  muteToggle.addEventListener("click", () => {
    const isMuted = heroVideo.muted;
    heroVideo.muted = !isMuted;
    audioShouldPlay = !heroVideo.muted;
    updateMuteIcon(heroVideo.muted);

    if (!heroVideo.muted) {
      heroVideo.play().catch(() => {});
    }
  });
}

function updateMuteIcon(isMuted) {
  const muteIcon = document.getElementById("muteIcon");
  if (!muteIcon) return;
  muteIcon.classList.toggle("fa-volume-up", !isMuted);
  muteIcon.classList.toggle("fa-volume-mute", isMuted);
}

/* ----------------------- Hobbit Mode Toggle ----------------------- */
function initHobbitMode() {
  const hobbitToggle = document.getElementById("hobbitToggle");
  if (!hobbitToggle) return;

  const storedHobbitMode = localStorage.getItem("hobbitMode");
  isHobbitMode = storedHobbitMode === "true";
  hobbitToggle.checked = isHobbitMode;
  document.body.classList.toggle("hobbit-mode", isHobbitMode);

  updateHeroVideo();

  hobbitToggle.addEventListener("change", () => {
    isHobbitMode = hobbitToggle.checked;
    localStorage.setItem("hobbitMode", isHobbitMode);
    document.body.classList.toggle("hobbit-mode", isHobbitMode);
    updateHeroVideo();
  });
}

function updateHeroVideo() {
  const heroVideo = document.getElementById("heroVideo");
  if (!heroVideo) return;

  const currentTime = heroVideo.currentTime;
  const wasMuted = heroVideo.muted;

  heroVideo.pause();
  heroVideo.src = isHobbitMode
    ? "assets/hobbit-mode-video.mp4"
    : "assets/normal-mode-video.mp4";
  heroVideo.load();

  heroVideo.addEventListener("loadedmetadata", function restoreTimeOnce() {
    heroVideo.currentTime = currentTime;
    heroVideo.muted = !audioShouldPlay || wasMuted;
    updateMuteIcon(heroVideo.muted);
    heroVideo.play().catch(() => {});
    heroVideo.removeEventListener("loadedmetadata", restoreTimeOnce);
  });
}

/* ----------------------- Filter Pills Scroll Behavior ----------------------- */
function initFilterPillsScroll() {
  const filterPills = document.querySelector(".filter-pills"); // Assuming this is the class for your pills
  const navbarHeight = document.querySelector(".navbar").offsetHeight; // Get navbar height dynamically
  if (!filterPills) return;

  const threshold = navbarHeight; // When you scroll past the navbar

  window.addEventListener("scroll", () => {
    if (window.scrollY > threshold) {
      filterPills.classList.add("sticky");  // Make pills sticky below navbar
    } else {
      filterPills.classList.remove("sticky");
    }
  });
}

/* ----------------------- Filter Pills (Single Active) ----------------------- */
function initFilterPills() {
  const filterPills = [...document.querySelectorAll(".filter-pill")];
  const posts = [...document.querySelectorAll(".post")];
  if (!filterPills.length) return;

  const allPill = filterPills.find(pill => pill.dataset.location.trim() === "all");
  if (allPill) allPill.classList.add("active");

  filterPills.forEach(pill =>
    pill.addEventListener("click", () => {
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

  applyFilter();
}

/* ----------------------- Filter Pill Counters ----------------------- */
function initFilterPillCounters() {
  const posts = document.querySelectorAll(".post");
  const filterPills = document.querySelectorAll(".filter-pill");

  filterPills.forEach(pill => {
    const location = pill.dataset.location;
    let matchingPosts;

    if (location === "all") {
      matchingPosts = posts;
    } else {
      matchingPosts = Array.from(posts).filter(post => {
        const locations = post.dataset.locations?.split(/[\s,]+/) || [];
        return locations.includes(location);
      });
    }

    const countSpan = pill.querySelector(".count");
    if (countSpan) {
      countSpan.textContent = matchingPosts.length;
    }
  });
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
      postImages.scrollBy({ left: -320, behavior: "smooth" });
    });
    rightBtn.addEventListener("click", () => {
      postImages.scrollBy({ left: 320, behavior: "smooth" });
    });
  });
}

/* ----------------------- Page Visibility ----------------------- */
function initPageVisibility() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      const heroVideo = document.getElementById("heroVideo");
      if (heroVideo) {
        heroVideo.muted = true;
        audioShouldPlay = false;
      }
      updateMuteIcon(true);
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
      const allVideos = document.querySelectorAll(".post-images video");
      allVideos.forEach(video => {
        if (!video.paused && !video.muted) {
          video.muted = true;
        }
      });
    }
  });
}

/* ----------------------- Post Image Modal ----------------------- */
function initImageModal() {
  const modal = document.getElementById("fullscreenModal");
  const modalImg = document.getElementById("modalImage");
  const modalCaption = document.getElementById("modalCaption");
  if (!modal || !modalImg || !modalCaption) return;

  window.openFullScreen = (icon) => {
    const image = icon?.previousElementSibling;
    if (!image || !image.dataset.highres) return;
    modalImg.src = image.dataset.highres;
    modalCaption.textContent = image.dataset.caption || "";
    modal.style.display = "flex";
  };

  modal.addEventListener("click", (e) => {
    if (!e.target.closest("figure")) modal.style.display = "none";
  });
}

/* ----------------------- Divider ----------------------- */
