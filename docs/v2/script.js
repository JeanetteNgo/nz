/* ============================================================
   AOTEAROA DIARIES — script.js
   Shared across: index.html, blog.html, about.html, posts/*.html

   Sections:
   1.  Helpers
   2.  NZ Clock
   3.  Nav — hamburger menu
   4.  Theme (Hobbit mode)
   5.  Sparkle + Fireflies
   6.  Audio (Web Audio API ambience)
   7.  Toast notifications
   8.  Search overlay
   9.  Facts widget
   10. Visitor counter
   11. Scroll fade-in
   12. Keyboard shortcuts + Konami code
   13. initShared() — called by every page on load
   ============================================================ */


/* ── 1. HELPERS ─────────────────────────────────────────────── */

/* Formats a date string like "2024-04-03" into "3 April 2024" */
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-NZ", {
    day:   "numeric",
    month: "long",
    year:  "numeric"
  });
}


/* ── 2. NZ CLOCK ────────────────────────────────────────────── */

function startClock() {

  /* Updates all clock elements on the page with the current NZ time */
  function tick() {
    const time = new Date().toLocaleTimeString("en-NZ", {
      timeZone: "Pacific/Auckland",
      hour:     "2-digit",
      minute:   "2-digit",
      second:   "2-digit",
      hour12:   false
    });

    /* Update every element that shows the clock (nav + mobile menu) */
    document.querySelectorAll(".nav-clock, .mob-clock-time").forEach(function(el) {
      el.textContent = time;
    });
  }

  tick();                   /* show immediately so there's no blank flash */
  setInterval(tick, 1000); /* then update every second */
}


/* ── 3. NAV — hamburger menu ─────────────────────────────────── */

/* Tracks whether the mobile menu is currently open */
let menuOpen = false;

function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById("hamburger")?.classList.toggle("open", menuOpen);
  document.getElementById("mobile-menu")?.classList.toggle("open", menuOpen);

  /* Lock body scroll while the menu is open so the page doesn't scroll behind it */
  document.body.style.overflow = menuOpen ? "hidden" : "";
}

function closeMenu() {
  menuOpen = false;
  document.getElementById("hamburger")?.classList.remove("open");
  document.getElementById("mobile-menu")?.classList.remove("open");
  document.body.style.overflow = "";
}


/* ── 4. THEME ───────────────────────────────────────────────── */

/* Read saved theme from localStorage. Defaults to normal mode. */
let isHobbit = localStorage.getItem("nz-theme") === "hobbit";

/* Applies the current theme to the page without toggling it */
function applyTheme() {

  /* Set the data-theme attribute on <html> — CSS reads this to switch colours */
  document.documentElement.setAttribute("data-theme", isHobbit ? "hobbit" : "default");

  /* Update the icon and label on all toggle buttons (nav + mobile menu) */
  const icon  = isHobbit ? "🌿" : "🧙";
  const label = isHobbit ? "Hobbit" : "Default";

  document.querySelectorAll(".theme-icon").forEach(function(el) {
    el.textContent = icon;
  });
  document.querySelectorAll(".theme-label").forEach(function(el) {
    el.textContent = label;
  });

  /* Swap the kiwi button to a ring emoji in Hobbit mode */
  const kiwiBtn = document.getElementById("kiwi-btn");
  if (kiwiBtn) {
    kiwiBtn.textContent = isHobbit ? "💍" : "🥝";
  }

  /* Update the Hobbit toggle button's accessibility state */
  const hobbitBtn = document.getElementById("hobbit-toggle-btn");
  if (hobbitBtn) {
    hobbitBtn.setAttribute("aria-pressed", isHobbit ? "true" : "false");
    hobbitBtn.classList.toggle("hobbit-active", isHobbit);
  }
}

/* Called when the user clicks the Hobbit toggle button */
function toggleTheme() {

  /* Remember the current scroll position — toggling the theme can cause the page
     to briefly jump, so we restore it after the change */
  const scrollY = window.scrollY;

  /* Add a class that smoothly transitions all colour-related CSS properties.
     It is removed after 600ms once the transition is done. */
  document.body.classList.add("theme-transitioning");
  setTimeout(function() {
    document.body.classList.remove("theme-transitioning");
  }, 600);

  /* Flip the theme and save it so it persists across page loads */
  isHobbit = !isHobbit;
  localStorage.setItem("nz-theme", isHobbit ? "hobbit" : "default");
  applyTheme();

  if (isHobbit) {
    spawnSparkles();   /* golden particle burst */
    spawnFireflies();  /* floating lights in the background */
  } else {
    /* Fade out and clear fireflies when leaving Hobbit mode */
    const fireflyLayer = document.getElementById("firefly-layer");
    if (fireflyLayer) {
      fireflyLayer.style.opacity = "0";
      setTimeout(function() {
        fireflyLayer.innerHTML = "";
        fireflyLayer.style.opacity = "";
      }, 600);
    }
  }

  showToast(isHobbit ? "✨ You have entered the Shire" : "🌿 Back to Aotearoa");

  /* Restore scroll position after the theme swap */
  requestAnimationFrame(function() {
    window.scrollTo({ top: scrollY, behavior: "instant" });
  });

  switchAmbience();
}


/* ── 5. SPARKLE + FIREFLIES ─────────────────────────────────── */

/*
  The sparkle animation runs in four waves when entering Hobbit mode:
    Wave 0 — a full-screen golden shimmer sweeps top to bottom
    Wave 1 — concentric rings expand outward from the toggle button
    Wave 2 — 60 particles burst outward from the toggle button
    Wave 3 — 14 rune glyphs float upward across the viewport
*/
function spawnSparkles() {
  const colors         = ["#F4BC6E", "#e8a84d", "#fff8dc", "#d4943a", "#ffe0a0", "#ffffff"];
  const glyphs         = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "✦", "✧", "⁕", "☽"];
  const viewportWidth  = window.innerWidth;
  const viewportHeight = window.innerHeight;

  /* ── Wave 0: Full-screen shimmer overlay ── */
  const flash     = document.createElement("div");
  flash.className = "theme-flash";
  document.body.appendChild(flash);
  setTimeout(function() { flash.remove(); }, 1200);

  /* ── Wave 1: Expanding rings from the toggle button ── */
  /* Find where the toggle button is on screen; fall back to top-right */
  const toggleBtn = document.getElementById("hobbit-toggle-btn");
  let originX     = viewportWidth * 0.85;
  let originY     = 34;
  if (toggleBtn) {
    const rect = toggleBtn.getBoundingClientRect();
    originX    = rect.left + rect.width  / 2;
    originY    = rect.top  + rect.height / 2;
  }

  /* Each ring has a different size, speed and opacity */
  [50, 110, 190, 290, 410].forEach(function(radius, index) {
    const ring    = document.createElement("div");
    const dur     = 0.75 + index * 0.1;
    const opacity = 0.8  - index * 0.13;

    ring.className = "sparkle-ring";
    ring.style.left           = originX + "px";
    ring.style.top            = originY + "px";
    ring.style.width          = (radius * 2) + "px";
    ring.style.height         = (radius * 2) + "px";
    ring.style.setProperty("--ring-color", "rgba(244,188,110," + opacity + ")");
    ring.style.setProperty("--dur",        dur + "s");
    ring.style.animationDelay = (index * 0.07) + "s";

    document.body.appendChild(ring);
    setTimeout(function() { ring.remove(); }, (dur + index * 0.07 + 0.15) * 1000);
  });

  /* ── Wave 2: Particle burst from the toggle button ── */
  const shapeClasses = ["", " sparkle-star", "", " sparkle-star", ""];

  for (let i = 0; i < 60; i++) {
    const particle     = document.createElement("div");
    particle.className = "sparkle" + shapeClasses[i % shapeClasses.length];

    const size     = 3 + Math.random() * 11;
    const color    = colors[Math.floor(Math.random() * colors.length)];

    /* Particles start near the toggle button with a small random offset */
    const jitter = 28;
    const startX = originX + (Math.random() - 0.5) * jitter;
    const startY = originY + (Math.random() - 0.5) * jitter;

    /* Each particle flies off in a random direction */
    const angle    = Math.random() * Math.PI * 2;
    const distance = Math.random() < 0.4
      ? 60  + Math.random() * 180   /* short — dense cluster near the button */
      : 200 + Math.random() * Math.min(viewportWidth, viewportHeight) * 0.65; /* long travellers */

    const travelX = Math.cos(angle) * distance;
    const travelY = Math.sin(angle) * distance;
    const dur     = 0.9 + Math.random() * 1.3;
    const spin    = (Math.random() - 0.5) * 600;
    const delay   = Math.random() * 0.45;

    particle.style.width      = size + "px";
    particle.style.height     = size + "px";
    particle.style.left       = startX + "px";
    particle.style.top        = startY + "px";
    particle.style.background = color;
    particle.style.boxShadow  = "0 0 " + (size * 2) + "px " + color + "99";
    particle.style.setProperty("--sx",  travelX + "px");
    particle.style.setProperty("--sy",  travelY + "px");
    particle.style.setProperty("--dur", dur + "s");
    particle.style.setProperty("--rot", spin + "deg");
    particle.style.animationDelay = delay + "s";

    document.body.appendChild(particle);
    setTimeout(function() { particle.remove(); }, (dur + delay + 0.2) * 1000);
  }

  /* ── Wave 3: Rune glyphs floating upward ── */
  for (let i = 0; i < 14; i++) {
    const glyph      = document.createElement("div");
    glyph.className  = "sparkle-glyph";
    glyph.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

    const dur       = 2.0 + Math.random() * 1.6;
    const delay     = 0.08 + i * 0.09;  /* stagger so they appear one after another */
    const driftX    = (Math.random() - 0.5) * 100;
    const driftY    = -(120 + Math.random() * viewportHeight * 0.55);
    const fontSize  = 11 + Math.random() * 16;
    const startTilt = (Math.random() - 0.5) * 30;
    const endTilt   = (Math.random() - 0.5) * 20;

    glyph.style.left      = (viewportWidth * 0.05 + Math.random() * viewportWidth * 0.9) + "px";
    glyph.style.top       = (viewportHeight * 0.15 + Math.random() * viewportHeight * 0.65) + "px";
    glyph.style.fontSize  = fontSize + "px";
    glyph.style.opacity   = "0";
    glyph.style.setProperty("--dur", dur + "s");
    glyph.style.setProperty("--gx",  driftX + "px");
    glyph.style.setProperty("--gy",  driftY + "px");
    glyph.style.setProperty("--gr",  startTilt + "deg");
    glyph.style.setProperty("--gr2", endTilt + "deg");
    glyph.style.animationDelay = delay + "s";

    document.body.appendChild(glyph);
    setTimeout(function() { glyph.remove(); }, (dur + delay + 0.2) * 1000);
  }
}

/* Creates 18 floating firefly particles in the background firefly layer */
function spawnFireflies() {
  const container = document.getElementById("firefly-layer");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 18; i++) {
    const firefly     = document.createElement("div");
    firefly.className = "firefly";

    firefly.style.left            = (Math.random() * 100) + "%";
    firefly.style.top             = (20 + Math.random() * 70) + "%";
    firefly.style.animationDuration = (5 + Math.random() * 8) + "s";
    firefly.style.animationDelay  = (Math.random() * 6) + "s";
    firefly.style.width           = (2 + Math.random() * 3) + "px";
    firefly.style.height          = (2 + Math.random() * 3) + "px";

    container.appendChild(firefly);
  }
}


/* ── 6. AUDIO ───────────────────────────────────────────────── */

/*
  Uses the Web Audio API to generate ambient sounds in the browser —
  no audio files needed. The sounds change with the current theme:
    Default mode — soft wind + occasional bell tones
    Hobbit mode  — low drone + plucked string notes

  Audio also syncs with the hero video on the homepage: when audio is
  turned on, the video unmutes so users hear the highlight reel soundtrack.
*/

let audioCtx     = null;   /* the Web Audio context — created on first use */
let audioPlaying = false;  /* is audio currently playing? */
let masterGain   = null;   /* master volume control node */
let activeNodes  = [];     /* currently running oscillator nodes */

/* Creates the AudioContext on first use (browsers require a user gesture first) */
function initAudio() {
  if (audioCtx) return;
  audioCtx              = new (window.AudioContext || window.webkitAudioContext)();
  masterGain            = audioCtx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(audioCtx.destination);
}

/* Builds the default ambient sound: soft wind + shimmering tone + bells */
function buildDefaultAmbience() {
  const ambGain       = audioCtx.createGain();
  ambGain.gain.value  = 0.18;
  ambGain.connect(masterGain);

  /* Wind layer — low sawtooth wave filtered to sound like a breeze */
  const wind                   = audioCtx.createOscillator();
  const windFilter             = audioCtx.createBiquadFilter();
  wind.type                    = "sawtooth";
  wind.frequency.value         = 80;
  windFilter.type              = "bandpass";
  windFilter.frequency.value   = 200;
  windFilter.Q.value           = 0.5;
  wind.connect(windFilter);
  windFilter.connect(ambGain);
  wind.start();

  /* Shimmer layer — a gently wobbling high tone */
  const shimmer              = audioCtx.createOscillator();
  const shimGain             = audioCtx.createGain();
  const lfo                  = audioCtx.createOscillator(); /* makes the shimmer wobble */
  const lfoGain              = audioCtx.createGain();
  shimmer.type               = "sine";
  shimmer.frequency.value    = 440;
  shimGain.gain.value        = 0.05;
  lfo.frequency.value        = 0.3;
  lfoGain.gain.value         = 30;
  lfo.connect(lfoGain);
  lfoGain.connect(shimmer.frequency);
  lfo.start();
  shimmer.connect(shimGain);
  shimGain.connect(ambGain);
  shimmer.start();

  /* Bell layer — a random pentatonic note every 2–6 seconds */
  const bellFrequencies = [523, 659, 784, 880, 1047];

  function playBell() {
    if (!audioPlaying) return;

    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now  = audioCtx.currentTime;

    osc.type            = "sine";
    osc.frequency.value = bellFrequencies[Math.floor(Math.random() * bellFrequencies.length)];

    /* Quick attack, slow decay — sounds like a struck bell */
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);

    osc.connect(gain);
    gain.connect(ambGain);
    osc.start();
    osc.stop(now + 2.2);

    setTimeout(playBell, 2000 + Math.random() * 4000);
  }
  setTimeout(playBell, 1500);

  return [wind, shimmer, lfo];
}

/* Builds the Hobbit ambient sound: deep drone + fifth harmony + plucked strings */
function buildHobbitAmbience() {
  const ambGain      = audioCtx.createGain();
  ambGain.gain.value = 0.2;
  ambGain.connect(masterGain);

  /* Drone layer — a low growling bass note */
  const drone                  = audioCtx.createOscillator();
  const droneFilter            = audioCtx.createBiquadFilter();
  drone.type                   = "sawtooth";
  drone.frequency.value        = 55;
  droneFilter.type             = "lowpass";
  droneFilter.frequency.value  = 300;
  droneFilter.Q.value          = 2;
  drone.connect(droneFilter);
  droneFilter.connect(ambGain);
  drone.start();

  /* Fifth layer — a harmony note a musical fifth above the drone */
  const fifth            = audioCtx.createOscillator();
  const fifthGain        = audioCtx.createGain();
  fifth.type             = "sine";
  fifth.frequency.value  = 82.5;
  fifthGain.gain.value   = 0.2;
  fifth.connect(fifthGain);
  fifthGain.connect(ambGain);
  fifth.start();

  /* Volume LFO — makes the whole ambience gently swell and breathe */
  const lfo             = audioCtx.createOscillator();
  const lfoGain         = audioCtx.createGain();
  lfo.frequency.value   = 0.1;
  lfoGain.gain.value    = 0.08;
  lfo.connect(lfoGain);
  lfoGain.connect(ambGain.gain);
  lfo.start();

  /* Pluck layer — occasional plucked string note every 2.5–7.5 seconds */
  const pluckNotes = [110, 146.83, 164.81, 220, 261.63];

  function playPluck() {
    if (!audioPlaying) return;

    const osc    = audioCtx.createOscillator();
    const gain   = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    const now    = audioCtx.currentTime;

    osc.type               = "triangle";
    osc.frequency.value    = pluckNotes[Math.floor(Math.random() * pluckNotes.length)];
    filter.type            = "bandpass";
    filter.frequency.value = osc.frequency.value * 2;
    filter.Q.value         = 3;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ambGain);
    osc.start();
    osc.stop(now + 3.5);

    setTimeout(playPluck, 2500 + Math.random() * 5000);
  }
  setTimeout(playPluck, 800);

  return [drone, fifth, lfo];
}

/* Stops any currently playing nodes and starts fresh ambience for the current theme */
function startAmbience() {
  activeNodes.forEach(function(node) {
    try { node.stop(); } catch (e) { /* node already stopped — safe to ignore */ }
  });
  activeNodes = [];
  activeNodes = isHobbit ? buildHobbitAmbience() : buildDefaultAmbience();
}

/* Crossfades smoothly to the new theme's ambience when the theme changes */
function switchAmbience() {
  if (!audioPlaying || !audioCtx) return;

  /* Fade out over 0.8s, swap sounds, then fade back in */
  masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
  setTimeout(function() {
    startAmbience();
    masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5);
  }, 900);
}

/* Unmutes or mutes the hero video to match the audio state */
function syncVideoAudio(playing) {
  const video = document.getElementById("hero-video");
  if (!video) return;
  video.muted = !playing;
}

/* Called when the user clicks the audio button in the nav */
function toggleAudio() {
  initAudio();

  /* Resume if the browser suspended the context (common on mobile) */
  if (audioCtx.state === "suspended") audioCtx.resume();

  audioPlaying = !audioPlaying;

  /* Update all audio button instances (nav + mobile menu) */
  document.querySelectorAll("#audio-btn, #mob-audio-btn").forEach(function(btn) {
    btn.classList.toggle("playing", audioPlaying);
  });
  document.querySelectorAll(".mob-audio-label").forEach(function(el) {
    el.textContent = audioPlaying ? "Mute" : "Play";
  });

  if (audioPlaying) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5);
    startAmbience();
    syncVideoAudio(true);
    showToast(isHobbit ? "🎵 The Shire breathes…" : "🎵 Ambient sounds on");
  } else {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
    syncVideoAudio(false);

    /* Stop oscillators after the fade-out completes */
    setTimeout(function() {
      activeNodes.forEach(function(node) {
        try { node.stop(); } catch (e) { /* already stopped */ }
      });
      activeNodes = [];
    }, 1600);
  }
}

/* Automatically mute when the user switches to another tab, restore on return */
document.addEventListener("visibilitychange", function() {
  if (!audioCtx || !audioPlaying) return;

  if (document.hidden) {
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
    syncVideoAudio(false);
  } else {
    masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.5);
    syncVideoAudio(true);
  }
});


/* ── 7. TOAST ───────────────────────────────────────────────── */

/* A small notification that appears briefly at the bottom of the screen */
let _toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  /* Reset the timer each call so rapid toasts don't dismiss each other early */
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() {
    toast.classList.remove("show");
  }, 3500);
}


/* ── 8. SEARCH ──────────────────────────────────────────────── */

function openSearch() {
  document.getElementById("search-overlay")?.classList.add("open");

  /* Small delay before focusing so the open animation has time to start */
  setTimeout(function() {
    document.getElementById("search-input")?.focus();
  }, 100);
}

function closeSearch() {
  document.getElementById("search-overlay")?.classList.remove("open");

  const input = document.getElementById("search-input");
  if (input) input.value = "";

  renderSearchResults("");
}

/* Called by the search input's oninput attribute */
function handleSearch(query) {
  renderSearchResults(query);
}

function renderSearchResults(query) {
  const resultsEl = document.getElementById("search-results");
  if (!resultsEl) return;

  /* Show a hint when the search box is empty */
  if (!query.trim()) {
    resultsEl.innerHTML = '<div class="search-empty">Search by title, date, or tag…</div>';
    return;
  }

  const lowerQuery = query.toLowerCase();

  /* Search across title, date, tags, excerpt, region and location */
  const matches = POSTS.filter(function(post) {
    return (
      post.title.toLowerCase().includes(lowerQuery)                              ||
      formatDate(post.date).toLowerCase().includes(lowerQuery)                   ||
      post.tags.some(function(tag) { return tag.toLowerCase().includes(lowerQuery); }) ||
      post.excerpt.toLowerCase().includes(lowerQuery)                            ||
      (post.region   || "").toLowerCase().includes(lowerQuery)                   ||
      (post.location || "").toLowerCase().includes(lowerQuery)
    );
  });

  if (!matches.length) {
    resultsEl.innerHTML = '<div class="search-empty">No results for "' + query + '"</div>';
    return;
  }

  resultsEl.innerHTML = matches.map(function(post) {
    return (
      '<div class="search-item" onclick="closeSearch(); openPost(\'' + post.id + '\')">' +
        '<span class="search-item-emoji">' + post.emoji + '</span>' +
        '<div>' +
          '<div class="search-item-title">' + post.title + '</div>' +
          '<div class="search-item-meta">' +
            formatDate(post.date) + ' · ' + post.tags.slice(0, 3).join(" · ") +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }).join("");
}


/* ── 9. FACTS WIDGET ────────────────────────────────────────── */

/*
  The kiwi button in the bottom-left shows a random NZ fun fact.
  Facts are shuffled so you don't see them in the same order every time.
*/
const NZ_FACTS = [
  "🥝 Aotearoa means 'Land of the Long White Cloud' in te reo Māori.",
  "🗳 NZ was the first country to give women the right to vote — in 1893.",
  "🐑 There are roughly 6 sheep for every person in New Zealand.",
  "🦎 The tuatara's lineage is 250 million years old. A living dinosaur.",
  "🥚 The kiwi bird lays the largest egg relative to body size of any bird.",
  "🗺 NZ is one of the last places on Earth that humans ever settled.",
  "💎 Te Waipounamu — the South Island — means 'The Waters of Greenstone'.",
  "🌊 NZ has over 15,000 km of coastline. That's more than Australia.",
  "⛰ There are over 3,000 peaks above 2,000m in New Zealand.",
  "🦜 The kākāpō is the world's heaviest parrot — and it cannot fly.",
  "☁️ Lord of the Rings filmed across more than 150 locations in NZ.",
  "🧙 Try: ↑↑↓↓←→←→BA for a secret…",
];

/* Fisher-Yates shuffle — returns a new randomly-ordered copy of the array */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

let _shuffledFacts = shuffleArray(NZ_FACTS);
let _factIndex     = 0;

function showFact() {
  const tooltip = document.getElementById("facts-tip");
  if (!tooltip) return;

  /* Re-shuffle once we've cycled through every fact */
  if (_factIndex >= _shuffledFacts.length) {
    _shuffledFacts = shuffleArray(NZ_FACTS);
    _factIndex     = 0;
  }

  tooltip.textContent = _shuffledFacts[_factIndex++];
  tooltip.classList.add("show");

  /* Hide the tooltip after 5 seconds */
  clearTimeout(tooltip._hideTimer);
  tooltip._hideTimer = setTimeout(function() {
    tooltip.classList.remove("show");
  }, 5000);
}


/* ── 10. VISITOR COUNTER ────────────────────────────────────── */

/*
  A simple counter stored in localStorage.
  Each browser counts as one visit; the number is shared via localStorage
  so it grows across sessions. Animates up from a lower number on display.
*/
function initVisitorCounter() {
  const storageKey = "nz_blog_v3_visitors";
  const sessionKey = "nz_v3_session";
  let   count      = parseInt(localStorage.getItem(storageKey) || "127");

  /* Only increment once per browser session */
  if (!sessionStorage.getItem(sessionKey)) {
    count++;
    localStorage.setItem(storageKey, count);
    sessionStorage.setItem(sessionKey, "1");
  }

  /* Animate the counter up from a lower starting number for a nicer effect */
  document.querySelectorAll(".visitor-count").forEach(function(el) {
    let current    = Math.max(0, count - 40);
    const stepSize = Math.max(1, Math.floor((count - current) / 50));

    const timer = setInterval(function() {
      current = Math.min(current + stepSize, count);
      el.textContent = current.toLocaleString();
      if (current >= count) clearInterval(timer);
    }, 25);
  });
}


/* ── 11. SCROLL FADE-IN ─────────────────────────────────────── */

/*
  Any element with class "fade-in" starts invisible and fades into view
  once it scrolls into the viewport. Uses IntersectionObserver for performance.
*/
function initFadeIn() {
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".fade-in").forEach(function(el) {
    observer.observe(el);
  });
}


/* ── 12. KEYBOARD SHORTCUTS + KONAMI CODE ───────────────────── */

/* Konami code: ↑↑↓↓←→←→BA — activates Hobbit mode as a hidden easter egg */
let _konamiSequence = [];
const KONAMI_CODE   = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener("keydown", function(event) {
  _konamiSequence.push(event.keyCode);
  _konamiSequence = _konamiSequence.slice(-10); /* keep only the last 10 keys */

  if (_konamiSequence.join() === KONAMI_CODE.join()) {
    showToast("🧙‍♂️ Even Gandalf is impressed.");
    if (!isHobbit) toggleTheme();
  }
});

/* Escape closes overlays; "/" opens search (unless you're typing in an input) */
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    closeSearch();
    closeMenu();
  }
  const isTyping = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
  if (event.key === "/" && !isTyping) {
    event.preventDefault();
    openSearch();
  }
});


/* ── 13. initShared() ───────────────────────────────────────── */

/*
  Called once by every page's DOMContentLoaded handler.
  Sets up everything that is shared across all pages.
*/
function initShared() {

  /* Lock hero text visible after the staggered entry animations finish,
     so that toggling the theme doesn't accidentally reset them.
       - eyebrow:  delay 0.45s + duration 0.7s = finishes at ~1.15s
       - title:    delay 0.65s + duration 0.8s = finishes at ~1.45s
       - subtitle: delay 0.85s + duration 0.7s = finishes at ~1.55s
     We listen for animationend on the subtitle (the last to finish),
     plus a 2s fallback in case the event doesn't fire. */
  const heroContent = document.querySelector(".hero-content");
  const heroStats   = document.querySelector(".hero-stats");

  if (heroContent) {
    const subtitle = heroContent.querySelector(".hero-subtitle");
    const lockHero = function() { heroContent.classList.add("visible"); };
    if (subtitle) subtitle.addEventListener("animationend", lockHero, { once: true });
    setTimeout(lockHero, 2000);
  }
  if (heroStats) {
    heroStats.addEventListener("animationend", function() {
      heroStats.classList.add("visible");
    }, { once: true });
    setTimeout(function() { heroStats?.classList.add("visible"); }, 1800);
  }

  applyTheme();
  startClock();
  initFadeIn();
  initVisitorCounter();

  /* Highlight the active nav link by comparing the current page filename */
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a, .mob-link").forEach(function(link) {
    const linkPage = (link.getAttribute("href") || "").split("?")[0].split("/").pop();
    const isActive = linkPage === currentPage ||
                     (linkPage === "" && currentPage === "index.html");
    link.classList.toggle("active", isActive);
  });
}
