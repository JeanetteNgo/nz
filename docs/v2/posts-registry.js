/*
  posts-registry.js
  Single source of truth for all blog post metadata.
 
  ── CLOUDFLARE R2 IMAGE HOSTING ─────────────────────────────
  Set CDN_BASE to your R2 public bucket URL (or custom domain):
 
    const CDN_BASE = "https://pub-xxxxxxxxxxxx.r2.dev";
 
  Then all cover images resolve automatically.
  Upload via Cloudflare dashboard or:
    wrangler r2 object put nz-blog-assets/images/tongariro.jpg --file ./tongariro.jpg
 
  Leave CDN_BASE as "" to use local paths (for local dev).
  ────────────────────────────────────────────────────────────
 
  HOW TO ADD A NEW POST:
  1. Create posts/your-slug.html (copy _template.html)
  2. Add an entry to POSTS below — fill in all fields
 
  HOW TO STYLE REGION CARDS:
  - Layout/sizing: styles.css → ".region-card", ".region-thumb", ".region-name"
  - Rendered by: index.js → renderRegions()
  - Images: update the `cover` field in REGIONS below
  - Without a cover, falls back to first post cover in that region, then emoji
 
  CATEGORY SYSTEM:
    island:   "north" | "south" | null
    region:   must match a name in REGIONS (or null for general posts)
    category: "location" | "general"
    featured: true → post appears in the homepage Journal list tab
*/


/* ── CDN base — change this one line to switch image hosting ── */
const CDN_BASE = "https://cdn.jeanettengo.com";  // e.g. "https://pub-xxxx.r2.dev"

/* ══ POSTS ══════════════════════════════════════════════════ */
const POSTS = [
  // {
  //   id:       "working-holiday-guide",
  //   title:    "The ultimate guide to the New Zealand Working Holiday Visa for Singaporeans",
  //   date:     "2024-03-13",
  //   category: "general",
  //   island:   null,
  //   region:   null,
  //   location: null,
  //   tags:     ["guide", "visa", "nz", "work holiday"],
  //   emoji:    "📑",
  //   cover:    CDN_BASE + "/images/regions/northland-thumbnail.jpg",
  //   excerpt:  "",
  //   featured: true,
  //   mapLat:   null,
  //   mapLng:   null,
  //   file:     "posts/working-holiday-guide.html"
  // },
   {
    id:       "best-views",
    title:    "Best views in New Zealand",
    date:     "2026-05-14",
    category: "general",
    island:   null,
    region:   null,
    location: null,
    tags:     ["views", "photography", "landscape", "scenery"],
    emoji:    "🌅",
    cover:    CDN_BASE + "/images/south-island/catlins/kaka-point/nugget-point-1.webp",
    excerpt:  "",
    featured: true,
    mapLat:   null,
    mapLng:   null,
    file:     "posts/best-views.html"
  },
  {
    id:       "favourite-hikes",
    title:    "My favourite hikes in New Zealand",
    date:     "2026-05-14",
    category: "general",
    island:   null,
    region:   null,
    location: null,
    tags:     ["hiking", "nature", "outdoors", "recommendations"],
    emoji:    "🥾",
    cover:    CDN_BASE + "/images/south-island/canterbury/ashburton/mount-sunday/mount-sunday-1.webp",
    excerpt:  "A sincere accounting of the best hiking trails I discovered during my time in New Zealand.",
    featured: true,
    mapLat:   null,
    mapLng:   null,
    file:     "posts/favourite-hikes.html"
  },
  {
    id:       "work-haast",
    title:    "Working in a motel at Haast",
    date:     "2024-04-01",
    category: "location",
    island:   "south",
    region:   "West Coast",
    location: "Haast",
    tags:     ["work", "helpX", "housekeeping", "web design"],
    emoji:    "🌧️",
    cover:    CDN_BASE + "/images/south-island/west-coast/haast/work/haast-27.4-1.webp",
    excerpt:  "Three days driving the wettest, most dramatic stretch of road I've ever been on. The West Coast does not compromise.",
    featured: false,
    mapLat:   -43.86,
    mapLng:   169.05,
    file:     "posts/work-haast.html"
  },
  {
    id:       "work-kaiapoi",
    title:    "Working on a family farm in Kaiapoi",
    date:     "2024-09-29",
    category: "location",
    island:   "south",
    region:   "Canterbury",
    location: "Kaiapoi",
    tags:     ["work", "helpX", "farm", "weeding", "harvesting"],
    emoji:    "👩🏻‍🌾",
    cover:    CDN_BASE + "/images/south-island/canterbury/kaiapoi/work-1.webp",
    excerpt:  "Three days driving the wettest, most dramatic stretch of road I've ever been on. The West Coast does not compromise.",
    featured: false,
    mapLat:   -43.3831,
    mapLng:   172.6569,
    file:     "posts/work-kaiapoi.html"
  },
  {
    id:       "tongariro-alpine-crossing",
    title:    "Tongariro Alpine Crossing: walking through Middle Earth",
    date:     "2025-01-30",
    category: "location",
    island:   "north",
    region:   "Manawatū-Whanganui",
    location: "Tongariro National Park",
    tags:     ["hiking", "lotr", "volcanic"],
    emoji:    "🌋",
    cover:    CDN_BASE + "/images/regions/whanganui-thumbnail.jpg",
    excerpt:  "",
    featured: true,
    mapLat:   -39.297,
    mapLng:   175.642,
    file:     "posts/tongariro-crossing.html"
  },
  {
    id:       "wings-over-whales",
    title:    "Wings Over Whales: whale watching in Kaikōura",
    date:     "2024-05-28",
    category: "location",
    island:   "south",
    region:   "Canterbury",
    location: "Kaikōura",
    tags:     ["whales", "wildlife", "activity"],
    emoji:    "🐋",
    cover:    CDN_BASE + "/images/south-island/canterbury/kaikoura/wings-over-whales-thumbnail.jpg",
    excerpt:  "There are very few places where you can watch a sperm whale surface sixty metres away and then look up to see snow-capped mountains. Kaikōura is one of them.",
    featured: true,
    mapLat:   -42.4,
    mapLng:   173.59,
    file:     "posts/wings-over-whales.html"
  },
  {
    id:       "the-nevis-swing",
    title:    "The Nevis Swing",
    date:     "2025-03-09",
    category: "location",
    island:   "south",
    region:   "Otago",
    location: "Queenstown",
    tags:     ["nevis swing", "thrill", "aj hackett", "activity"],
    emoji:    "🫨",
    cover:    CDN_BASE + "/images/south-island/otago/queenstown/nevis-thumbnail.jpg",
    excerpt:  "We went on the big swing! Join us as we voluntarily sign up for a whopping 300m drop into the void.",
    featured: true,
    mapLat:   -45.0308,
    mapLng:   168.6601,
    file:     "posts/nevis-swing.html"
  },
  {
    id:       "auckland-skywalk",
    title:    "The Auckland Skywalk",
    date:     "2024-12-21",
    category: "location",
    island:   "north",
    region:   "Auckland",
    location: "Auckland",
    tags:     ["auckland skywalk", "thrill", "aj hackett", "activity"],
    emoji:    "🫣",
    cover:    CDN_BASE + "/images/north-island/auckland/skywalk/auckland-skywalk-1.webp",
    excerpt:  "They warned me not to spend too long in Auckland. They were right, and also wrong.",
    featured: false,
    mapLat:   -36.8485,
    mapLng:   174.7622,
    file:     "posts/auckland-skywalk.html"
  },
  {
    id:       "christchurch-botanic-gardens",
    title:    "Christchurch Botanic Gardens",
    date:     "2024-03-25",
    category: "location",
    island:   "south",
    region:   "Canterbury",
    location: "Christchurch",
    tags:     ["botanic gardens", "city", "explore"],
    emoji:    "🌸",
    cover:    CDN_BASE + "/images/south-island/canterbury/christchurch/botanic-gardens-thumbnail.jpg",
    excerpt:  "Enjoy a peaceful day out at the Christchurch Botanic Gardens / Hagley Park.",
    featured: false,
    mapLat:   -43.5315,
    mapLng:   172.6197,
    file:     "posts/christchurch-botanic-gardens.html"
  },
  {
    id:       "rotorua-rafting",
    title:    "Rafting down the Kaituna River",
    date:     "2025-01-20",
    category: "location",
    island:   "north",
    region:   "Bay of Plenty",
    location: "Rotorua",
    tags:     ["rafting", "thrill", "activity", "waterfall", "tutea falls"],
    emoji:    "🚣",
    cover:    CDN_BASE + "/images/north-island/bay-of-plenty/rotorua/rafting/kaituna-rafting-1.webp",
    excerpt:  "We rafted down the highest commercially rafted waterfall in the world, the 7m Tutea Falls.",
    featured: false,
    mapLat:   -38.1368,
    mapLng:   176.2497,
    file:     "posts/rotorua-rafting.html"
  },
  {
    id:       "milford-sound",
    title:    "Milford Sound - 8th Wonder of the World?",
    date:     "2024-10-22",
    category: "location",
    island:   "south",
    region:   "Southland",
    location: "Milford Sound / Piopiotahi",
    tags:     ["fiords", "rain", "cruise", "scenery"],
    emoji:    "🌊",
    cover:    CDN_BASE + "/images/south-island/southland/fiordland-national-park/milford-sound-1.webp",
    excerpt:  "Everyone says go on a sunny day. Everyone is wrong. The waterfalls only appear when it rains.",
    featured: true,
    mapLat:   -44.67,
    mapLng:   167.9271,
    file:     "posts/milford-sound.html"
  }
];


/* ══ REGIONS ═════════════════════════════════════════════════
  Displayed as photo-first cards in the homepage "Regions" grid.
  Clicking a card navigates to blog.html?region=<name>.

  `cover` — path to a region hero photo.
    Drop your photo at  assets/images/regions/<slug>.jpg
    and set the cover field here. If omitted, the renderer falls
    back to the first post in the region that has a cover image,
    then to the emoji.

  To match the reference screenshot, the regions below include
  all the regions you have photos for. Add / remove as needed.
════════════════════════════════════════════════════════════ */
const REGIONS = [

  /* ── South Island ── */
  {
    name:      "Canterbury",
    island:    "south",
    emoji:     "🏔️",
    cover: CDN_BASE + "/images/regions/canterbury-thumbnail.jpg",
    desc:      "Mountains, whales & a resilient city",
    locations: ["Christchurch", "Kaikōura", "Hanmer Springs", "Akaroa"]
  },
  {
    name:      "Mackenzie Country",
    island:    "south",
    emoji:     "⭐",
    cover: CDN_BASE + "/images/regions/mackenzie-thumbnail.jpg",
    desc:      "Stargazing, turquoise lakes & lupins",
    locations: ["Lake Tekapo", "Aoraki/Mt Cook", "Twizel"]
  },
  {
    name:      "Nelson-Tasman",
    island:    "south",
    emoji:     "☀️",
    cover: CDN_BASE + "/images/regions/tasman-thumbnail.jpg",
    desc:      "Sunshine, art & national parks",
    locations: ["Nelson", "Abel Tasman", "Golden Bay"]
  },
  {
    name:      "Otago",
    island:    "south",
    emoji:     "🏕️",
    cover: CDN_BASE + "/images/regions/otago-thumbnail.jpg",
    desc:      "Adventure, wine & dramatic fiords",
    locations: ["Queenstown", "Dunedin", "Wānaka", "Arrowtown"]
  },
  {
    name:      "The Catlins",
    island:    "south",
    emoji:     "🌊",
    cover: CDN_BASE + "/images/regions/catlins-thumbnail.jpg",
    desc:      "Waterfalls, sea lions & solitude",
    locations: ["Nugget Point", "Curio Bay", "Papatowai"]
  },
  {
    name:      "West Coast",
    island:    "south",
    emoji:     "🌧️",
    cover: CDN_BASE + "/images/regions/west-coast-thumbnail.jpg",
    desc:      "Wild, wet & gloriously untamed",
    locations: ["Hokitika", "Franz Josef", "Greymouth", "Haast"]
  },
  {
    name:      "Southland",
    island:    "south",
    emoji:     "🦅",
    cover: CDN_BASE + "/images/regions/southland-thumbnail.jpg",
    desc:      "Wild southern edge & fiordland",
    locations: ["Milford Sound", "Invercargill", "Stewart Island"]
  },
  // {
  //   name:      "Marlborough",
  //   island:    "south",
  //   emoji:     "🍷",
  //   cover: CDN_BASE + "/images/regions/marlborough.jpg",
  //   desc:      "Sounds, sunshine & Sauvignon Blanc",
  //   locations: ["Blenheim", "Picton", "Nelson"]
  // },

  /* ── North Island ── */
  {
    name:      "Northland",
    island:    "north",
    emoji:     "🏝️",
    cover: CDN_BASE + "/images/regions/northland-thumbnail.jpg",
    desc:      "Ancient kauri forests & sweeping beaches",
    locations: ["Bay of Islands", "Ninety Mile Beach", "Cape Reinga"]
  },
  {
    name:      "Auckland",
    island:    "north",
    emoji:     "🌆",
    cover: CDN_BASE + "/images/regions/auckland-thumbnail.jpg",
    desc:      "The big smoke & volcanic islands",
    locations: ["Auckland City", "Waiheke Island", "Devonport"]
  },
  {
    name:      "Coromandel",
    island:    "north",
    emoji:     "🏖️",
    cover: CDN_BASE + "/images/regions/coromandel-thumbnail.jpg",
    desc:      "Hot water beach & cathedral cove",
    locations: ["Thames", "Coromandel Town", "Hot Water Beach", "Cathedral Cove"]
  },
  {
    name:      "Bay of Plenty",
    island:    "north",
    emoji:     "🌊",
    cover:      CDN_BASE + "/images/regions/bop-thumbnail.jpg",
    desc:      "Kiwifruit, beaches & White Island",
    locations: ["Tauranga", "Mount Maunganui", "Rotorua"]
  },
  {
    name:      "Waikato",
    island:    "north",
    emoji:     "🌿",
    cover: CDN_BASE + "/images/regions/waikato-thumbnail.jpg",
    desc:      "Hobbits, caves & the mighty Waikato river",
    locations: ["Hobbiton", "Waitomo Caves", "Hamilton"]
  },
  {
    name:      "Manawatū-Whanganui",
    island:    "north",
    emoji:     "🏔️",
    cover: CDN_BASE + "/images/regions/whanganui-thumbnail.jpg",
    desc:      "Volcanic plateau & wild river gorges",
    locations: ["Whanganui", "Palmerston North", "Tongariro National Park"]
  },
  {
    name:      "Wellington",
    island:    "north",
    emoji:     "💨",
    cover: CDN_BASE + "/images/regions/wellington-thumbnail.jpg",
    desc:      "Windy, wonderful capital",
    locations: ["Wellington CBD", "Wairarapa", "Kāpiti Coast"]
  },
];
