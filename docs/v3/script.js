/* ============================================================
   AOTEAROA DIARIES — script.js
   Shared across: index.html, blog.html, about.html, posts/*.html

   Sections:
   1.  Helpers
   2.  NZ Clock
   3.  Nav — hamburger
   4.  Theme (Hobbit mode)
   5.  Sparkle + Fireflies
   6.  Audio (Web Audio API ambience + video sync)
   7.  Toast (bottom-right)
   8.  Search overlay
   9.  Facts widget
   10. Visitor counter
   11. Scroll fade-in
   12. Konami code easter egg
   13. initShared() — called by every page
   ============================================================ */


/* ── 1. HELPERS ─────────────────────────────────────────────── */
function formatDate(d) {
  return new Date(d).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}


/* ── 2. NZ CLOCK ────────────────────────────────────────────── */
function startClock() {
  function tick() {
    const time = new Date().toLocaleTimeString("en-NZ", {
      timeZone: "Pacific/Auckland",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    document.querySelectorAll(".nav-clock, .mob-clock-time").forEach(el => el.textContent = time);
  }
  tick();
  setInterval(tick, 1000);
}


/* ── 3. NAV — hamburger ─────────────────────────────────────── */
let menuOpen = false;

function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById("hamburger")?.classList.toggle("open", menuOpen);
  document.getElementById("mobile-menu")?.classList.toggle("open", menuOpen);
  document.body.style.overflow = menuOpen ? "hidden" : "";
}

function closeMenu() {
  menuOpen = false;
  document.getElementById("hamburger")?.classList.remove("open");
  document.getElementById("mobile-menu")?.classList.remove("open");
  document.body.style.overflow = "";
}


/* ── 4. THEME ───────────────────────────────────────────────── */
let isHobbit = localStorage.getItem("nz-theme") === "hobbit";

function applyTheme() {
  document.documentElement.setAttribute("data-theme", isHobbit ? "hobbit" : "default");

  // Update icon + label across all toggle instances
  const icon  = isHobbit ? "🌿" : "🧙";
  const label = isHobbit ? "Default" : "Hobbit";
  document.querySelectorAll(".theme-icon").forEach(el => el.textContent = icon);
  document.querySelectorAll(".theme-label").forEach(el => el.textContent = label);

  // Kiwi btn → ring in hobbit mode
  const kiwi = document.getElementById("kiwi-btn");
  if (kiwi) kiwi.textContent = isHobbit ? "💍" : "🥝";

  // Nav hobbit button: aria-pressed for accessibility
  const hobbitBtn = document.getElementById("hobbit-toggle-btn");
  if (hobbitBtn) {
    hobbitBtn.setAttribute("aria-pressed", isHobbit ? "true" : "false");
    hobbitBtn.classList.toggle("hobbit-active", isHobbit);
  }
}

function toggleTheme() {
  const scrollY = window.scrollY;

  // Add transitioning class — blanket-smooths all colour changes
  document.body.classList.add("theme-transitioning");
  setTimeout(() => document.body.classList.remove("theme-transitioning"), 600);

  isHobbit = !isHobbit;
  localStorage.setItem("nz-theme", isHobbit ? "hobbit" : "default");
  applyTheme();

  if (isHobbit) {
    spawnSparkles();
    spawnFireflies();
  } else {
    // Clear fireflies on exit
    const fl = document.getElementById("firefly-layer");
    if (fl) {
      fl.style.opacity = "0";
      setTimeout(() => { fl.innerHTML = ""; fl.style.opacity = ""; }, 600);
    }
  }

  showToast(isHobbit ? "✨ You have entered the Shire" : "🌿 Back to Aotearoa");

  requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: "instant" }));
  switchAmbience();
}


/* ── 5. SPARKLE + FIREFLIES ─────────────────────────────────── */
/*
  Refined sparkle: mixed circles + star shapes, staggered timing,
  radial burst pattern rather than fully random scatter.
*/
function spawnSparkles() {
  const colors  = ["#F4BC6E", "#e8a84d", "#fff8dc", "#d4943a", "#ffe0a0", "#ffffff"];
  const glyphs  = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "✦", "✧", "⁕", "☽", "✨"];
  const W = window.innerWidth, H = window.innerHeight;

  // Wave 1: expanding rings from center (0ms)
  [80, 160, 260, 380].forEach((r, i) => {
    const ring = document.createElement("div");
    ring.className = "sparkle-ring";
    const dur = 0.85 + i * 0.12;
    ring.style.cssText = `
      left: 50%; top: 40%;
      width: ${r * 2}px; height: ${r * 2}px;
      --ring-color: rgba(244,188,110,${0.7 - i * 0.15});
      --dur: ${dur}s;
      animation-delay: ${i * 0.08}s;
    `;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), (dur + i * 0.08 + 0.1) * 1000);
  });

  // Wave 2: particle burst spread across screen (100ms stagger)
  const shapes = ["", " sparkle-star", " sparkle-rune", " sparkle-star"];
  for (let i = 0; i < 72; i++) {
    const s = document.createElement("div");
    s.className = "sparkle" + shapes[i % shapes.length];

    const size  = 4 + Math.random() * 14;
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Multi-origin: some from center, some random edge origins
    const originX = Math.random() < 0.6
      ? W * 0.5 + (Math.random() - 0.5) * W * 0.3
      : Math.random() * W;
    const originY = Math.random() < 0.6
      ? H * 0.38 + (Math.random() - 0.5) * H * 0.2
      : Math.random() * H * 0.6;

    const angle = Math.random() * Math.PI * 2;
    const dist  = 120 + Math.random() * Math.max(W, H) * 0.45;
    const sx    = Math.cos(angle) * dist;
    const sy    = Math.sin(angle) * dist;
    const dur   = 1.1 + Math.random() * 1.2;
    const rot   = (Math.random() - 0.5) * 720;
    const delay = Math.random() * 0.55;

    s.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${originX}px; top: ${originY}px;
      background: ${color};
      --sx: ${sx}px; --sy: ${sy}px;
      --dur: ${dur}s; --rot: ${rot}deg;
      --es: ${0.2 + Math.random() * 0.5};
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 1.8}px ${color}88;
    `;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), (dur + delay + 0.2) * 1000);
  }

  // Wave 3: rune glyphs drift upward from random points (200ms stagger)
  for (let i = 0; i < 12; i++) {
    const g = document.createElement("div");
    g.className = "sparkle-glyph";
    g.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    const dur   = 1.8 + Math.random() * 1.4;
    const delay = 0.1 + Math.random() * 0.7;
    const gx    = (Math.random() - 0.5) * 120;
    const gy    = -(100 + Math.random() * 200);
    const fs    = 12 + Math.random() * 18;
    g.style.cssText = `
      left: ${W * 0.1 + Math.random() * W * 0.8}px;
      top: ${H * 0.2 + Math.random() * H * 0.55}px;
      font-size: ${fs}px;
      --dur: ${dur}s; --gx: ${gx}px; --gy: ${gy}px;
      animation-delay: ${delay}s;
      opacity: 0;
    `;
    document.body.appendChild(g);
    setTimeout(() => g.remove(), (dur + delay + 0.2) * 1000);
  }
}

function spawnFireflies() {
  const c = document.getElementById("firefly-layer");
  if (!c) return;
  c.innerHTML = "";
  for (let i = 0; i < 18; i++) {
    const f = document.createElement("div");
    f.className = "firefly";
    f.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${20 + Math.random() * 70}%;
      animation-duration: ${5 + Math.random() * 8}s;
      animation-delay: ${Math.random() * 6}s;
      width: ${2 + Math.random() * 3}px;
      height: ${2 + Math.random() * 3}px;
    `;
    c.appendChild(f);
  }
}


/* ── 6. AUDIO ───────────────────────────────────────────────── */
/*
  Audio strategy:
  - Ambient Web Audio API sounds (wind/bells for default, drone/plucks for hobbit)
  - When the hero video is present (#hero-video), audio ALSO unmutes/mutes the
    video so users hear the actual highlight reel soundtrack when on the homepage.
  - Auto-mutes on tab hide, resumes on tab show.
*/
let audioCtx     = null;
let audioPlaying = false;
let masterGain   = null;
let activeNodes  = [];

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(audioCtx.destination);
}

/* Default mode: NZ birdsong-inspired bells + soft wind */
function buildDefaultAmbience() {
  const mg = audioCtx.createGain();
  mg.gain.value = 0.18;
  mg.connect(masterGain);

  const wind = audioCtx.createOscillator();
  const wf   = audioCtx.createBiquadFilter();
  wind.type = "sawtooth";
  wind.frequency.value = 80;
  wf.type = "bandpass";
  wf.frequency.value = 200;
  wf.Q.value = 0.5;
  wind.connect(wf);
  wf.connect(mg);
  wind.start();

  const shimmer = audioCtx.createOscillator();
  const sg  = audioCtx.createGain();
  const lfo = audioCtx.createOscillator();
  const lg  = audioCtx.createGain();
  shimmer.type = "sine";
  shimmer.frequency.value = 440;
  sg.gain.value = 0.05;
  lfo.frequency.value = 0.3;
  lg.gain.value = 30;
  lfo.connect(lg);
  lg.connect(shimmer.frequency);
  lfo.start();
  shimmer.connect(sg);
  sg.connect(mg);
  shimmer.start();

  function bell() {
    if (!audioPlaying) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = [523, 659, 784, 880, 1047][Math.floor(Math.random() * 5)];
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);
    o.connect(g);
    g.connect(mg);
    o.start();
    o.stop(audioCtx.currentTime + 2.2);
    setTimeout(bell, 2000 + Math.random() * 4000);
  }
  setTimeout(bell, 1500);
  return [wind, shimmer, lfo];
}

/* Hobbit mode: Shire-esque drone + plucked strings */
function buildHobbitAmbience() {
  const mg = audioCtx.createGain();
  mg.gain.value = 0.2;
  mg.connect(masterGain);

  const drone = audioCtx.createOscillator();
  const df    = audioCtx.createBiquadFilter();
  drone.type = "sawtooth";
  drone.frequency.value = 55;
  df.type = "lowpass";
  df.frequency.value = 300;
  df.Q.value = 2;
  drone.connect(df);
  df.connect(mg);
  drone.start();

  const fifth = audioCtx.createOscillator();
  const fg    = audioCtx.createGain();
  fifth.type = "sine";
  fifth.frequency.value = 82.5;
  fg.gain.value = 0.2;
  fifth.connect(fg);
  fg.connect(mg);
  fifth.start();

  const lfo = audioCtx.createOscillator();
  const lg  = audioCtx.createGain();
  lfo.frequency.value = 0.1;
  lg.gain.value = 0.08;
  lfo.connect(lg);
  lg.connect(mg.gain);
  lfo.start();

  function pluck() {
    if (!audioPlaying) return;
    const notes = [110, 146.83, 164.81, 220, 261.63];
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const f = audioCtx.createBiquadFilter();
    o.type = "triangle";
    o.frequency.value = notes[Math.floor(Math.random() * notes.length)];
    f.type = "bandpass";
    f.frequency.value = o.frequency.value * 2;
    f.Q.value = 3;
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
    o.connect(f);
    f.connect(g);
    g.connect(mg);
    o.start();
    o.stop(audioCtx.currentTime + 3.5);
    setTimeout(pluck, 2500 + Math.random() * 5000);
  }
  setTimeout(pluck, 800);
  return [drone, fifth, lfo];
}

function startAmbience() {
  activeNodes.forEach(n => { try { n.stop(); } catch(e){} });
  activeNodes = [];
  activeNodes = isHobbit ? buildHobbitAmbience() : buildDefaultAmbience();
}

function switchAmbience() {
  if (!audioPlaying || !audioCtx) return;
  masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
  setTimeout(() => {
    startAmbience();
    masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5);
  }, 900);
}

/* Sync video element mute state with audio playing state */
function syncVideoAudio(playing) {
  const vid = document.getElementById("hero-video");
  if (!vid) return;
  vid.muted = !playing;
}

function toggleAudio() {
  initAudio();
  if (audioCtx.state === "suspended") audioCtx.resume();
  audioPlaying = !audioPlaying;

  // Update all audio button instances
  document.querySelectorAll("#audio-btn, #mob-audio-btn").forEach(b => {
    b.classList.toggle("playing", audioPlaying);
  });
  document.querySelectorAll(".mob-audio-label").forEach(el => {
    el.textContent = audioPlaying ? "Mute" : "Play";
  });
  // CSS class .playing on #audio-btn handles icon↔bars swap via CSS rules.

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
    setTimeout(() => {
      activeNodes.forEach(n => { try { n.stop(); } catch(e){} });
      activeNodes = [];
    }, 1600);
  }
}

/* Auto-mute when tab is hidden, resume when visible */
document.addEventListener("visibilitychange", () => {
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
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}


/* ── 8. SEARCH ──────────────────────────────────────────────── */
function openSearch() {
  document.getElementById("search-overlay")?.classList.add("open");
  setTimeout(() => document.getElementById("search-input")?.focus(), 100);
}

function closeSearch() {
  document.getElementById("search-overlay")?.classList.remove("open");
  const inp = document.getElementById("search-input");
  if (inp) inp.value = "";
  renderSearchResults("");
}

function handleSearch(q) { renderSearchResults(q); }

function renderSearchResults(q) {
  const el = document.getElementById("search-results");
  if (!el) return;
  if (!q.trim()) {
    el.innerHTML = `<div class="search-empty">Search by title, date, or tag…</div>`;
    return;
  }
  const lower = q.toLowerCase();
  const matches = POSTS.filter(p =>
    p.title.toLowerCase().includes(lower) ||
    formatDate(p.date).toLowerCase().includes(lower) ||
    p.tags.some(t => t.toLowerCase().includes(lower)) ||
    p.excerpt.toLowerCase().includes(lower) ||
    (p.region   || "").toLowerCase().includes(lower) ||
    (p.location || "").toLowerCase().includes(lower)
  );
  if (!matches.length) {
    el.innerHTML = `<div class="search-empty">No results for "${q}"</div>`;
    return;
  }
  el.innerHTML = matches.map(p => `
    <div class="search-item" onclick="closeSearch(); openPost('${p.id}')">
      <span class="search-item-emoji">${p.emoji}</span>
      <div>
        <div class="search-item-title">${p.title}</div>
        <div class="search-item-meta">${formatDate(p.date)} · ${p.tags.slice(0,3).join(" · ")}</div>
      </div>
    </div>`).join("");
}


/* ── 9. FACTS WIDGET ────────────────────────────────────────── */
/*
  Facts are shown in random order (not sequential) for variety.
  Tooltip stays visible for 5 seconds (fixed).
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

/* Shuffle helper — Fisher-Yates */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let _shuffledFacts = shuffleArray(NZ_FACTS);
let _factIdx = 0;

function showFact() {
  const tip = document.getElementById("facts-tip");
  if (!tip) return;

  // Reshuffle when we've gone through all facts
  if (_factIdx >= _shuffledFacts.length) {
    _shuffledFacts = shuffleArray(NZ_FACTS);
    _factIdx = 0;
  }

  tip.textContent = _shuffledFacts[_factIdx++];
  tip.classList.add("show");

  // Clear any existing hide timer and set fresh 5s duration
  clearTimeout(tip._hideTimer);
  tip._hideTimer = setTimeout(() => tip.classList.remove("show"), 5000);
}


/* ── 10. VISITOR COUNTER ────────────────────────────────────── */
function initVisitorCounter() {
  const key = "nz_blog_v3_visitors";
  let count = parseInt(localStorage.getItem(key) || "127");
  if (!sessionStorage.getItem("nz_v3_session")) {
    count++;
    localStorage.setItem(key, count);
    sessionStorage.setItem("nz_v3_session", "1");
  }
  document.querySelectorAll(".visitor-count").forEach(el => {
    let cur = Math.max(0, count - 40);
    const step = Math.max(1, Math.floor((count - cur) / 50));
    const t = setInterval(() => {
      cur = Math.min(cur + step, count);
      el.textContent = cur.toLocaleString();
      if (cur >= count) clearInterval(t);
    }, 25);
  });
}


/* ── 11. SCROLL FADE-IN ─────────────────────────────────────── */
function initFadeIn() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.08 });
  document.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
}


/* ── 12. KONAMI CODE ────────────────────────────────────────── */
let _konamiSeq = [];
const KONAMI = [38,38,40,40,37,39,37,39,66,65];
document.addEventListener("keydown", e => {
  _konamiSeq.push(e.keyCode);
  _konamiSeq = _konamiSeq.slice(-10);
  if (_konamiSeq.join() === KONAMI.join()) {
    showToast("🧙‍♂️ Even Gandalf is impressed.");
    if (!isHobbit) toggleTheme();
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeSearch(); closeMenu(); }
  if (e.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) {
    e.preventDefault();
    openSearch();
  }
});


/* ── 13. initShared() ───────────────────────────────────────── */
/*
  Called once in every page's DOMContentLoaded.
  Sets up: theme, clock, fade-in, visitor counter, nav highlighting,
  bottom-cluster visibility animations.
*/
function initShared() {
  // Lock hero text visible after entry animation so theme toggle can't reset it
  const heroContent = document.querySelector(".hero-content");
  const heroStats   = document.querySelector(".hero-stats");
  if (heroContent) {
    heroContent.addEventListener("animationend", () => heroContent.classList.add("visible"), { once: true });
    // Fallback: lock after 1.5s if animationend doesn't fire
    setTimeout(() => heroContent?.classList.add("visible"), 1500);
  }
  if (heroStats) {
    heroStats.addEventListener("animationend", () => heroStats.classList.add("visible"), { once: true });
    setTimeout(() => heroStats?.classList.add("visible"), 1700);
  }
  applyTheme();
  startClock();
  initFadeIn();
  initVisitorCounter();

  // Highlight active nav link
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mob-link").forEach(a => {
    const href = (a.getAttribute("href") || "").split("?")[0].split("/").pop();
    a.classList.toggle("active", href === page || (href === "" && page === "index.html"));
  });

  // No bottom cluster reveal needed — only kiwi widget remains at bottom-left.
}
