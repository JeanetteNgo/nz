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
function buildCategoryTree(targetEl) {
  const tree = targetEl || document.getElementById("category-tree");
  if (!tree) return;

  /* Use a unique prefix so desktop + mobile drawer don't share IDs */
  const pfx = targetEl ? "mob-" : "";

  /* Helper: returns the number of posts that match a given filter */
  function countFor(filter) {
    return filterPosts(filter).length;
  }

  /* ── ALL ── */
  const allItem     = document.createElement("div");
  allItem.className = "cat-all active";
  allItem.id        = pfx + "cat-all";
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
    header.id        = pfx + "cat-" + island;
    header.innerHTML =
      '<span>' + islandLabel + '</span>' +
      '<i class="fa-solid fa-chevron-down cat-chevron" id="' + pfx + 'chev-' + island + '"></i>';

    header.onclick = function() {
      const drawer = document.getElementById(pfx + "sub-" + island);
      const chev   = document.getElementById(pfx + "chev-" + island);
      if (!drawer) return;
      const isNowOpen = !drawer.classList.contains("open");
      drawer.classList.toggle("open", isNowOpen);
      if (chev) chev.classList.toggle("open", isNowOpen);
    };
    wrapper.appendChild(header);

    /* Sub-region items inside the collapsible drawer */
    const drawer     = document.createElement("div");
    drawer.className = "sub-items";
    drawer.id        = pfx + "sub-" + island;

    regions.forEach(function(region) {
      const count   = countFor({ type: "region", value: region.name });
      const row     = document.createElement("div");
      row.className = "sub-item";
      row.id        = pfx + "sub-item-" + region.name.replace(/[\s\/]/g, "-");
      row.innerHTML =
        '<span>' + region.name + '</span>' +
        '<span class="cat-count">' + count + '</span>';

      row.onclick = function(e) {
        e.stopPropagation();
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

  /* ── GENERAL — section header style ── */
  const generalItem     = document.createElement("div");
  generalItem.className = "cat-section-header";
  generalItem.id        = pfx + "cat-general";
  generalItem.innerHTML =
    '<span>General</span>' +
    '<span class="cat-count">' + countFor({ type: "general" }) + '</span>';
  generalItem.onclick   = function() {
    setFilter({ type: "general", value: null }, "General");
  };
  tree.appendChild(generalItem);

  /* ── FEATURED — section header style ── */
  const featuredItem     = document.createElement("div");
  featuredItem.className = "cat-section-header";
  featuredItem.id        = pfx + "cat-featured";
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

  /* Close mobile filter drawer if open */
  closeMobFilter();

  /* Update mobile sticky header row 2 */
  const isFiltered = filter.type !== "all";
  const filterLabel = document.getElementById("mob-browse-filter-label");
  const filterClear = document.getElementById("mob-browse-clear");
  const filterBtn   = document.getElementById("mob-filter-btn");
  if (filterLabel) filterLabel.textContent = isFiltered ? breadcrumbLabel : "All Posts";
  if (filterClear) filterClear.style.display = isFiltered ? "flex" : "none";
  if (filterBtn)   filterBtn.classList.toggle("has-filter", isFiltered);
  /* mob-post-count is updated by renderPosts() below */

  /* Clear all active highlights in both trees */
  document.querySelectorAll(".cat-all, .cat-island, .sub-item, .cat-simple, .cat-section-header")
    .forEach(function(el) { el.classList.remove("active"); });

  /* Apply the highlight to the correct item in BOTH desktop and mobile trees */
  ["", "mob-"].forEach(function(pfx) {
    if (filter.type === "all")      document.getElementById(pfx + "cat-all")?.classList.add("active");
    if (filter.type === "general")  document.getElementById(pfx + "cat-general")?.classList.add("active");
    if (filter.type === "featured") document.getElementById(pfx + "cat-featured")?.classList.add("active");

    if (filter.type === "region") {
      const slug = filter.value.replace(/[\s\/]/g, "-");
      document.getElementById(pfx + "sub-item-" + slug)?.classList.add("active");

      /* Auto-expand the parent island drawer so the highlighted item is visible */
      const region = REGIONS.find(function(r) { return r.name === filter.value; });
      if (region) {
        const drawer = document.getElementById(pfx + "sub-" + region.island);
        if (drawer && !drawer.classList.contains("open")) {
          const chev = document.getElementById(pfx + "chev-" + region.island);
          drawer.classList.add("open");
          if (chev) chev.classList.add("open");
        }
      }
    }
  });

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

  /* Update the "X posts" count above the grid — desktop and mobile */
  const countText = posts.length + " post" + (posts.length !== 1 ? "s" : "");
  const countEl    = document.getElementById("blog-post-count");
  const mobCountEl = document.getElementById("mob-post-count");
  if (countEl)    countEl.textContent    = countText;
  if (mobCountEl) mobCountEl.textContent = "(" + posts.length + ")"; /* bracketed count */

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

        /* Location: emoji inline, no pill */
        var locationHTML = post.location
          ? '<span class="post-card-location">📍 ' + post.location + '</span>'
          : post.region
          ? '<span class="post-card-location">🗺 ' + post.region + '</span>'
          : '';

        var tagHTML = post.tags.slice(0, 3).map(function(tag) {
          return '<span class="post-tag-hash">#' + tag.toLowerCase().replace(/ /g,'_') + '</span>';
        }).join('');

        var featuredTag = post.featured
          ? '<span class="card-featured-tag">⭐ Featured</span>'
          : '';

        return (
          '<div class="post-card" onclick="openPost(\'' + post.id + '\')">' +
            '<div class="post-card-cover">' + coverHTML + '</div>' +
            '<div class="post-card-body">' +
              '<div class="post-card-meta">' +
                '<span class="post-card-date">📅 ' + formatDateShort(post.date) + '</span>' +
                locationHTML +
              '</div>' +
              '<div class="post-card-title">' + post.title + '</div>' +
              '<div class="post-card-excerpt">' + post.excerpt + '</div>' +
              '<div class="post-card-tags">' + tagHTML + featuredTag + '</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');
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

        /* Location with region fallback */
        var listLocationHTML = post.location
          ? '<span>📍 ' + post.location + '</span>'
          : post.region
          ? '<span>🗺 ' + post.region + '</span>'
          : '';

        /* Tags outside .post-list-meta so they stay lowercase */
        var listTagHTML = post.tags.slice(0, 3).map(function(t) {
          return '<span class="post-tag-hash">#' + t.toLowerCase().replace(/ /g,'_') + '</span>';
        }).join('');

        var listFeaturedTag = post.featured
          ? '<span class="card-featured-tag">⭐ Featured</span>'
          : '';

        return (
          '<div class="post-list-item" onclick="openPost(\'' + post.id + '\')">' +
            '<div class="post-list-thumb">' + thumbHTML + '</div>' +
            '<div class="post-list-content">' +
              '<div class="post-list-meta">' +
                '<span>📅 ' + formatDateShort(post.date) + '</span>' +
                listLocationHTML +
              '</div>' +
              '<div class="post-list-title">' + post.title + '</div>' +
              '<div class="post-list-excerpt">' + post.excerpt + '</div>' +
              '<div class="post-card-tags">' + listTagHTML + listFeaturedTag + '</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');
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

  /* Sync ALL view buttons (desktop + mobile bottom bar) */
  document.querySelectorAll(".view-btn, .mob-view-btn").forEach(function(btn) {
    btn.classList.remove("active");
  });
  /* Mark the matching button in each set */
  document.getElementById("btn-" + view)?.classList.add("active");
  document.getElementById("mob-btn-" + view)?.classList.add("active");
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

  /* Build breadcrumb: All › Island › Region › Location › Title */
  const islandLabel = post.island === "south" ? "South Island"
                    : post.island === "north" ? "North Island"
                    : null;

  const islandCrumb = islandLabel
    ? '<span class="breadcrumb-sep"> ›</span> ' +
      '<span class="crumb-link" onclick="closePost();setFilter({type:\'island\',value:\'' +
      post.island + '\'},\'' + islandLabel + '\');renderPosts()">' + islandLabel + '</span>'
    : "";

  const regionCrumb = post.region
    ? '<span class="breadcrumb-sep"> ›</span> ' +
      '<span class="crumb-link" onclick="closePost();setFilter({type:\'region\',value:\'' +
      post.region + '\'},\'' + (islandLabel ? islandLabel + ' › ' : '') + post.region + '\');renderPosts()">' +
      post.region + '</span>'
    : "";

  const titleCrumb =
    '<span class="breadcrumb-sep"> ›</span> ' +
    '<span class="crumb-title">' + post.title + '</span>';

  const breadcrumbHTML =
    '<span class="crumb-link" onclick="closePost()">All</span>' +
    islandCrumb +
    regionCrumb +
    titleCrumb;

  /* Cover image or emoji fallback for the hero banner */
  const heroImgHTML = post.cover
    ? '<img src="' + post.cover + '" alt="' + post.title + '" ' +
      'onerror="this.parentElement.innerHTML=\'<span style=font-size:80px;display:flex;' +
      'align-items:center;justify-content:center;height:100%>' + post.emoji + '</span>\'">'
    : '<span style="font-size:80px;display:flex;align-items:center;justify-content:center;height:100%">' +
      post.emoji + '</span>';

  /* Tag hashtags — simple # prefix text, no pill */
  const tagsHTML = post.tags.map(function(tag) {
    return '<span class="post-tag-hash">#' + tag.toLowerCase().replace(/ /g,'_') + '</span>';
  }).join("");

  /* Meta line: date, location, region — goes ABOVE the title */
  const metaHTML =
    '<span>📅 ' + formatDateShort(post.date) + '</span>' +
    (post.location ? '<span>📍 ' + post.location + '</span>' : "");

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

  /* Populate the sticky breadcrumb bar */
  var crumbBar   = document.getElementById("post-crumb-bar");
  var crumbInner = document.getElementById("post-crumb-inner");
  if (crumbInner) crumbInner.innerHTML = breadcrumbHTML;
  if (crumbBar)   crumbBar.classList.add("visible");

  /* Render the full post layout */
  detailEl.innerHTML =
    /* Hero banner — image only, no text overlay */
    '<div class="post-hero">' +
      '<div class="post-hero-img">' + heroImgHTML + '</div>' +
      '<div class="post-hero-overlay"></div>' +
    '</div>' +

    /* Post body — back button, then post header (meta → title → tags), then content */
    '<div class="post-body">' +
      '<button class="post-back" onclick="closePost()">← Back to posts</button>' +
      '<div class="post-header">' +
        '<div class="post-header-meta">' + metaHTML + '</div>' +
        '<h1 class="post-header-title">' + post.title + '</h1>' +
        '<div class="post-header-tags">' + tagsHTML + '</div>' +
      '</div>' +
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

  var crumbBar = document.getElementById("post-crumb-bar");
  if (crumbBar) crumbBar.classList.remove("visible");

  window.scrollTo({ top: 0, behavior: "instant" });
}

/* Updates the reading progress bar as the user scrolls through the post.
   Uses total page scroll range so 0% = top, 100% = can't scroll further. */
window.addEventListener("scroll", function() {
  const fillEl = document.getElementById("post-progress-fill");
  if (!fillEl || !openPostId) return;

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent    = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
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
  buildCategoryTree(); /* desktop sidebar */

  /* Mirror the category tree into the mobile filter drawer */
  const drawerBody = document.getElementById("mob-filter-body");
  if (drawerBody) buildCategoryTree(drawerBody);

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


/* ── Mobile filter drawer ──────────────────────────────────── */

function openMobFilter() {
  const overlay = document.getElementById("mob-filter-overlay");
  if (!overlay) return;
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeMobFilter() {
  const overlay = document.getElementById("mob-filter-overlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

function clearMobFilter() {
  setFilter({ type: "all", value: null }, "All Posts");
}

/* ── Mobile sticky header: pins below nav when banner scrolls out,
   returns to in-flow when banner comes back into view ── */
(function() {
  var ticking = false;

  function updateStickyHeader() {
    var header  = document.getElementById("mob-sticky-header");
    var spacer  = document.getElementById("mob-sticky-spacer");
    var banner  = document.getElementById("blog-header");
    if (!header || !spacer || !banner) return;

    /* How far the bottom of the banner is from the top of the viewport.
       Negative = banner has scrolled fully above the viewport.
       We pin once the banner bottom passes behind the nav bar. */
    var navH       = parseInt(getComputedStyle(document.documentElement)
                       .getPropertyValue("--nav-h")) || 58;
    var bannerBottom = banner.getBoundingClientRect().bottom;
    var shouldStick  = bannerBottom <= navH;

    if (shouldStick && !header.classList.contains("is-sticky")) {
      /* Pin: fix the header, show spacer with same height to avoid jump */
      spacer.style.height = header.offsetHeight + "px";
      spacer.classList.add("active");
      header.classList.add("is-sticky");
    } else if (!shouldStick && header.classList.contains("is-sticky")) {
      /* Unpin: return header to normal flow, hide spacer */
      header.classList.remove("is-sticky");
      spacer.classList.remove("active");
      spacer.style.height = "";
    }
  }

  window.addEventListener("scroll", function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      updateStickyHeader();
      ticking = false;
    });
  }, { passive: true });

  /* Run once on load in case the page starts mid-scroll */
  updateStickyHeader();
})();
