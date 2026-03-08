/* ============================================================
   blog.js — Blog page JavaScript
   Loaded after script.js and posts-registry.js on blog.html

   Sections:
   1.  State
   2.  Category tree (sidebar)
   3.  Filter helpers
   4.  Render posts (grid + list)
   5.  View toggle
   6.  Post detail — open / close / progress bar
   7.  Browser history
   8.  openPost() global (used by search overlay on this page)
   9.  DOMContentLoaded init
   ============================================================ */


/* ── 1. STATE ────────────────────────────────────────────── */
let activeFilter = { type: "all", value: null };
let currentView  = "grid";
let openPostId   = null;
let postContent  = {};   // cache: postId → HTML string


/* ── 2. CATEGORY TREE (sidebar) ─────────────────────────── */
/*
  Reference design (from screenshot):
    ALL                            ← uppercase small-caps, flat
    SOUTH ISLAND        ˅          ← bold uppercase, chevron, click expands sub-list
      Canterbury (6)               ← indented, highlighted when active
      Otago (4)
      …
    NORTH ISLAND        ˅
      …
    GENERAL                        ← flat
    ⭐ FEATURED                    ← flat
*/
function buildCategoryTree() {
  const tree = document.getElementById("category-tree");
  if (!tree) return;

  function countFor(filter) { return filterPosts(filter).length; }

  /* ── ALL ── */
  const allEl = document.createElement("div");
  allEl.className = "cat-all active";
  allEl.id = "cat-all";
  allEl.textContent = "All";
  allEl.onclick = () => setFilter({ type: "all", value: null }, "All Posts");
  tree.appendChild(allEl);

  /* ── ISLANDS + SUB-REGIONS ── */
  ["south", "north"].forEach(island => {
    const label   = island === "south" ? "South Island" : "North Island";
    const regions = REGIONS.filter(r => r.island === island && countFor({ type: "region", value: r.name }) > 0);
    const total   = countFor({ type: "island", value: island });

    const wrap = document.createElement("div");

    /* Island header row */
    const header = document.createElement("div");
    header.className = "cat-island";
    header.id        = `cat-${island}`;
    header.innerHTML = `
      <span>${label}</span>
      <span style="display:flex;align-items:center;gap:6px">
        <span class="cat-count" id="count-${island}">${total}</span>
        <i class="fa-solid fa-chevron-down cat-chevron" id="chev-${island}"></i>
      </span>`;
    header.onclick = () => {
      // setFilter handles opening the sub-list via toggleSub internally
      setFilter({ type: "island", value: island }, label);
    };
    wrap.appendChild(header);

    /* Sub-region items */
    const sub = document.createElement("div");
    sub.className = "sub-items";
    sub.id        = `sub-${island}`;
    regions.forEach(region => {
      const rc  = countFor({ type: "region", value: region.name });
      const row = document.createElement("div");
      row.className = "sub-item";
      row.id        = `sub-item-${region.name.replace(/[\s\/]/g, "-")}`;
      row.innerHTML = `<span>${region.name}</span><span class="cat-count">${rc}</span>`;
      row.onclick = e => {
        e.stopPropagation();
        setFilter({ type: "region", value: region.name }, `${label} › ${region.name}`);
      };
      sub.appendChild(row);
    });
    wrap.appendChild(sub);
    tree.appendChild(wrap);
  });

  /* ── GENERAL ── */
  const genEl = document.createElement("div");
  genEl.className = "cat-simple";
  genEl.id        = "cat-general";
  genEl.innerHTML = `<span>General</span><span class="cat-count">${countFor({ type: "general" })}</span>`;
  genEl.onclick   = () => setFilter({ type: "general", value: null }, "General");
  tree.appendChild(genEl);

  /* ── FEATURED ── */
  const featEl = document.createElement("div");
  featEl.className = "cat-simple";
  featEl.id        = "cat-featured";
  featEl.innerHTML = `<span>⭐ Featured</span><span class="cat-count">${countFor({ type: "featured" })}</span>`;
  featEl.onclick   = () => setFilter({ type: "featured", value: null }, "Featured");
  tree.appendChild(featEl);
}

/* Expand / collapse island sub-list */
function toggleSub(island) {
  const sub  = document.getElementById(`sub-${island}`);
  const chev = document.getElementById(`chev-${island}`);
  if (!sub) return;
  const open = sub.classList.toggle("open");
  if (chev) chev.classList.toggle("open", open);
}

/* Update active states and breadcrumb, then re-render */
function setFilter(filter, breadcrumb) {
  activeFilter = filter;

  // Clear all active states across tree elements
  document.querySelectorAll(".cat-all, .cat-island, .sub-item, .cat-simple")
    .forEach(el => el.classList.remove("active"));

  if (filter.type === "all")      document.getElementById("cat-all")?.classList.add("active");
  if (filter.type === "general")  document.getElementById("cat-general")?.classList.add("active");
  if (filter.type === "featured") document.getElementById("cat-featured")?.classList.add("active");

  if (filter.type === "island") {
    document.getElementById(`cat-${filter.value}`)?.classList.add("active");
    // Always open the sub-list when filtering by island
    const sub  = document.getElementById(`sub-${filter.value}`);
    const chev = document.getElementById(`chev-${filter.value}`);
    if (sub)  sub.classList.add("open");
    if (chev) chev.classList.add("open");
  }

  if (filter.type === "region") {
    const slug = filter.value.replace(/[\s\/]/g, "-");
    document.getElementById(`sub-item-${slug}`)?.classList.add("active");
    // Auto-open parent island
    const region = REGIONS.find(r => r.name === filter.value);
    if (region) {
      const sub = document.getElementById(`sub-${region.island}`);
      if (sub && !sub.classList.contains("open")) toggleSub(region.island);
    }
  }

  // Update breadcrumb display
  const bc = document.getElementById("blog-breadcrumb");
  if (bc) bc.innerHTML = buildBreadcrumbHTML(filter, breadcrumb);

  renderPosts();
}

/* Build clickable breadcrumb HTML from a label like "South Island › Canterbury" */
function buildBreadcrumbHTML(filter, label) {
  const parts = label.split(" › ");
  if (parts.length === 1) {
    return `<span class="breadcrumb-active">${label}</span>`;
  }
  return parts.map((p, i) => {
    if (i < parts.length - 1) {
      const islandKey = p.includes("South") ? "south" : "north";
      return `<span style="cursor:pointer;color:var(--accent)" onclick="setFilter({type:'island',value:'${islandKey}'},'${p}')">${p}</span><span class="breadcrumb-sep"> › </span>`;
    }
    return `<span class="breadcrumb-active">${p}</span>`;
  }).join("");
}


/* ── 3. FILTER HELPERS ───────────────────────────────────── */
function filterPosts(filter) {
  filter = filter || activeFilter;
  switch (filter.type) {
    case "all":      return POSTS;
    case "island":   return POSTS.filter(p => p.island === filter.value);
    case "region":   return POSTS.filter(p => p.region === filter.value);
    case "general":  return POSTS.filter(p => p.category === "general");
    case "featured": return POSTS.filter(p => p.featured);
    default:         return POSTS;
  }
}


/* ── 4. RENDER POSTS ─────────────────────────────────────── */
function renderPosts() {
  const posts = filterPosts();
  const countEl = document.getElementById("blog-post-count");
  if (countEl) countEl.textContent = `${posts.length} post${posts.length !== 1 ? "s" : ""}`;

  /* Grid view */
  const grid = document.getElementById("posts-grid");
  if (grid) {
    if (!posts.length) {
      grid.innerHTML = `<p style="color:var(--text3);font-style:italic;padding:20px 0">No posts in this category yet.</p>`;
    } else {
      grid.innerHTML = posts.map(p => `
        <div class="post-card" onclick="openPost('${p.id}')">
          <div class="post-card-cover">
            ${p.cover
              ? `<img src="${p.cover}" alt="${p.title}" loading="lazy" onerror="this.parentElement.innerHTML='<span style=font-size:52px>${p.emoji}</span>'">`
              : `<span style="font-size:52px">${p.emoji}</span>`}
          </div>
          <div class="post-card-body">
            <div class="post-card-meta">
              <span class="post-card-date">📅 ${formatDate(p.date)}</span>
              <span class="post-card-type">${p.category === "general" ? "General" : (p.location || p.region || "Location")}</span>
            </div>
            <div class="post-card-title">${p.title}</div>
            <div class="post-card-excerpt">${p.excerpt}</div>
            <div class="post-card-tags">
              ${p.tags.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join("")}
              ${p.featured ? `<span class="tag accent">⭐ Featured</span>` : ""}
            </div>
          </div>
        </div>`).join("");
    }
  }

  /* List view */
  const list = document.getElementById("posts-list");
  if (list) {
    if (!posts.length) {
      list.innerHTML = `<p style="color:var(--text3);font-style:italic;padding:20px 0">No posts in this category yet.</p>`;
    } else {
      list.innerHTML = posts.map((p, i) => `
        <div class="post-list-item" onclick="openPost('${p.id}')">
          <div class="post-list-thumb">
            ${p.cover
              ? `<img src="${p.cover}" alt="${p.title}" loading="lazy" onerror="this.parentElement.innerHTML='<span style=font-size:26px>${p.emoji}</span>'">`
              : `<span style="font-size:26px">${p.emoji}</span>`}
          </div>
          <div>
            <div class="post-list-num">№ ${String(i + 1).padStart(2, "0")}</div>
            <div class="post-list-title">${p.title}</div>
            <div class="post-list-excerpt">${p.excerpt}</div>
            <div class="post-list-meta">
              <span>📅 ${formatDate(p.date)}</span>
              ${p.location ? `<span>📍 ${p.location}</span>` : ""}
              <span>${p.tags.slice(0, 3).join(" · ")}</span>
            </div>
          </div>
        </div>`).join("");
    }
  }
}


/* ── 5. VIEW TOGGLE ──────────────────────────────────────── */
function setView(view, btn) {
  currentView = view;
  document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("view-" + view)?.classList.add("active");
  btn.classList.add("active");
}


/* ── 6. POST DETAIL ──────────────────────────────────────── */
async function openPost(id) {
  const post = POSTS.find(p => p.id === id);
  if (!post) return;
  openPostId = id;

  history.pushState({ postId: id }, "", `?post=${id}`);

  // Hide listing, show detail
  document.getElementById("blog-listing").style.display = "none";
  document.getElementById("blog-header").style.display  = "none";
  const detail = document.getElementById("post-detail");
  detail.style.display = "block";
  window.scrollTo({ top: 0, behavior: "instant" });

  // Loading state
  detail.innerHTML = `
    <div style="padding:120px 40px;text-align:center;color:var(--text3);
      font-family:var(--font-primary);letter-spacing:2px;text-transform:uppercase;font-size:12px">
      Loading…
    </div>`;

  // Fetch post content (with cache)
  let content = postContent[id];
  if (!content) {
    try {
      const res = await fetch(post.file);
      if (res.ok) {
        const html  = await res.text();
        const doc   = (new DOMParser()).parseFromString(html, "text/html");
        const artEl = doc.querySelector("article.post-article");
        content = artEl ? artEl.innerHTML : "<p>Post content not found.</p>";
        postContent[id] = content; // cache
      } else {
        content = `<p style="color:var(--text3)">Could not load post. (<code>${post.file}</code>)</p>`;
      }
    } catch(e) {
      content = `<p style="color:var(--text3)">Could not load post file.</p>`;
    }
  }

  // Prev / next within current filter
  const posts = filterPosts();
  const idx   = posts.findIndex(p => p.id === id);
  const prev  = posts[idx - 1] || null;
  const next  = posts[idx + 1] || null;

  // Breadcrumb segments for the hero
  const islandLabel = post.island === "south" ? "South Island" : post.island === "north" ? "North Island" : null;
  const breadcrumbHTML = `
    <span onclick="closePost()" style="cursor:pointer">All Posts</span>
    ${islandLabel ? `
      <span class="breadcrumb-sep"> › </span>
      <span style="cursor:pointer" onclick="closePost();setFilter({type:'island',value:'${post.island}'},'${islandLabel}');renderPosts()">${islandLabel}</span>` : ""}
    ${post.region ? `
      <span class="breadcrumb-sep"> › </span>
      <span style="cursor:pointer" onclick="closePost();setFilter({type:'region',value:'${post.region}'},'${islandLabel} › ${post.region}');renderPosts()">${post.region}</span>` : ""}
    <span class="breadcrumb-sep"> › </span>
    <span style="opacity:1;color:#fff">${post.title}</span>`;

  detail.innerHTML = `
    <!-- Hero banner -->
    <div class="post-hero">
      <div class="post-hero-img">
        ${post.cover
          ? `<img src="${post.cover}" alt="${post.title}" onerror="this.parentElement.innerHTML='<span style=font-size:80px;display:flex;align-items:center;justify-content:center;height:100%>${post.emoji}</span>'">`
          : `<span style="font-size:80px;display:flex;align-items:center;justify-content:center;height:100%">${post.emoji}</span>`}
      </div>
      <div class="post-hero-overlay"></div>
      <div class="post-hero-content">
        <div class="post-hero-breadcrumb">${breadcrumbHTML}</div>
        <div class="post-hero-tags">
          ${post.tags.map(t => `<span class="tag" style="background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.25);color:#fff">${t}</span>`).join("")}
        </div>
        <h1 class="post-hero-title">${post.title}</h1>
        <div class="post-hero-meta">
          <span>📅 ${formatDate(post.date)}</span>
          ${post.location ? `<span>📍 ${post.location}</span>` : ""}
          ${post.region   ? `<span>🗺 ${post.region}</span>`   : ""}
        </div>
      </div>
    </div>

    <!-- Post body -->
    <div class="post-body">
      <button class="post-back" onclick="closePost()">← Back to posts</button>
      <div class="post-content">${content}</div>

      <!-- Prev / Next navigation -->
      <nav class="post-nav">
        ${prev
          ? `<div class="post-nav-card" onclick="openPost('${prev.id}')">
               <div class="post-nav-dir">← Previous</div>
               <div class="post-nav-emoji">${prev.emoji}</div>
               <div class="post-nav-title">${prev.title}</div>
             </div>`
          : `<div></div>`}
        ${next
          ? `<div class="post-nav-card post-nav-right" onclick="openPost('${next.id}')">
               <div class="post-nav-dir">Next →</div>
               <div class="post-nav-emoji">${next.emoji}</div>
               <div class="post-nav-title">${next.title}</div>
             </div>`
          : `<div></div>`}
      </nav>
    </div>`;

  document.getElementById("post-progress")?.classList.add("visible");
}

function closePost() {
  openPostId = null;
  history.pushState({}, "", "blog.html");
  document.getElementById("blog-listing").style.display = "";
  document.getElementById("blog-header").style.display  = "";
  document.getElementById("post-detail").style.display  = "none";
  document.getElementById("post-progress")?.classList.remove("visible");
  window.scrollTo({ top: 0, behavior: "instant" });
}

/* Reading progress bar — updates on scroll while post is open */
window.addEventListener("scroll", () => {
  const content = document.querySelector("#post-detail .post-content");
  const fill    = document.getElementById("post-progress-fill");
  if (!content || !fill) return;
  const top  = content.getBoundingClientRect().top + window.scrollY;
  const h    = content.offsetHeight;
  const pct  = Math.min(100, Math.max(0, ((window.scrollY - top + window.innerHeight) / h) * 100));
  fill.style.width = pct + "%";
}, { passive: true });


/* ── 7. BROWSER HISTORY ──────────────────────────────────── */
window.addEventListener("popstate", e => {
  if (e.state && e.state.postId) {
    openPost(e.state.postId);
  } else {
    closePost();
  }
});


/* ── 8. openPost global (used by search overlay) ─────────── */
// openPost is already defined above — script.js's renderSearchResults calls it.


/* ── 9. INIT ─────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initShared();        // theme, clock, fade-in, visitor counter, cluster reveal
  buildCategoryTree();

  // Check URL params on load
  const params      = new URLSearchParams(window.location.search);
  const postParam   = params.get("post");
  const regionParam = params.get("region");

  if (postParam) {
    // Direct link to a post
    renderPosts();  // render listing first so prev/next work
    openPost(postParam);
  } else if (regionParam) {
    // Navigated from region card on homepage
    const region = REGIONS.find(r => r.name === regionParam);
    if (region) {
      const islandLabel = region.island === "south" ? "South Island" : "North Island";
      toggleSub(region.island);
      setFilter({ type: "region", value: regionParam }, `${islandLabel} › ${regionParam}`);
    } else {
      renderPosts();
    }
  } else {
    renderPosts();
  }
});
