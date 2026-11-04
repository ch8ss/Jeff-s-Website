// Demo content used when Supabase env vars are not set (local dev / first deploy).
// Artwork photos and clips are Jeff's own; story text, stats, timeline, projects and testimonials are still sample copy.
import type { ArtCategory, Artwork, Clip, Post, Project, Settings, Testimonial, TimelineItem } from "./types";
import manifest from "./work-manifest.json";

const now = "2026-10-01T10:00:00.000Z";

export const seedSettings: Settings = {
  artist_name: "Jeff",
  tagline_words: ["Walls", "that", "talk", "back."],
  bio_md:
    "I paint walls the way the city talks: **loud**, a little rough at the edges, and then **all at once**. Every wall starts as a conversation with the street, the shop owner, the kid who watches from across the road. I leave something behind that makes people slow down, look up, and feel like the city is **talking back**.",
  city: null,
  contact_email: process.env.NEXT_PUBLIC_ARTIST_EMAIL ?? "jeff@example.com",
  stats: [
    { value: "40+", label: "walls painted" },
    { value: "12", label: "cities" },
    { value: "5", label: "years on the wall" },
    { value: "200K", label: "followers" },
  ],
  socials: {
    instagram: "https://www.instagram.com/jeffbellart",
    youtube: "https://www.youtube.com/@jeffbellart",
    facebook: "https://www.facebook.com/share/1A32dssV1g/",
  },
  hero_image_path: manifest.singles.hero.path,
  hero_image_alt: "Pink, purple and silver galaxy graffiti piece by Jeff painted along the side of a freight train car",
  story_image_path: manifest.singles.portrait.path,
  story_image_alt: "Jeff sitting on a stool in front of one of his colourful indoor murals",
  process_video_url: "/video/abandoned-walls.mp4",
  series_name: "Concrete Monsoon",
  process_poster_path: manifest.singles.process.path,
};

// Jeff's real work, converted from the photo folder into /public/work (see lib/work-manifest.json).
// Titles are working titles; years, cities and prices are left blank until Jeff fills them in via /admin.
export const seedArtworks: Artwork[] = manifest.artworks.map((a, i) => {
  const id = `seed-art-${i + 1}`;
  return {
    id,
    slug: a.slug,
    code: `JF-${String(i + 1).padStart(3, "0")}`,
    title: a.title,
    description: null,
    category: a.category as ArtCategory,
    medium: a.medium,
    width_cm: null,
    height_cm: null,
    year: null,
    city: null,
    location_name: null,
    map_url: null,
    is_featured: a.featured > 0,
    is_for_sale: false,
    price: null,
    currency: "USD",
    status: "not_for_sale",
    sort_order: a.featured || 100 + i,
    seo_title: null,
    seo_description: null,
    published: true,
    // Keeps manifest order as "newest first" on /walls and /for-sale.
    created_at: new Date(Date.UTC(2026, 9, 1) - i * 86_400_000).toISOString(),
    updated_at: now,
    images: a.images.map((img, k) => ({
      id: `${id}-img-${k}`,
      artwork_id: id,
      storage_path: img.path,
      alt: img.alt,
      width: img.width,
      height: img.height,
      is_cover: k === 0,
      sort_order: k,
    })),
  };
});

export const seedTimeline: TimelineItem[] = [
  { id: "t1", year: 2019, text: "First legal wall, behind a chai stall in Ameerpet", image_path: "/work/bridge-king.webp", image_alt: "Early mural behind a chai stall", sort_order: 0 },
  { id: "t2", year: 2021, text: "Painted 10 walls in 10 days across the Old City", image_path: "/work/freight-cosmos.webp", image_alt: "Mural from the 10 walls project", sort_order: 1 },
  { id: "t3", year: 2023, text: "First commissioned flyover pillar in Bengaluru", image_path: "/work/garage-cruiser.webp", image_alt: "Flyover pillar mural in Bengaluru", sort_order: 2 },
  { id: "t4", year: 2025, text: "Live-painted at three festivals, sold out first print run", image_path: "/work/head-wrap.webp", image_alt: "Print from the first sold-out run", sort_order: 3 },
  { id: "t5", year: 2026, text: "First solo show: Concrete Monsoon", image_path: "/work/eye-bloom.webp", image_alt: "Canvas from the Concrete Monsoon show", sort_order: 4 },
];

export const seedProjects: Project[] = [
  { id: "p1", date: "2026-11-12", city: "Hyderabad, IN", place: "Jubilee Hills Café", status: "in_progress", link_url: "https://maps.google.com/?q=Jubilee+Hills", image_path: "/work/chevelle-ss.webp", image_alt: "Work in progress at Jubilee Hills Café" },
  { id: "p2", date: "2026-11-28", city: "Mumbai, IN", place: "Bandra Street Fest", status: "live_painting", link_url: "https://maps.google.com/?q=Bandra", image_path: "/work/freight-cosmos.webp", image_alt: "Live painting stage at Bandra" },
  { id: "p3", date: "2026-12-14", city: "Bengaluru, IN", place: "Open commission slot", status: "open_slot", link_url: null, image_path: "/work/garage-cruiser.webp", image_alt: "Blank wall awaiting a commission" },
  { id: "p4", date: "2026-09-03", city: "Pune, IN", place: "Koregaon Park Hostel", status: "completed", link_url: "https://maps.google.com/?q=Koregaon+Park", image_path: "/work/the-nun.webp", image_alt: "Completed hostel wall in Koregaon Park" },
  { id: "p5", date: "2026-07-21", city: "Kolkata, IN", place: "College Street Books", status: "completed", link_url: "https://maps.google.com/?q=College+Street+Kolkata", image_path: "/work/rail-pillar.webp", image_alt: "Shutter mural on College Street" },
];

export const seedTestimonials: Testimonial[] = [
  { id: "q1", quote: "Our café wall became the reason people walk in. Customers take photos before they order.", source: "Café owner, Hyderabad", sort_order: 0 },
  { id: "q2", quote: "Jeff listened to the whole street before he painted a single line.", source: "Residents' association, Bengaluru", sort_order: 1 },
  { id: "q3", quote: "Raw, fast, and impossibly precise. A crowd gathered and never left.", source: "Festival curator, Mumbai", sort_order: 2 },
  { id: "q4", quote: "The print hangs in our living room and still feels like the street.", source: "Collector, Pune", sort_order: 3 },
  { id: "q5", quote: "Turned a grey shutter into the most photographed spot on the block.", source: "Bookshop owner, Kolkata", sort_order: 4 },
  { id: "q6", quote: "Delivered three days early and the wall still stops traffic.", source: "Brand manager, Chennai", sort_order: 5 },
];

export const seedPosts: Post[] = [
  {
    id: "b1",
    slug: "why-i-paint-walls-at-night",
    title: "Why I paint walls at night",
    excerpt: "Sodium lights, empty roads, and the strange calm of a city asleep. Notes on the night shift.",
    content_md: `The city is a different animal after midnight.\n\nThe traffic thins out, the chai stalls shut, and for a few hours the wall is just mine. I paint most of my big pieces at night, and people always ask why.\n\n## The light\n\nSodium street lights flatten colour. If a palette works under orange light, it will **sing** in daylight. It's a test I run on every wall.\n\n> Paint for the worst light and the best light takes care of itself.\n\n## The audience\n\nThe people who stop at 2am are the ones who really look. Delivery riders, watchmen, kids who can't sleep. They give the best feedback.\n\n## Kit list\n\n- 40–60 cans, mostly low-pressure\n- A ladder I trust\n- Headlamp with a red mode\n- A flask of very strong tea\n`,
    cover_path: "/work/glass-block-letters-v2.webp",
    cover_alt: "Long purple, green and pink graffiti piece across a wall of glass blocks in an empty building",
    tags: ["process", "murals"],
    seo_title: null,
    seo_description: null,
    published: true,
    published_at: "2026-10-12T09:00:00.000Z",
    created_at: now,
    updated_at: now,
  },
  {
    id: "b2",
    slug: "pricing-a-wall-commission",
    title: "How I price a wall commission",
    excerpt: "Square metres are only half the story. Here's everything that goes into a mural quote.",
    content_md: `People ask for a per-square-foot rate. I get it, but walls are never that simple.\n\n## What goes into a quote\n\n1. **Surface**: fresh plaster, old brick, metal shutter. Prep can be a full day.\n2. **Access**: ground level vs. scaffolding vs. a boom lift.\n3. **Detail**: a bold graphic piece is faster than a photoreal portrait.\n4. **Rights**: a café wall is different from a brand campaign.\n\n## The short version\n\nSend me a photo of the wall, rough measurements, and what you want people to *feel* when they see it. I'll reply within three working days with a range.\n`,
    cover_path: "/work/garage-cruiser.webp",
    cover_alt: "Cartoon bird driving a hot rod across a desert, painted on a garage door",
    tags: ["commissions"],
    seo_title: null,
    seo_description: null,
    published: true,
    published_at: "2026-09-02T09:00:00.000Z",
    created_at: now,
    updated_at: now,
  },
];

export const seedClips: Clip[] = [
  { id: "c1", video_path: "/video/neon-face.mp4", poster_path: "/video/neon-face.webp", caption: "Neon face mural", sort_order: 0 },
  { id: "c2", video_path: "/video/car-body-figure.mp4", poster_path: "/video/car-body-figure.webp", caption: "Airbrushing a figure on a car body", sort_order: 1 },
  { id: "c3", video_path: "/video/wildstyle-letters.mp4", poster_path: "/video/wildstyle-letters.webp", caption: "Wildstyle letters", sort_order: 2 },
  { id: "c4", video_path: "/video/veiled-portrait.mp4", poster_path: "/video/veiled-portrait.webp", caption: "Veiled portrait", sort_order: 3 },
  { id: "c5", video_path: "/video/uv-heart.mp4", poster_path: "/video/uv-heart.webp", caption: "UV heart wall", sort_order: 4 },
  { id: "c6", video_path: "/video/airbrushed-snake.mp4", poster_path: "/video/airbrushed-snake.webp", caption: "Airbrushed snake", sort_order: 5 },
  { id: "c7", video_path: "/video/soldier-portrait.mp4", poster_path: "/video/soldier-portrait.webp", caption: "Soldier portrait in spray paint", sort_order: 6 },
  { id: "c8", video_path: "/video/abandoned-walls.mp4", poster_path: "/video/abandoned-walls.webp", caption: "Walls in an abandoned building", sort_order: 7 },
];
