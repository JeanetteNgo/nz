/* ============================================================
   index.js — Homepage-specific JavaScript
   Sections:
   1.  Nav scroll
   2.  Hero particles
   3.  Hero stats counter animation (incl. "2 TB" byte animation)
   4.  Explore tab switcher
   5.  Map (Leaflet — pin icons, sticky popups on click)
   6.  Region grid
   7.  Journal list
   8.  openPost() shim
   9.  DOMContentLoaded init
   ============================================================ */


/* ── 1. NAV SCROLL ──────────────────────────────────────── */
(function initNavScroll() {
  const nav = document.getElementById("main-nav");
  if (!nav) return;
  const check = () => nav.classList.toggle("over-hero", window.scrollY < window.innerHeight * 0.6);
  window.addEventListener("scroll", check, { passive: true });
  check();
})();


/* ── 2. HERO PARTICLES ──────────────────────────────────── */
function initParticles() {
  const c = document.getElementById("particles");
  if (!c) return;
  for (let i = 0; i < 16; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-duration: ${8 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 10}s;
      width: ${1 + Math.random() * 3}px;
      height: ${1 + Math.random() * 3}px;
    `;
    c.appendChild(p);
  }
}


/* ── 3. HERO STATS COUNTER ANIMATION ────────────────────── */
/*
  Three stat types:
  A) [data-count="365"]       → plain integer count, 0 → 365
  B) #stat-places             → set dynamically from POSTS, 0 → N
  C) [data-bytes="2000000000000"] → byte-scale animation
                                   "0 B" → "244 MB" → "1.8 TB" → "2.0 TB"
*/
function formatBytes(bytes) {
  if (bytes < 1024)        return bytes + " B";
  if (bytes < 1024 ** 2)   return (bytes / 1024).toFixed(0) + " KB";
  if (bytes < 1024 ** 3)   return (bytes / 1024 ** 2).toFixed(0) + " MB";
  if (bytes < 1024 ** 4)   return (bytes / 1024 ** 3).toFixed(1) + " GB";
  return                         (bytes / 1024 ** 4).toFixed(1) + " TB";
}

function animateStatCounters() {
  const duration = 2200;
  const easeOut  = t => 1 - Math.pow(1 - t, 3);

  // Plain integer stats
  document.querySelectorAll(".hero-stat-num[data-count]").forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target) || target === 0) { el.textContent = "0"; return; }
    const start = performance.now();
    const tick  = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOut(p) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  // Byte-scale stat (data-bytes attribute)
  document.querySelectorAll(".hero-stat-num[data-bytes]").forEach(el => {
    const targetBytes = parseInt(el.dataset.bytes, 10);
    if (isNaN(targetBytes)) return;
    el.textContent = "0 B";
    const start = performance.now();
    const tick  = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = formatBytes(Math.round(easeOut(p) * targetBytes));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function updateStatPlaces() {
  const el = document.getElementById("stat-places");
  if (!el) return;
  const count = POSTS.filter(p => p.mapLat).length;
  el.dataset.count = count;
  el.textContent   = "0";
}


/* ── 4. EXPLORE TAB SWITCHER ─────────────────────────────── */
function setExploreTab(id, btn) {
  document.querySelectorAll(".explore-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".explore-tab").forEach(b => b.classList.remove("active"));
  document.getElementById("panel-" + id).classList.add("active");
  btn.classList.add("active");
  if (id === "map") initMap();
}


/* ── 5. MAP ─────────────────────────────────────────────── */
/*
  Fixes vs previous version:
  - L.divIcon with CSS .map-pin-icon (teardrop pin shape) instead of circleMarker
  - Popup behaviour:
      mouseover → opens as preview (if nothing is pinned)
      mouseout  → closes preview (unless pinned)
      click     → pins popup open; second click unpins + closes
  - fitBounds tightened to NZ mainland for better default zoom
  - Voyager tile style (warmer, more readable than light_all)
*/
let mapReady = false;
let nzMap;

function initMap() {
  if (mapReady) return;
  mapReady = true;

  const isMobile = () => window.innerWidth <= 768;

  nzMap = L.map("nz-map", {
    center:             [-41.5, 172.5],
    zoom:               6,
    maxBounds:          [[-50, 162], [-33, 180]],
    maxBoundsViscosity: 0.85,
    minZoom:            5,
    maxZoom:            14,
    zoomControl:        true,
    // On mobile allow scroll; tap-to-pin replaces hover
    scrollWheelZoom:    true,
    dragging:           true,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: "© OpenStreetMap © CARTO",
    subdomains:  "abcd",
    maxZoom:     18,
  }).addTo(nzMap);

  const pinned = POSTS.filter(p => p.mapLat && p.mapLng);
  const countEl = document.getElementById("map-pin-count");
  if (countEl) countEl.textContent = `${pinned.length} location${pinned.length !== 1 ? "s" : ""} visited`;

  let activeMarker = null;

  // ── Helper: show bottom sheet on mobile ──
  function openSheet(post) {
    const sheet = document.getElementById("map-sheet");
    const inner = document.getElementById("map-sheet-inner");
    if (!sheet || !inner) return;

    const imgHTML = post.cover
      ? `<div class="map-sheet-img"><img src="${post.cover}" alt="${post.title}" loading="lazy"
           onerror="this.parentElement.innerHTML='<span style=font-size:28px>${post.emoji}</span>'"></div>`
      : `<div class="map-sheet-img">${post.emoji}</div>`;

    inner.innerHTML = `
      ${imgHTML}
      <div class="map-sheet-body">
        <div class="map-sheet-title">${post.title}</div>
        <div class="map-sheet-date">${formatDate(post.date)}</div>
        <div class="map-sheet-desc">${post.excerpt.slice(0, 100)}…</div>
        <a class="map-sheet-link" href="blog.html?post=${post.id}">Read post →</a>
      </div>`;
    sheet.classList.add("open");
  }

  pinned.forEach(post => {
    const icon = L.divIcon({
      html:        `<i class="fa-solid fa-location-dot map-pin-icon"></i>`,
      className:   "",
      iconSize:    [34, 40],   // slightly larger wrapper gives a bigger hit target
      iconAnchor:  [17, 40],   // anchor at base centre
      popupAnchor: [0, -42],
    });

    const marker = L.marker([post.mapLat, post.mapLng], { icon }).addTo(nzMap);
    const pinEl  = () => marker.getElement()?.querySelector(".map-pin-icon");

    // Desktop: bind popup
    const coverHTML = post.cover
      ? `<div class="popup-img"><img src="${post.cover}" alt="${post.title}" loading="lazy"
           onerror="this.parentElement.innerHTML='<span style=font-size:36px;display:block;text-align:center;line-height:110px>${post.emoji}</span>'"></div>`
      : `<div class="popup-img" style="font-size:36px">${post.emoji}</div>`;

    marker.bindPopup(`
      ${coverHTML}
      <div class="popup-body">
        <div class="popup-title">${post.title}</div>
        <div class="popup-date">📅 ${formatDate(post.date)}</div>
        <div class="popup-desc">${post.excerpt.slice(0, 90)}…</div>
        <a class="popup-link" href="blog.html?post=${post.id}">Read post →</a>
      </div>`, {
      maxWidth:    240,
      autoPan:     false,   // autoPan shifts map + creates empty gap / stray ×
      closeButton: true,
    });

    marker.on("mouseover", function() {
      if (isMobile()) return;
      pinEl()?.classList.add("hovered");
      if (activeMarker !== this) this.openPopup();
    });

    marker.on("mouseout", function() {
      if (isMobile()) return;
      pinEl()?.classList.remove("hovered");
      if (activeMarker !== this) this.closePopup();
    });

    marker.on("click", function(e) {
      if (isMobile()) {
        // Mobile: pan to pin, open bottom sheet
        L.DomEvent.stopPropagation(e);
        // Deactivate previous
        if (activeMarker && activeMarker !== this) {
          activeMarker.getElement()?.querySelector(".map-pin-icon")?.classList.remove("pinned");
        }
        if (activeMarker === this) {
          // Tap same pin → close sheet
          pinEl()?.classList.remove("pinned");
          closeMapSheet();
          activeMarker = null;
        } else {
          activeMarker = this;
          pinEl()?.classList.add("pinned");
          nzMap.panTo([post.mapLat, post.mapLng], { animate: true, duration: 0.4 });
          openSheet(post);
        }
      } else {
        // Desktop: pin/unpin popup
        if (activeMarker === this) {
          pinEl()?.classList.remove("pinned");
          this.closePopup();
          activeMarker = null;
        } else {
          if (activeMarker) {
            activeMarker.getElement()?.querySelector(".map-pin-icon")?.classList.remove("pinned");
            activeMarker.closePopup();
          }
          activeMarker = this;
          pinEl()?.classList.add("pinned");
          this.openPopup();
        }
      }
    });

    marker.on("popupclose", function() {
      if (activeMarker === this) {
        activeMarker = null;
        pinEl()?.classList.remove("pinned");
      }
    });
  });

  // ── Mobile: render scrollable pin list below the map ──
  if (isMobile()) {
    const listEl = document.getElementById("map-pin-list");
    if (listEl) {
      listEl.style.display = "flex";
      listEl.innerHTML = pinned.map(post => `
        <div class="map-pin-list-item" onclick="
          nzMap.panTo([${post.mapLat}, ${post.mapLng}], {animate:true,duration:0.4});
          document.getElementById('map-sheet') && openMapSheet('${post.id}');
        ">
          <i class="fa-solid fa-location-dot map-pin-list-icon"></i>
          <span class="map-pin-list-name">${post.title}</span>
          <span class="map-pin-list-region">${post.region || post.category || ''}</span>
        </div>`).join('');
    }
  }

  nzMap.fitBounds([[-46.8, 166.4], [-34.4, 178.2]], { padding: [20, 20] });
}

/* Called from pin list items — open sheet for a specific post id */
function openMapSheet(postId) {
  const post = POSTS.find(p => p.id === postId);
  if (!post) return;
  const sheet = document.getElementById("map-sheet");
  const inner = document.getElementById("map-sheet-inner");
  if (!sheet || !inner) return;
  const imgHTML = post.cover
    ? `<div class="map-sheet-img"><img src="${post.cover}" alt="${post.title}" loading="lazy"></div>`
    : `<div class="map-sheet-img">${post.emoji}</div>`;
  inner.innerHTML = `
    ${imgHTML}
    <div class="map-sheet-body">
      <div class="map-sheet-title">${post.title}</div>
      <div class="map-sheet-date">${formatDate(post.date)}</div>
      <div class="map-sheet-desc">${post.excerpt.slice(0, 100)}…</div>
      <a class="map-sheet-link" href="blog.html?post=${post.id}">Read post →</a>
    </div>`;
  sheet.classList.add("open");
}

function closeMapSheet() {
  document.getElementById("map-sheet")?.classList.remove("open");
}


/* ── 6. REGION GRID ─────────────────────────────────────── */
/*
  Cards are JS-appended after initFadeIn(), so IntersectionObserver
  doesn't catch them. Use CSS @keyframes cardReveal with per-card delay.
*/
function renderRegions() {
  ["south", "north"].forEach(island => {
    const grid = document.getElementById(island + "-grid");
    if (!grid) return;

    REGIONS.filter(r => r.island === island).forEach((region, idx) => {
      let imgSrc = region.cover || null;
      if (!imgSrc) {
        const fallback = POSTS.find(p => p.region === region.name && p.cover);
        if (fallback) imgSrc = fallback.cover;
      }

      const card = document.createElement("div");
      card.className          = "region-card";
      card.style.animationDelay = `${idx * 80}ms`;
      card.onclick = () => {
        window.location.href = `blog.html?region=${encodeURIComponent(region.name)}`;
      };

      card.innerHTML = `
        <div class="region-thumb">
          ${imgSrc
            ? `<img src="${imgSrc}" alt="${region.name}" loading="lazy"
                 onerror="this.parentElement.innerHTML='<span style=font-size:44px>${region.emoji}</span>'">`
            : `<span style="font-size:44px">${region.emoji}</span>`}
        </div>
        <div class="region-name">${region.name}</div>`;

      grid.appendChild(card);
    });
  });
}


/* ── 7. JOURNAL LIST ─────────────────────────────────────── */
function renderJournal() {
  const container = document.getElementById("journal-list");
  if (!container) return;
  const posts = FEATURED_LIST.map(id => POSTS.find(p => p.id === id)).filter(Boolean);
  container.innerHTML = posts.map((p, i) => `
    <div class="journal-item" onclick="window.location.href='blog.html?post=${p.id}'">
      <div class="journal-thumb">
        ${p.cover
          ? `<img src="${p.cover}" alt="${p.title}" loading="lazy"
               onerror="this.parentElement.innerHTML='<span style=font-size:26px>${p.emoji}</span>'">`
          : `<span style="font-size:26px">${p.emoji}</span>`}
      </div>
      <div>
        <div class="journal-num">№ ${String(i + 1).padStart(2, "0")}</div>
        <div class="journal-title">${p.title}</div>
        <div class="journal-excerpt">${p.excerpt}</div>
        <div class="journal-meta">
          <span>📅 ${formatDate(p.date)}</span>
          <span>${p.tags.slice(0, 3).join(" · ")}</span>
        </div>
      </div>
    </div>`).join("");
}


/* ── 8. openPost shim ───────────────────────────────────── */
function openPost(id) {
  window.location.href = `blog.html?post=${id}`;
}


/* ── 9. INIT ─────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initShared();
  initParticles();
  updateStatPlaces();
  animateStatCounters();
  renderRegions();
  renderJournal();

  // Leaflet measures the container at init time — if called synchronously
  // inside DOMContentLoaded the browser hasn't done layout yet, so the
  // panel has 0×0 size and the map renders blank with zoom controls at 0,0.
  // A double-rAF guarantees we're past the first paint before measuring.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initMap();
    });
  });
});
