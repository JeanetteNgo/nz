/* ============================================================
   AOTEAROA DIARIES — script.js
   Shared across: index.html, blog.html, about.html, posts/*.html

   Sections:
   1.  Helpers
   2.  NZ Clock
   3.  Nav — scroll + hamburger
   4.  Theme (Hobbit mode)
   5.  Sparkle + Fireflies
   6.  Audio
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
    day: "numeric", month: "long", year: "numeric"
  });
}

/* ── 2. NZ CLOCK ────────────────────────────────────────────── */
function startClock() {
  function tick() {
    const time = new Date().toLocaleTimeString("en-NZ", {
      timeZone: "Pacific/Auckland",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    });
    document.querySelectorAll(".nav-clock, .mob-clock-time").forEach(el => el.textContent = time);
  }
  tick();
  setInterval(tick, 1000);
}

/* ── 3. NAV ─────────────────────────────────────────────────── */
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
  const icon  = isHobbit ? "🌿" : "🧙";
  const label = isHobbit ? "Default" : "Hobbit Mode";
  document.querySelectorAll(".theme-icon").forEach(el => el.textContent = icon);
  document.querySelectorAll(".theme-label").forEach(el => el.textContent = label);
  const kiwi = document.getElementById("kiwi-btn");
  if (kiwi) kiwi.textContent = isHobbit ? "💍" : "🥝";
}

function toggleTheme() {
  const scrollY = window.scrollY;
  isHobbit = !isHobbit;
  localStorage.setItem("nz-theme", isHobbit ? "hobbit" : "default");
  applyTheme();

  // Sparkle burst on entering hobbit mode
  if (isHobbit) {
    spawnSparkles();
    spawnFireflies();
  }

  // Non-intrusive toast instead of a blocking dialogue
  showToast(isHobbit ? "✨ You have entered the Shire" : "🌿 You have left the Shire");

  // Restore scroll (prevents jump on theme switch)
  requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: "instant" }));

  // Switch audio if playing
  switchAmbience();
}

/* ── 5. SPARKLE + FIREFLIES ─────────────────────────────────── */
function spawnSparkles() {
  const colors = ["#F4BC6E", "#e8a84d", "#fff", "#d4943a"];
  for (let i = 0; i < 32; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    const size  = 4 + Math.random() * 10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * window.innerWidth}px;
      top:${Math.random() * window.innerHeight}px;
      background:${color};
      --sx:${(Math.random() - .5) * 280}px;
      --sy:${(Math.random() - .5) * 280}px;
      animation-delay:${Math.random() * .4}s;
      box-shadow:0 0 ${size * 2}px ${color};
    `;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
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
      left:${Math.random() * 100}%;
      top:${20 + Math.random() * 70}%;
      animation-duration:${5 + Math.random() * 8}s;
      animation-delay:${Math.random() * 6}s;
      width:${2 + Math.random() * 3}px;
      height:${2 + Math.random() * 3}px;
    `;
    c.appendChild(f);
  }
}

/* ── 6. AUDIO ───────────────────────────────────────────────── */
let audioCtx = null;
let audioPlaying = false;
let masterGain = null;
let activeNodes = [];

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(audioCtx.destination);
}

function buildDefaultAmbience() {
  const mg = audioCtx.createGain(); mg.gain.value = 0.18; mg.connect(masterGain);
  const wind = audioCtx.createOscillator();
  const wf = audioCtx.createBiquadFilter();
  wind.type = "sawtooth"; wind.frequency.value = 80;
  wf.type = "bandpass"; wf.frequency.value = 200; wf.Q.value = 0.5;
  wind.connect(wf); wf.connect(mg); wind.start();
  const shimmer = audioCtx.createOscillator();
  const sg = audioCtx.createGain();
  const lfo = audioCtx.createOscillator();
  const lg = audioCtx.createGain();
  shimmer.type = "sine"; shimmer.frequency.value = 440; sg.gain.value = 0.05;
  lfo.frequency.value = 0.3; lg.gain.value = 30;
  lfo.connect(lg); lg.connect(shimmer.frequency); lfo.start();
  shimmer.connect(sg); sg.connect(mg); shimmer.start();
  function bell() {
    if (!audioPlaying) return;
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = [523, 659, 784, 880, 1047][Math.floor(Math.random() * 5)];
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);
    o.connect(g); g.connect(mg); o.start(); o.stop(audioCtx.currentTime + 2.2);
    setTimeout(bell, 2000 + Math.random() * 4000);
  }
  setTimeout(bell, 1500);
  return [wind, shimmer, lfo];
}

function buildHobbitAmbience() {
  const mg = audioCtx.createGain(); mg.gain.value = 0.2; mg.connect(masterGain);
  const drone = audioCtx.createOscillator(); const df = audioCtx.createBiquadFilter();
  drone.type = "sawtooth"; drone.frequency.value = 55;
  df.type = "lowpass"; df.frequency.value = 300; df.Q.value = 2;
  drone.connect(df); df.connect(mg); drone.start();
  const fifth = audioCtx.createOscillator(); const fg = audioCtx.createGain();
  fifth.type = "sine"; fifth.frequency.value = 82.5; fg.gain.value = 0.2;
  fifth.connect(fg); fg.connect(mg); fifth.start();
  const lfo = audioCtx.createOscillator(); const lg = audioCtx.createGain();
  lfo.frequency.value = 0.1; lg.gain.value = 0.08;
  lfo.connect(lg); lg.connect(mg.gain); lfo.start();
  function pluck() {
    if (!audioPlaying) return;
    const notes = [110, 146.83, 164.81, 220, 261.63];
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); const f = audioCtx.createBiquadFilter();
    o.type = "triangle";
    o.frequency.value = notes[Math.floor(Math.random() * notes.length)];
    f.type = "bandpass"; f.frequency.value = o.frequency.value * 2; f.Q.value = 3;
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
    o.connect(f); f.connect(g); g.connect(mg); o.start(); o.stop(audioCtx.currentTime + 3.5);
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
  setTimeout(() => { startAmbience(); masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5); }, 900);
}

function toggleAudio() {
  initAudio();
  if (audioCtx.state === "suspended") audioCtx.resume();
  audioPlaying = !audioPlaying;
  document.querySelectorAll("#audio-btn, #mob-audio-btn").forEach(b => b.classList.toggle("playing", audioPlaying));
  document.querySelectorAll(".mob-audio-label").forEach(el => el.textContent = audioPlaying ? "Mute" : "Play");
  if (audioPlaying) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5);
    startAmbience();
    showToast(isHobbit ? "🎵 The Shire breathes…" : "🎵 Ambient sounds on");
  } else {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
    setTimeout(() => { activeNodes.forEach(n => { try { n.stop(); } catch(e){} }); activeNodes = []; }, 1600);
  }
}

// Auto-mute when tab is hidden, resume when visible
document.addEventListener("visibilitychange", () => {
  if (!audioCtx || !audioPlaying) return;
  if (document.hidden) {
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
  } else {
    masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.5);
  }
});

/* ── 7. TOAST ───────────────────────────────────────────────── */
/*
  Non-intrusive: small pill in the bottom-right corner.
  Slides in, waits 3.5s, slides out automatically.
  No button required — no interaction blocked.
*/
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
  // POSTS comes from posts-registry.js, loaded before this file
  const matches = POSTS.filter(p =>
    p.title.toLowerCase().includes(lower) ||
    formatDate(p.date).toLowerCase().includes(lower) ||
    p.tags.some(t => t.toLowerCase().includes(lower)) ||
    p.excerpt.toLowerCase().includes(lower) ||
    (p.region || "").toLowerCase().includes(lower) ||
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
const NZ_FACTS = [
  "Kia ora! I'm a kiwi 🥝 — flightless, nocturnal, extremely New Zealand.",
  "Aotearoa means 'Land of the Long White Cloud' in te reo Māori.",
  "NZ was the first country to give women the right to vote — in 1893.",
  "There are roughly 6 sheep per person in New Zealand.",
  "The tuatara's lineage is 250 million years old. A living dinosaur.",
  "The kiwi bird lays the largest egg relative to body size of any bird.",
  "NZ is one of the last places on Earth that humans settled.",
  "Te Waipounamu — the South Island — means 'The Waters of Greenstone'.",
  "🧙 Try: ↑↑↓↓←→←→BA for a secret…"
];
let _factIdx = 0;

function showFact() {
  const tip = document.getElementById("facts-tip");
  if (!tip) return;
  tip.textContent = NZ_FACTS[_factIdx++ % NZ_FACTS.length];
  tip.classList.add("show");
  setTimeout(() => tip.classList.remove("show"), 4500);
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
    e.preventDefault(); openSearch();
  }
});

/* ── 13. initShared() ───────────────────────────────────────── */
/*
  Every page calls initShared() in its own DOMContentLoaded handler.
  It applies the saved theme, starts the clock, wires up the nav link
  highlighting, and shows the facts widget after a short delay.
*/
function initShared() {
  applyTheme();
  startClock();
  initFadeIn();
  initVisitorCounter();

  // Highlight the active nav link
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mob-link").forEach(a => {
    const href = (a.getAttribute("href") || "").split("?")[0].split("/").pop();
    a.classList.toggle("active", href === page || (href === "" && page === "index.html"));
  });

  // Show kiwi/ring widget after 3 seconds
  setTimeout(() => document.getElementById("kiwi-btn")?.classList.add("visible"), 3000);
}
