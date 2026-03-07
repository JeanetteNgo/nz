/*
  posts-registry.js
  ──────────────────
  The single source of truth for all blog post metadata.
  Loaded by every page that needs post data.

  HOW TO ADD A NEW POST:
  1. Create  posts/your-slug.html  (copy posts/_template.html as starting point)
  2. Add an entry below — fill in all fields
  3. Done! The blog page, map, search, and homepage all update automatically.

  CATEGORY SYSTEM:
    island:   "north" | "south" | null
    region:   must match a name in REGIONS array below (or null for general posts)
    category: "location" | "general"
    featured: true → appears in "Featured" filter + homepage list view
*/

const POSTS = [
  {
    id: "tongariro-crossing",
    title: "Tongariro: Walking Through Middle-Earth",
    date: "2024-02-18",
    category: "location",
    island: "north",
    region: "Waikato / Bay of Plenty",
    location: "Tongariro National Park",
    tags: ["hiking", "volcanic", "UNESCO", "day walk"],
    emoji: "🌋",
    cover: "assets/images/tongariro.jpg",
    excerpt: "Nineteen kilometres across an alien landscape of craters, emerald lakes and lava fields. The Crossing earns every superlative.",
    featured: true,
    mapLat: -39.297,
    mapLng: 175.642,
    file: "posts/tongariro-crossing.html"
  },
  {
    id: "kaikoura-whales",
    title: "Kaikōura: Where Mountains Meet the Sea",
    date: "2024-04-03",
    category: "location",
    island: "south",
    region: "Canterbury",
    location: "Kaikōura",
    tags: ["wildlife", "whales", "ocean", "mountains"],
    emoji: "🐋",
    cover: "assets/images/kaikoura.jpg",
    excerpt: "The drive up the Kaikōura coast — mountain on one side, Pacific on the other — is among the most quietly dramatic roads I've ever travelled.",
    featured: true,
    mapLat: -42.4,
    mapLng: 173.68,
    file: "posts/kaikoura-whales.html"
  },
  {
    id: "queenstown-nevis",
    title: "Queenstown: Jumping Off the Nevis",
    date: "2024-05-12",
    category: "location",
    island: "south",
    region: "Otago",
    location: "Queenstown",
    tags: ["adventure", "bungee", "mountains", "Remarkables"],
    emoji: "🏔️",
    cover: "assets/images/queenstown.jpg",
    excerpt: "Every cliché about Queenstown is true. None of them fully capture it.",
    featured: true,
    mapLat: -45.0312,
    mapLng: 168.6626,
    file: "posts/queenstown-nevis.html"
  },
  {
    id: "auckland-arrival",
    title: "Auckland: The City You Leave Too Quickly",
    date: "2024-01-16",
    category: "location",
    island: "north",
    region: "Auckland",
    location: "Auckland",
    tags: ["city", "arrival", "harbour", "Waiheke"],
    emoji: "🌆",
    cover: "assets/images/auckland.jpg",
    excerpt: "Most working holiday makers land in Auckland and immediately plan to leave. This is understandable and also a mistake.",
    featured: false,
    mapLat: -36.8485,
    mapLng: 174.7633,
    file: "posts/auckland-arrival.html"
  },
  {
    id: "christchurch-rising",
    title: "Christchurch: The City Still Rising",
    date: "2024-03-12",
    category: "location",
    island: "south",
    region: "Canterbury",
    location: "Christchurch",
    tags: ["city", "resilience", "art", "gardens"],
    emoji: "🌸",
    cover: "assets/images/christchurch.jpg",
    excerpt: "Landing in a city still finding itself after the earthquakes — and finding myself in it too.",
    featured: false,
    mapLat: -43.532,
    mapLng: 172.636,
    file: "posts/christchurch-rising.html"
  },
  {
    id: "rotorua-geothermal",
    title: "Rotorua: Heat, Sulphur and the Hāngī",
    date: "2024-02-08",
    category: "location",
    island: "north",
    region: "Waikato / Bay of Plenty",
    location: "Rotorua",
    tags: ["geothermal", "Māori culture", "thermal pools"],
    emoji: "💨",
    cover: "assets/images/rotorua.jpg",
    excerpt: "Rotorua smells of sulphur and doesn't apologise for it. You stop noticing after an hour.",
    featured: false,
    mapLat: -38.1368,
    mapLng: 176.2497,
    file: "posts/rotorua-geothermal.html"
  },
  {
    id: "milford-sound",
    title: "Milford Sound: Rain Makes It Better",
    date: "2024-06-20",
    category: "location",
    island: "south",
    region: "Southland",
    location: "Milford Sound",
    tags: ["fiord", "rain", "boat cruise", "waterfalls"],
    emoji: "🏞️",
    cover: "assets/images/milford.jpg",
    excerpt: "Everyone says go on a clear day. They're wrong. Rain transforms Milford Sound into something impossibly dramatic.",
    featured: true,
    mapLat: -44.6414,
    mapLng: 167.8974,
    file: "posts/milford-sound.html"
  },
  {
    id: "west-coast-drive",
    title: "The West Coast: New Zealand's Wild Side",
    date: "2024-09-14",
    category: "location",
    island: "south",
    region: "West Coast",
    location: "Hokitika to Haast",
    tags: ["road trip", "rainforest", "glaciers", "wild"],
    emoji: "🌧️",
    cover: "assets/images/westcoast.jpg",
    excerpt: "Three days driving the wettest, most dramatic stretch of road I've ever been on. The West Coast does not compromise.",
    featured: false,
    mapLat: -43.2,
    mapLng: 170.6,
    file: "posts/west-coast-drive.html"
  },
  {
    id: "working-holiday-guide",
    title: "Working Holiday NZ: The Honest Guide",
    date: "2024-08-20",
    category: "general",
    island: null,
    region: null,
    location: null,
    tags: ["visa", "practical", "money", "work"],
    emoji: "📋",
    cover: null,
    excerpt: "The practical realities of a New Zealand working holiday — money, work, accommodation, and the things no one warns you about.",
    featured: true,
    mapLat: null,
    mapLng: null,
    file: "posts/working-holiday-guide.html"
  },
  {
    id: "best-sunsets",
    title: "New Zealand's Best Sunsets, Ranked",
    date: "2024-09-22",
    category: "general",
    island: null,
    region: null,
    location: null,
    tags: ["photography", "lists", "landscape", "golden hour"],
    emoji: "🌅",
    cover: null,
    excerpt: "A completely subjective ranking of the best places I watched the sun go down this year.",
    featured: false,
    mapLat: null,
    mapLng: null,
    file: "posts/best-sunsets.html"
  },
  {
    id: "nz-food",
    title: "Favourite Foods from a Year in Aotearoa",
    date: "2024-11-10",
    category: "general",
    island: null,
    region: null,
    location: null,
    tags: ["food", "culture", "flat white", "recommendations"],
    emoji: "🥧",
    cover: null,
    excerpt: "A sincere accounting of the best things I ate during twelve months in New Zealand.",
    featured: false,
    mapLat: null,
    mapLng: null,
    file: "posts/nz-food.html"
  }
];

/*
  REGIONS — displayed as cards in the homepage "Regions" grid view.
  Clicking a region card navigates to blog.html?region=Canterbury (etc.)
*/
const REGIONS = [
  { name: "Canterbury",               island: "south", emoji: "🏔️", desc: "Mountains, whales & a resilient city",  locations: ["Christchurch","Kaikōura","Hanmer Springs","Akaroa"] },
  { name: "Otago",                     island: "south", emoji: "🏕️", desc: "Adventure, wine & dramatic fiords",     locations: ["Queenstown","Dunedin","Wānaka","Arrowtown"] },
  { name: "Southland",                 island: "south", emoji: "🦅", desc: "Wild southern edge & fiordland",        locations: ["Milford Sound","Invercargill","Stewart Island"] },
  { name: "West Coast",                island: "south", emoji: "🌧️", desc: "Wild, wet & gloriously untamed",        locations: ["Hokitika","Franz Josef","Greymouth","Haast"] },
  { name: "Marlborough",               island: "south", emoji: "🍷", desc: "Sounds, sunshine & Sauvignon Blanc",    locations: ["Blenheim","Picton","Nelson"] },
  { name: "Auckland",                  island: "north", emoji: "🌆", desc: "The big smoke & volcanic islands",      locations: ["Auckland City","Waiheke Island","Devonport"] },
  { name: "Waikato / Bay of Plenty",   island: "north", emoji: "🌋", desc: "Hobbits, hot springs & volcanoes",     locations: ["Tongariro","Rotorua","Hamilton","Taupo"] },
  { name: "Wellington",                island: "north", emoji: "💨", desc: "Windy, wonderful capital",              locations: ["Wellington CBD","Wairarapa","Kāpiti Coast"] },
];

/*
  FEATURED_LIST — controls which posts show in the homepage Journal (list view).
  Edit this array to curate your featured posts. Use post id strings.
*/
const FEATURED_LIST = [
  "working-holiday-guide",
  "best-sunsets",
  "nz-food",
  "tongariro-crossing",
  "kaikoura-whales"
];
