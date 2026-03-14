/* ============================================================
   AOTEAROA DIARIES — blog.js
   Loaded after script.js and posts-registry.js on blog.html

   Sections:
   1.  State
   2.  Category sidebar tree
   3.  Filter helpers
   4.  Render posts (grid + list)
   5.  View toggle (grid / list)
   6.  Post detail — open, close, reading progress bar
   7.  Browser history (back/forward button support)
   8.  Page init
   ============================================================ */


/* ── 1. STATE ────────────────────────────────────────────────── */

/* activeFilter controls which posts are shown.
   Examples:
     { type: "all" }
     { type: "island",   value: "south" }
     { type: "region",   value: "Canterbury" }
     { type: "general" }
     { type: "featured" }
*/
let activeFilter = { type: "all", value: null };

/* currentView is either "grid" or "list" */
let currentView  = "grid";

/* openPostId is the ID of the currently displayed post, or null */
let openPostId   = null;

/* postContent is a cache so we don't re-fetch the same post twice */
let postContent  = {};


/* ── 2. CATEGORY SIDEBAR TREE ────────────────────────────────── */

/*
  Builds the sidebar navigation tree dynamically from the POSTS and REGIONS
  data in posts-registry.js. The structure looks like:

    ALL
    SOUTH ISLAND  ˅
      Canterbury (3)
      Otago (2)
      …
    NORTH ISLAND  ˅
      …
    GENERAL
    ⭐ FEATURED
*/
function buildCategoryTree() {
  const tree = document.getElementById("category-tree");
  if (!tree) return;

  /* Helper: returns the number of posts that match a given filter */
  function countFor(filter) {
    return filterPosts(filter).length;
  }

  /* ── ALL ── */
  const allItem     = document.createElement("div");
  allItem.className = "cat-all active";
  allItem.id        = "cat-all";
  allItem.textContent = "All";
  allItem.onclick   = function() {
    setFilter({ type: "all", value: null }, "All Posts");
  };
  tree.appendChild(allItem);

  /* ── SOUTH ISLAND + NORTH ISLAND (with sub-regions) ── */
  ["south", "north"].forEach(function(island) {
    const islandLabel = island === "south" ? "South Island" : "North Island";

    /* Only include regions that have at least one post */
    const regions = REGIONS.filter(function(r) {
      return r.island === island && countFor({ type: "region", value: r.name }) > 0;
    });

    const wrapper = document.createElement("div");

    /* Island header row — clicking toggles the sub-region drawer */
    const header     = document.createElement("div");
    header.className = "cat-island";
    header.id        = "cat-" + island;
    header.innerHTML =
      '<span>' + islandLabel + '</span>' +
      '<i class="fa-solid fa-chevron-down cat-chevron" id="chev-' + island + '"></i>';

    header.onclick = function() {
      /* Toggle the drawer open/closed — do NOT change the active filter */
      const drawer = document.getElementById("sub-" + island);
      const chev   = document.getElementById("chev-" + island);
      if (!drawer) return;

      const isNowOpen = !drawer.classList.contains("open");
      drawer.classList.toggle("open", isNowOpen);
      if (chev) chev.classList.toggle("open", isNowOpen);
    };
    wrapper.appendChild(header);

    /* Sub-region items inside the collapsible drawer */
    const drawer     = document.createElement("div");
    drawer.className = "sub-items";
    drawer.id        = "sub-" + island;

    regions.forEach(function(region) {
      const count   = countFor({ type: "region", value: region.name });
      const row     = document.createElement("div");
      row.className = "sub-item";
      row.id        = "sub-item-" + region.name.replace(/[\s\/]/g, "-");
      row.innerHTML =
        '<span>' + region.name + '</span>' +
        '<span class="cat-count">' + count + '</span>';

      row.onclick = function(e) {
        e.stopPropagation(); /* prevent the click from bubbling up to the island header */
        setFilter(
          { type: "region", value: region.name },
          islandLabel + " › " + region.name
        );
      };
      drawer.appendChild(row);
    });

    wrapper.appendChild(drawer);
    tree.appendChild(wrapper);
  });

  /* ── GENERAL ── */
  const generalItem     = document.createElement("div");
  generalItem.className = "cat-simple";
  generalItem.id        = "cat-general";
  generalItem.innerHTML =
    '<span>General</span>' +
    '<span class="cat-count">' + countFor({ type: "general" }) + '</span>';
  generalItem.onclick   = function() {
    setFilter({ type: "general", value: null }, "General");
  };
  tree.appendChild(generalItem);

  /* ── FEATURED ── */
  const featuredItem     = document.createElement("div");
  featuredItem.className = "cat-simple";
  featuredItem.id        = "cat-featured";
  featuredItem.innerHTML =
    '<span>⭐ Featured</span>' +
    '<span class="cat-count">' + countFor({ type: "featured" }) + '</span>';
  featuredItem.onclick   = function() {
    setFilter({ type: "featured", value: null }, "Featured");
  };
  tree.appendChild(featuredItem);
}

/* Opens or closes an island's sub-region drawer */
function toggleSub(island) {
  const drawer = document.getElementById("sub-" + island);
  const chev   = document.getElementById("chev-" + island);
  if (!drawer) return;

  const isNowOpen = drawer.classList.toggle("open");
  if (chev) chev.classList.toggle("open", isNowOpen);
}

/* Changes the active filter, updates the sidebar highlight, and re-renders posts */
function setFilter(filter, breadcrumbLabel) {
  activeFilter = filter;

  /* Clear all active highlights in the sidebar */
  document.querySelectorAll(".cat-all, .cat-island, .sub-item, .cat-simple")
    .forEach(function(el) { el.classList.remove("active"); });

  /* Apply the highlight to the correct item */
  if (filter.type === "all")      document.getElementById("cat-all")?.classList.add("active");
  if (filter.type === "general")  document.getElementById("cat-general")?.classList.add("active");
  if (filter.type === "featured") document.getElementById("cat-featured")?.classList.add("active");

  if (filter.type === "region") {
    const slug = filter.value.replace(/[\s\/]/g, "-");
    document.getElementById("sub-item-" + slug)?.classList.add("active");

    /* Auto-expand the parent island drawer so the highlighted item is visible */
    const region = REGIONS.find(function(r) { return r.name === filter.value; });
    if (region) {
      const drawer = document.getElementById("sub-" + region.island);
      if (drawer && !drawer.classList.contains("open")) {
        toggleSub(region.island);
      }
    }
  }

  /* Update the breadcrumb text above the post list */
  const breadcrumbEl = document.getElementById("blog-breadcrumb");
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = buildBreadcrumbHTML(filter, breadcrumbLabel);
  }

  renderPosts();
}

/* Returns the HTML for a clickable breadcrumb like "South Island › Canterbury" */
function buildBreadcrumbHTML(filter, label) {
  const parts = label.split(" › ");

  /* Single-part breadcrumb — just show the label */
  if (parts.length === 1) {
    return '<span class="breadcrumb-active">' + label + '</span>';
  }

  /* Multi-part breadcrumb — make each segment except the last clickable */
  return parts.map(function(part, index) {
    if (index < parts.length - 1) {
      const islandKey = part.includes("South") ? "south" : "north";
      return (
        '<span style="cursor:pointer;color:var(--accent)" ' +
          'onclick="setFilter({type:\'island\',value:\'' + islandKey + '\'},\'' + part + '\')">' +
          part +
        '</span>' +
        '<span class="breadcrumb-sep"> › </span>'
      );
    }
    return '<span class="breadcrumb-active">' + part + '</span>';
  }).join("");
}


/* ── 3. FILTER HELPERS ───────────────────────────────────────── */

/* Returns the subset of POSTS that matches the given filter.
   If no filter is provided, uses the current activeFilter. */
function filterPosts(filter) {
  filter = filter || activeFilter;

  switch (filter.type) {
    case "all":      return POSTS;
    case "island":   return POSTS.filter(function(p) { return p.island   === filter.value; });
    case "region":   return POSTS.filter(function(p) { return p.region   === filter.value; });
    case "general":  return POSTS.filter(function(p) { return p.category === "general";    });
    case "featured": return POSTS.filter(function(p) { return p.featured;                 });
    default:         return POSTS;
  }
}


/* ── 4. RENDER POSTS ─────────────────────────────────────────── */

/* Re-renders both the grid and list views with the current filter applied */
function renderPosts() {
  const posts = filterPosts();

  /* Update the "X posts" count above the grid */
  const countEl = document.getElementById("blog-post-count");
  if (countEl) {
    countEl.textContent = posts.length + " post" + (posts.length !== 1 ? "s" : "");
  }

  const emptyMessage = '<p style="color:var(--text3);font-style:italic;padding:20px 0">' +
                       'No posts in this category yet.</p>';

  /* ── Grid view ── */
  const grid = document.getElementById("posts-grid");
  if (grid) {
    if (!posts.length) {
      grid.innerHTML = emptyMessage;
    } else {
      grid.innerHTML = posts.map(function(post) {
        const coverHTML = post.cover
          ? '<img src="' + post.cover + '" alt="' + post.title + '" loading="lazy" ' +
            'onerror="this.parentElement.innerHTML=\'<span style=font-size:52px>' + post.emoji + '</span>\'">'
          : '<span style="font-size:52px">' + post.emoji + '</span>';

        const locationLabel = post.category === "general"
          ? "General"
          : (post.location || post.region || "Location");

        const tagHTML = post.tags.slice(0, 3).map(function(tag) {
          return '<span class="tag">' + tag + '</span>';
        }).join("");

        const featuredTag = post.featured
          ? '<span class="tag accent">⭐ Featured</span>'
          : "";

        return (
          '<div class="post-card" onclick="openPost(\'' + post.id + '\')">' +
            '<div class="post-card-cover">' + coverHTML + '</div>' +
            '<div class="post-card-body">' +
              '<div class="post-card-meta">' +
                '<span class="post-card-date">📅 ' + formatDate(post.date) + '</span>' +
                '<span class="post-card-type">' + locationLabel + '</span>' +
              '</div>' +
              '<div class="post-card-title">' + post.title + '</div>' +
              '<div class="post-card-excerpt">' + post.excerpt + '</div>' +
              '<div class="post-card-tags">' + tagHTML + featuredTag + '</div>' +
            '</div>' +
          '</div>'
        );
      }).join("");
    }
  }

  /* ── List view ── */
  const list = document.getElementById("posts-list");
  if (list) {
    if (!posts.length) {
      list.innerHTML = emptyMessage;
    } else {
      list.innerHTML = posts.map(function(post, index) {
        const thumbHTML = post.cover
          ? '<img src="' + post.cover + '" alt="' + post.title + '" loading="lazy" ' +
            'onerror="this.parentElement.innerHTML=\'<span style=font-size:26px>' + post.emoji + '</span>\'">'
          : '<span style="font-size:26px">' + post.emoji + '</span>';

        const number      = String(index + 1).padStart(2, "0");
        const locationTag = post.location
          ? '<span>📍 ' + post.location + '</span>'
          : "";

        return (
          '<div class="post-list-item" onclick="openPost(\'' + post.id + '\')">' +
            '<div class="post-list-thumb">' + thumbHTML + '</div>' +
            '<div>' +
              '<div class="post-list-num">№ ' + number + '</div>' +
              '<div class="post-list-title">' + post.title + '</div>' +
              '<div class="post-list-excerpt">' + post.excerpt + '</div>' +
              '<div class="post-list-meta">' +
                '<span>📅 ' + formatDate(post.date) + '</span>' +
                locationTag +
                '<span>' + post.tags.slice(0, 3).join(" · ") + '</span>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
      }).join("");
    }
  }
}


/* ── 5. VIEW TOGGLE ──────────────────────────────────────────── */

/* Switches between grid and list view when the user clicks a view button */
function setView(view, clickedBtn) {
  currentView = view;

  /* Hide all panels, then show the one matching the chosen view */
  document.querySelectorAll(".view-panel").forEach(function(panel) {
    panel.classList.remove("active");
  });
  document.getElementById("view-" + view)?.classList.add("active");

  /* Remove the active state from all view buttons, then highlight the clicked one */
  document.querySelectorAll(".view-btn").forEach(function(btn) {
    btn.classList.remove("active");
  });
  clickedBtn.classList.add("active");
}


/* ── 6. POST DETAIL ──────────────────────────────────────────── */

/* Opens and displays a full post by its ID */
async function openPost(id) {
  const post = POSTS.find(function(p) { return p.id === id; });
  if (!post) return;

  openPostId = id;
  history.pushState({ postId: id }, "", "?post=" + id);

  /* Hide the listing view, show the detail container */
  document.getElementById("blog-listing").style.display = "none";
  document.getElementById("blog-header").style.display  = "none";
  const detailEl = document.getElementById("post-detail");
  detailEl.style.display = "block";
  window.scrollTo({ top: 0, behavior: "instant" });

  /* Show a loading placeholder while we fetch the post content */
  detailEl.innerHTML =
    '<div style="padding:120px 40px; text-align:center; color:var(--text3);' +
    ' font-family:var(--font-primary); letter-spacing:2px; text-transform:uppercase; font-size:12px">' +
    'Loading…</div>';

  /* Fetch the post's HTML file (with caching so we don't re-fetch on back navigation) */
  let content = postContent[id];
  if (!content) {
    try {
      const response = await fetch(post.file);
      if (response.ok) {
        const rawHTML  = await response.text();
        const doc      = (new DOMParser()).parseFromString(rawHTML, "text/html");
        const article  = doc.querySelector("article.post-article");
        content        = article ? article.innerHTML : "<p>Post content not found.</p>";
        postContent[id] = content; /* cache for next time */
      } else {
        content = '<p style="color:var(--text3)">Could not load post. (<code>' + post.file + '</code>)</p>';
      }
    } catch (e) {
      content = '<p style="color:var(--text3)">Could not load post file.</p>';
    }
  }

  /* Build prev / next links within the current filter */
  const posts     = filterPosts();
  const postIndex = posts.findIndex(function(p) { return p.id === id; });
  const prevPost  = posts[postIndex - 1] || null;
  const nextPost  = posts[postIndex + 1] || null;

  /* Build the breadcrumb trail for the post hero */
  const islandLabel  = post.island === "south" ? "South Island"
                     : post.island === "north" ? "North Island"
                     : null;

  const islandCrumb = islandLabel
    ? '<span class="breadcrumb-sep"> › </span>' +
      '<span style="cursor:pointer" onclick="closePost();setFilter({type:\'island\',value:\'' +
      post.island + '\'},\'' + islandLabel + '\');renderPosts()">' + islandLabel + '</span>'
    : "";

  const regionCrumb = post.region
    ? '<span class="breadcrumb-sep"> › </span>' +
      '<span style="cursor:pointer" onclick="closePost();setFilter({type:\'region\',value:\'' +
      post.region + '\'},\'' + islandLabel + ' › ' + post.region + '\');renderPosts()">' +
      post.region + '</span>'
    : "";

  const breadcrumbHTML =
    '<span onclick="closePost()" style="cursor:pointer">All Posts</span>' +
    islandCrumb +
    regionCrumb +
    '<span class="breadcrumb-sep"> › </span>' +
    '<span style="opacity:1;color:#fff">' + post.title + '</span>';

  /* Cover image or emoji fallback for the hero banner */
  const heroImgHTML = post.cover
    ? '<img src="' + post.cover + '" alt="' + post.title + '" ' +
      'onerror="this.parentElement.innerHTML=\'<span style=font-size:80px;display:flex;' +
      'align-items:center;justify-content:center;height:100%>' + post.emoji + '</span>\'">'
    : '<span style="font-size:80px;display:flex;align-items:center;justify-content:center;height:100%">' +
      post.emoji + '</span>';

  /* Tag pills overlaid on the hero */
  const tagsHTML = post.tags.map(function(tag) {
    return '<span class="tag" style="background:rgba(255,255,255,0.15);' +
           'border-color:rgba(255,255,255,0.25);color:#fff">' + tag + '</span>';
  }).join("");

  /* Hero meta line */
  const metaHTML =
    '<span>📅 ' + formatDate(post.date) + '</span>' +
    (post.location ? '<span>📍 ' + post.location + '</span>' : "") +
    (post.region   ? '<span>🗺 ' + post.region   + '</span>' : "");

  /* Prev / next navigation cards */
  const prevCard = prevPost
    ? '<div class="post-nav-card" onclick="openPost(\'' + prevPost.id + '\')">' +
      '<div class="post-nav-dir">← Previous</div>' +
      '<div class="post-nav-emoji">' + prevPost.emoji + '</div>' +
      '<div class="post-nav-title">' + prevPost.title + '</div>' +
      '</div>'
    : '<div></div>';

  const nextCard = nextPost
    ? '<div class="post-nav-card post-nav-right" onclick="openPost(\'' + nextPost.id + '\')">' +
      '<div class="post-nav-dir">Next →</div>' +
      '<div class="post-nav-emoji">' + nextPost.emoji + '</div>' +
      '<div class="post-nav-title">' + nextPost.title + '</div>' +
      '</div>'
    : '<div></div>';

  /* Render the full post layout */
  detailEl.innerHTML =
    /* Hero banner */
    '<div class="post-hero">' +
      '<div class="post-hero-img">' + heroImgHTML + '</div>' +
      '<div class="post-hero-overlay"></div>' +
      '<div class="post-hero-content">' +
        '<div class="post-hero-breadcrumb">' + breadcrumbHTML + '</div>' +
        '<div class="post-hero-tags">' + tagsHTML + '</div>' +
        '<h1 class="post-hero-title">' + post.title + '</h1>' +
        '<div class="post-hero-meta">' + metaHTML + '</div>' +
      '</div>' +
    '</div>' +

    /* Post body */
    '<div class="post-body">' +
      '<button class="post-back" onclick="closePost()">← Back to posts</button>' +
      '<div class="post-content">' + content + '</div>' +
      '<nav class="post-nav">' + prevCard + nextCard + '</nav>' +
    '</div>';

  document.getElementById("post-progress")?.classList.add("visible");
}

/* Closes the post detail view and returns to the listing */
function closePost() {
  openPostId = null;
  history.pushState({}, "", "blog.html");

  document.getElementById("blog-listing").style.display = "";
  document.getElementById("blog-header").style.display  = "";
  document.getElementById("post-detail").style.display  = "none";
  document.getElementById("post-progress")?.classList.remove("visible");

  window.scrollTo({ top: 0, behavior: "instant" });
}

/* Updates the reading progress bar at the top of the page as the user scrolls */
window.addEventListener("scroll", function() {
  const contentEl = document.querySelector("#post-detail .post-content");
  const fillEl    = document.getElementById("post-progress-fill");
  if (!contentEl || !fillEl) return;

  const contentTop    = contentEl.getBoundingClientRect().top + window.scrollY;
  const contentHeight = contentEl.offsetHeight;
  // Progress starts at 0 when the content top is at the viewport top,
  // reaches 100 when the content bottom scrolls out of view.
  const scrolled = Math.max(0, window.scrollY - contentTop);
  const percent  = Math.min(100, (scrolled / contentHeight) * 100);

  fillEl.style.width = percent + "%";
}, { passive: true });


/* ── 7. BROWSER HISTORY ──────────────────────────────────────── */

/* Handles the browser back/forward buttons so post URLs work correctly */
window.addEventListener("popstate", function(event) {
  if (event.state && event.state.postId) {
    openPost(event.state.postId);
  } else {
    closePost();
  }
});


/* ── 8. PAGE INIT ────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  initShared();        /* theme, clock, fade-in, visitor counter */
  buildCategoryTree();

  /* Check URL params so direct links and region links work on page load */
  const params      = new URLSearchParams(window.location.search);
  const postParam   = params.get("post");
  const regionParam = params.get("region");

  if (postParam) {
    /* Direct link to a specific post — render the listing first so prev/next work */
    renderPosts();
    openPost(postParam);

  } else if (regionParam) {
    /* Came from a region card on the homepage */
    const region = REGIONS.find(function(r) { return r.name === regionParam; });
    if (region) {
      const islandLabel = region.island === "south" ? "South Island" : "North Island";
      toggleSub(region.island);
      setFilter({ type: "region", value: regionParam }, islandLabel + " › " + regionParam);
    } else {
      renderPosts();
    }

  } else {
    renderPosts();
  }
});
