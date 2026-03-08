/*
  posts-registry.js
  ──────────────────
  Single source of truth for all blog post metadata.
  Loaded by every page that needs post data.

  HOW TO ADD A NEW POST:
  1. Create  posts/your-slug.html  (copy posts/_template.html as a starting point)
  2. Add an entry to POSTS below — fill in all fields
  3. Done! The blog page, map, search, and homepage all update automatically.

  HOW TO ADD A REGION PHOTO:
  1. Drop the photo in  assets/images/regions/<region-slug>.jpg
  2. Add/update the `cover` field in the matching REGIONS entry below

  CATEGORY SYSTEM:
    island:   "north" | "south" | null
    region:   must match a name in REGIONS (or null for general posts)
    category: "location" | "general"
    featured: true → appears in the "Featured" filter + homepage Journal list
*/


/* ══ POSTS ══════════════════════════════════════════════════ */
const POSTS = [
  {
    id:       "tongariro-crossing",
    title:    "Tongariro: Walking Through Middle-Earth",
    date:     "2024-02-18",
    category: "location",
    island:   "north",
    region:   "Waikato / Bay of Plenty",
    location: "Tongariro National Park",
    tags:     ["hiking", "volcanic", "UNESCO", "day walk"],
    emoji:    "🌋",
    cover:    "assets/images/tongariro.jpg",
    excerpt:  "Nineteen kilometres across an alien landscape of craters, emerald lakes and lava fields. The Crossing earns every superlative.",
    featured: true,
    mapLat:   -39.297,
    mapLng:   175.642,
    file:     "posts/tongariro-crossing.html"
  },
  {
    id:       "kaikoura-whales",
    title:    "Kaikōura: Where Mountains Meet the Sea",
    date:     "2024-04-03",
    category: "location",
    island:   "south",
    region:   "Canterbury",
    location: "Kaikōura",
    tags:     ["wildlife", "whales", "ocean", "mountains"],
    emoji:    "🐋",
    cover:    "assets/images/kaikoura.jpg",
    excerpt:  "The drive up the Kaikōura coast — mountain on one side, Pacific on the other — is among the most quietly dramatic roads I've ever travelled.",
    featured: true,
    mapLat:   -42.4,
    mapLng:   173.68,
    file:     "posts/kaikoura-whales.html"
  },
  {
    id:       "queenstown-nevis",
    title:    "Queenstown: Jumping Off the Nevis",
    date:     "2024-05-12",
    category: "location",
    island:   "south",
    region:   "Otago",
    location: "Queenstown",
    tags:     ["adventure", "bungee", "mountains", "Remarkables"],
    emoji:    "🏔️",
    cover:    "assets/images/queenstown.jpg",
    excerpt:  "Every cliché about Queenstown is true. None of them fully capture it.",
    featured: true,
    mapLat:   -45.0312,
    mapLng:   168.6626,
    file:     "posts/queenstown-nevis.html"
  },
  {
    id:       "auckland-arrival",
    title:    "Auckland: The City You Leave Too Quickly",
    date:     "2024-01-16",
    category: "location",
    island:   "north",
    region:   "Auckland",
    location: "Auckland",
    tags:     ["city", "arrival", "harbour", "Waiheke"],
    emoji:    "🌆",
    cover:    "assets/images/auckland.jpg",
    excerpt:  "They warned me not to spend too long in Auckland. They were right, and also wrong.",
    featured: false,
    mapLat:   -36.8509,
    mapLng:   174.7645,
    file:     "posts/auckland-arrival.html"
  },
  {
    id:       "christchurch-rising",
    title:    "Christchurch: The City Still Rising",
    date:     "2024-03-22",
    category: "location",
    island:   "south",
    region:   "Canterbury",
    location: "Christchurch",
    tags:     ["city", "resilience", "street art", "gardens"],
    emoji:    "🌸",
    cover:    "assets/images/christchurch.jpg",
    excerpt:  "Fourteen years after the earthquake, Christchurch is still mid-sentence. That's what makes it so interesting.",
    featured: false,
    mapLat:   -43.5321,
    mapLng:   172.6362,
    file:     "posts/christchurch-rising.html"
  },
  {
    id:       "rotorua-geothermal",
    title:    "Rotorua: Heat, Sulphur and the Hāngī",
    date:     "2024-02-05",
    category: "location",
    island:   "north",
    region:   "Waikato / Bay of Plenty",
    location: "Rotorua",
    tags:     ["geothermal", "Māori culture", "hāngī", "mud pools"],
    emoji:    "♨️",
    cover:    "assets/images/rotorua.jpg",
    excerpt:  "The smell hits you before the city does. Then you stop noticing it — until you leave.",
    featured: false,
    mapLat:   -38.1368,
    mapLng:   176.2497,
    file:     "posts/rotorua-geothermal.html"
  },
  {
    id:       "milford-sound",
    title:    "Milford Sound: Rain Makes It Better",
    date:     "2024-06-08",
    category: "location",
    island:   "south",
    region:   "Southland",
    location: "Milford Sound / Piopiotahi",
    tags:     ["fiords", "rain", "cruise", "scenery"],
    emoji:    "🌊",
    cover:    "assets/images/milford.jpg",
    excerpt:  "Everyone says go on a sunny day. Everyone is wrong. The waterfalls only appear when it rains.",
    featured: true,
    mapLat:   -44.6411,
    mapLng:   167.9271,
    file:     "posts/milford-sound.html"
  },
  {
    id:       "west-coast-drive",
    title:    "The West Coast: New Zealand's Wild Side",
    date:     "2024-07-14",
    category: "location",
    island:   "south",
    region:   "West Coast",
    location: "West Coast",
    tags:     ["road trip", "glaciers", "rain forest", "wild"],
    emoji:    "🌧️",
    cover:    "assets/images/westcoast.jpg",
    excerpt:  "Three days driving the wettest, most dramatic stretch of road I've ever been on. The West Coast does not compromise.",
    featured: false,
    mapLat:   -43.2,
    mapLng:   170.6,
    file:     "posts/west-coast-drive.html"
  },
  {
    id:       "working-holiday-guide",
    title:    "Working Holiday NZ: The Honest Guide",
    date:     "2024-08-20",
    category: "general",
    island:   null,
    region:   null,
    location: null,
    tags:     ["visa", "practical", "money", "work"],
    emoji:    "📋",
    cover:    null,
    excerpt:  "The practical realities of a New Zealand working holiday — money, work, accommodation, and the things no one warns you about.",
    featured: true,
    mapLat:   null,
    mapLng:   null,
    file:     "posts/working-holiday-guide.html"
  },
  {
    id:       "best-sunsets",
    title:    "New Zealand's Best Sunsets, Ranked",
    date:     "2024-09-22",
    category: "general",
    island:   null,
    region:   null,
    location: null,
    tags:     ["photography", "lists", "landscape", "golden hour"],
    emoji:    "🌅",
    cover:    null,
    excerpt:  "A completely subjective ranking of the best places I watched the sun go down this year.",
    featured: false,
    mapLat:   null,
    mapLng:   null,
    file:     "posts/best-sunsets.html"
  },
  {
    id:       "nz-food",
    title:    "Favourite Foods from a Year in Aotearoa",
    date:     "2024-11-10",
    category: "general",
    island:   null,
    region:   null,
    location: null,
    tags:     ["food", "culture", "flat white", "recommendations"],
    emoji:    "🥧",
    cover:    null,
    excerpt:  "A sincere accounting of the best things I ate during twelve months in New Zealand.",
    featured: false,
    mapLat:   null,
    mapLng:   null,
    file:     "posts/nz-food.html"
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
    cover:     "assets/images/regions/canterbury.jpg",
    desc:      "Mountains, whales & a resilient city",
    locations: ["Christchurch", "Kaikōura", "Hanmer Springs", "Akaroa"]
  },
  {
    name:      "Nelson",
    island:    "south",
    emoji:     "☀️",
    cover:     "assets/images/regions/nelson.jpg",
    desc:      "Sunshine, art & national parks",
    locations: ["Nelson", "Abel Tasman", "Golden Bay"]
  },
  {
    name:      "Mackenzie Country",
    island:    "south",
    emoji:     "⭐",
    cover:     "assets/images/regions/mackenzie.jpg",
    desc:      "Stargazing, turquoise lakes & lupins",
    locations: ["Lake Tekapo", "Aoraki/Mt Cook", "Twizel"]
  },
  {
    name:      "Otago",
    island:    "south",
    emoji:     "🏕️",
    cover:     "assets/images/regions/otago.jpg",
    desc:      "Adventure, wine & dramatic fiords",
    locations: ["Queenstown", "Dunedin", "Wānaka", "Arrowtown"]
  },
  {
    name:      "The Catlins",
    island:    "south",
    emoji:     "🌊",
    cover:     "assets/images/regions/catlins.jpg",
    desc:      "Waterfalls, sea lions & solitude",
    locations: ["Nugget Point", "Curio Bay", "Papatowai"]
  },
  {
    name:      "West Coast",
    island:    "south",
    emoji:     "🌧️",
    cover:     "assets/images/regions/westcoast.jpg",
    desc:      "Wild, wet & gloriously untamed",
    locations: ["Hokitika", "Franz Josef", "Greymouth", "Haast"]
  },
  {
    name:      "Southland",
    island:    "south",
    emoji:     "🦅",
    cover:     "assets/images/regions/southland.jpg",
    desc:      "Wild southern edge & fiordland",
    locations: ["Milford Sound", "Invercargill", "Stewart Island"]
  },
  {
    name:      "Marlborough",
    island:    "south",
    emoji:     "🍷",
    cover:     "assets/images/regions/marlborough.jpg",
    desc:      "Sounds, sunshine & Sauvignon Blanc",
    locations: ["Blenheim", "Picton", "Nelson"]
  },

  /* ── North Island ── */
  {
    name:      "Northland",
    island:    "north",
    emoji:     "🏝️",
    cover:     "assets/images/regions/northland.jpg",
    desc:      "Ancient kauri forests & sweeping beaches",
    locations: ["Bay of Islands", "Ninety Mile Beach", "Cape Reinga"]
  },
  {
    name:      "Auckland",
    island:    "north",
    emoji:     "🌆",
    cover:     "assets/images/regions/auckland.jpg",
    desc:      "The big smoke & volcanic islands",
    locations: ["Auckland City", "Waiheke Island", "Devonport"]
  },
  {
    name:      "Coromandel",
    island:    "north",
    emoji:     "🏖️",
    cover:     "assets/images/regions/coromandel.jpg",
    desc:      "Hot water beach & cathedral cove",
    locations: ["Thames", "Coromandel Town", "Hot Water Beach", "Cathedral Cove"]
  },
  {
    name:      "Bay of Plenty",
    island:    "north",
    emoji:     "🌊",
    cover:     "assets/images/regions/bayofplenty.jpg",
    desc:      "Kiwifruit, beaches & White Island",
    locations: ["Tauranga", "Mount Maunganui", "Whakatāne"]
  },
  {
    name:      "Waikato",
    island:    "north",
    emoji:     "🌿",
    cover:     "assets/images/regions/waikato.jpg",
    desc:      "Hobbits, caves & the mighty Waikato river",
    locations: ["Hobbiton", "Waitomo Caves", "Hamilton"]
  },
  {
    name:      "Waikato / Bay of Plenty",
    island:    "north",
    emoji:     "🌋",
    cover:     "assets/images/regions/tongariro.jpg",
    desc:      "Hobbits, hot springs & volcanoes",
    locations: ["Tongariro", "Rotorua", "Hamilton", "Taupo"]
  },
  {
    name:      "Manawatū-Whanganui",
    island:    "north",
    emoji:     "🏔️",
    cover:     "assets/images/regions/manawatu.jpg",
    desc:      "Volcanic plateau & wild river gorges",
    locations: ["Whanganui", "Palmerston North", "Tongariro National Park"]
  },
  {
    name:      "Wellington",
    island:    "north",
    emoji:     "💨",
    cover:     "assets/images/regions/wellington.jpg",
    desc:      "Windy, wonderful capital",
    locations: ["Wellington CBD", "Wairarapa", "Kāpiti Coast"]
  },
];


/* ══ FEATURED_LIST ═══════════════════════════════════════════
  Controls which posts appear in the homepage Journal (list) tab.
  Edit this array to curate. Uses post id strings.
════════════════════════════════════════════════════════════ */
const FEATURED_LIST = [
  "working-holiday-guide",
  "best-sunsets",
  "nz-food",
  "tongariro-crossing",
  "kaikoura-whales"
];
