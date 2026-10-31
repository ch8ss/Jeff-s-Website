export type ArtCategory = "mural" | "graffiti" | "canvas" | "print" | "sketch" | "other";
export type ArtStatus = "available" | "reserved" | "sold" | "not_for_sale";
export type ProjectStatus = "completed" | "in_progress" | "live_painting" | "open_slot";

export type ArtworkImage = {
  id: string;
  artwork_id: string;
  storage_path: string;
  alt: string;
  width: number | null;
  height: number | null;
  is_cover: boolean;
  sort_order: number;
};

export type Artwork = {
  id: string;
  slug: string;
  code: string;
  title: string;
  description: string | null;
  category: ArtCategory;
  medium: string | null;
  width_cm: number | null;
  height_cm: number | null;
  year: number | null;
  city: string | null;
  location_name: string | null;
  map_url: string | null;
  is_featured: boolean;
  is_for_sale: boolean;
  price: number | null;
  currency: string;
  status: ArtStatus;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  images: ArtworkImage[];
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_md: string;
  cover_path: string | null;
  cover_alt: string | null;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  date: string;
  city: string;
  place: string | null;
  status: ProjectStatus | null;
  link_url: string | null;
  image_path: string | null;
  image_alt: string | null;
};

export type TimelineItem = {
  id: string;
  year: number;
  text: string;
  image_path: string | null;
  image_alt: string | null;
  sort_order: number;
};

export type Clip = { id: string; video_path: string; poster_path: string | null; caption: string | null; sort_order: number };

export type Testimonial = { id: string; quote: string; source: string; sort_order: number };

export type Stat = { value: string; label: string };

export type Socials = Partial<
  Record<"instagram" | "youtube" | "behance" | "x" | "pinterest" | "linkedin", string>
>;

export type Settings = {
  artist_name: string;
  tagline_words: string[];
  bio_md: string | null;
  city: string | null;
  contact_email: string | null;
  stats: Stat[];
  socials: Socials;
  hero_image_path: string | null;
  hero_image_alt: string | null;
  story_image_path: string | null;
  story_image_alt: string | null;
  process_video_url: string | null;
  // Not in the original spec table; small additions so the hero copy stays editable.
  series_name?: string | null;
  process_poster_path?: string | null;
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  organisation: string | null;
  topic: string | null;
  preferred_date: string | null;
  message: string | null;
  artwork_id: string | null;
  created_at: string;
};
