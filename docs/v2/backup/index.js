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
  localStorage.setItem("nz-explore-tab", id);
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
    center:              [-41.5, 172.5],
    zoom:                6,
    maxBounds:           [[-55, 155], [-30, 190]],
    maxBoundsViscosity:  0.5,
    minZoom:             5,
    maxZoom:             14,
    zoomControl:         window.innerWidth > 768,
    attributionControl:  false,   // removes the © widget — no stray × ever
    scrollWheelZoom:     true,
    dragging:            true,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom:    18,
  }).addTo(nzMap);

  const pinned  = POSTS.filter(p => p.mapLat && p.mapLng);
  const countEl = document.getElementById("map-pin-count");
  if (countEl) countEl.textContent = `${pinned.length} location${pinned.length !== 1 ? "s" : ""} visited`;

  let activeMarker = null;

  // ── Helper: flyTo pin, open popup once map settles ──
  function flyToAndOpen(marker, lat, lng) {
    if (activeMarker && activeMarker !== marker) {
      activeMarker.getElement()?.querySelector(".map-pin-icon")?.classList.remove("pinned");
      activeMarker.closePopup();
    }
    activeMarker = marker;
    marker.getElement()?.querySelector(".map-pin-icon")?.classList.add("pinned");

    nzMap.flyTo([lat, lng], 9, { animate: true, duration: 0.6 });
    // Open popup after map settles so keepInView can pan correctly
    nzMap.once("moveend", function() {
      marker.openPopup();
    });
  }

  // ── Helper: open bottom sheet on mobile ──

  pinned.forEach(post => {
    const icon = L.divIcon({
      html:        `<i class="fa-solid fa-location-dot map-pin-icon"></i>`,
      className:   "",
      iconSize:    [34, 40],
      iconAnchor:  [17, 40],
      popupAnchor: [0, -46],  // popup opens 46px above the pin tip
    });

    const marker = L.marker([post.mapLat, post.mapLng], { icon }).addTo(nzMap);
    const pinEl  = () => marker.getElement()?.querySelector(".map-pin-icon");

    const coverHTML = post.cover
      ? `<div class="popup-img"><img src="${post.cover}" alt="${post.title}" loading="lazy"
           onerror="this.parentElement.innerHTML='<span>${post.emoji}</span>'"></div>`
      : `<div class="popup-img">${post.emoji}</div>`;

    // keepInView:true — Leaflet auto-pans the map so the popup is never out of view
    // autoPan:true + autoPanPadding gives extra breathing room from the map edges
    marker.bindPopup(`
      ${coverHTML}
      <div class="popup-body">
        <div class="popup-title">${post.title}</div>
        <div class="popup-date">📅 ${formatDate(post.date)}</div>
        <div class="popup-desc">${post.excerpt.slice(0, 90)}…</div>
        <a class="popup-link" href="blog.html?post=${post.id}">Read post →</a>
      </div>`, {
      maxWidth:        240,
      keepInView:      true,   // auto-pans so popup is always fully visible
      autoPan:         true,
      autoPanPadding:  [20, 20],
      closeButton:     true,
    });

    // Hover: highlight pin on desktop only (touch devices don't have hover)
    marker.on("mouseover", function() {
      if (isMobile()) return;
      pinEl()?.classList.add("hovered");
    });

    marker.on("mouseout", function() {
      if (isMobile()) return;
      pinEl()?.classList.remove("hovered");
    });

    // Same behaviour on mobile and desktop: flyTo + open popup
    // Second click on active pin zooms back out and closes popup
    marker.on("click", function(e) {
      L.DomEvent.stopPropagation(e);
      if (activeMarker === this) {
        pinEl()?.classList.remove("pinned");
        this.closePopup();
        activeMarker = null;
        nzMap.flyTo([-41.5, 172.5], 6, { animate: true, duration: 0.5 });
      } else {
        flyToAndOpen(this, post.mapLat, post.mapLng);
      }
    });

    marker.on("popupclose", function() {
      if (activeMarker === this) {
        activeMarker = null;
        pinEl()?.classList.remove("pinned");
      }
    });
  });

  nzMap.fitBounds([[-46.8, 166.4], [-34.4, 178.2]], { padding: [20, 20] });
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

  container.innerHTML = posts.map(function(p) {
    /* Thumb: cover image with emoji fallback */
    const thumbHTML = p.cover
      ? '<img src="' + p.cover + '" alt="' + p.title + '" loading="lazy" ' +
        'onerror="this.parentElement.innerHTML=\'<span style=font-size:26px>' + p.emoji + '</span>\'">'
      : '<span style="font-size:26px">' + p.emoji + '</span>';

    /* Location with region fallback */
    const locationHTML = p.location
      ? '<span>📍 ' + p.location + '</span>'
      : p.region
      ? '<span>🗺 ' + p.region + '</span>'
      : '';

    /* Tags — lowercase with underscores, same as blog list */
    const tagHTML = p.tags.slice(0, 3).map(function(t) {
      return '<span class="post-tag-hash">#' + t.toLowerCase().replace(/ /g, '_') + '</span>';
    }).join('');

    const featuredTag = p.featured
      ? '<span class="card-featured-tag">⭐ Featured</span>'
      : '';

    return (
      '<div class="journal-item" onclick="window.location.href=\'blog.html?post=' + p.id + '\'">' +
        '<div class="post-list-thumb">' + thumbHTML + '</div>' +
        '<div class="post-list-content">' +
          '<div class="post-list-meta">' +
            '<span>📅 ' + formatDate(p.date) + '</span>' +
            locationHTML +
          '</div>' +
          '<div class="post-list-title">' + p.title + '</div>' +
          '<div class="post-list-excerpt">' + p.excerpt + '</div>' +
          '<div class="post-card-tags">' + tagHTML + featuredTag + '</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');
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

  // Restore the last explore tab the user had open (defaults to map)
  const savedTab = localStorage.getItem("nz-explore-tab") || "map";
  const savedBtn = document.querySelector(`.explore-tab[onclick*="'${savedTab}'"]`);
  if (savedTab !== "map" && savedBtn) {
    // Non-map tabs can switch synchronously
    setExploreTab(savedTab, savedBtn);
  } else {
    // Map tab: use double-rAF so Leaflet measures a laid-out container
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initMap();
      });
    });
  }
});
