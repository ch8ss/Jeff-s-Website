import { getClips, getFeaturedArtworks, getForSaleArtworks, getProjects, getSettings, getTestimonials, getTimeline, getWallArtworks } from "@/lib/queries";
import { personJsonLd } from "@/lib/seo";
import { imageUrl } from "@/lib/storage";
import { JsonLd } from "@/components/ui/JsonLd";
import { ScrollEffects } from "@/components/ui/Motion";
import { Hero } from "@/components/sections/Hero";
import { Story } from "@/components/sections/Story";
import { Featured } from "@/components/sections/Featured";
import { Walls } from "@/components/sections/Walls";
import { Projects } from "@/components/sections/Projects";
import { Process } from "@/components/sections/Process";
import { Contact } from "@/components/sections/Contact";

export default async function HomePage() {
  const [settings, timeline, featured, forSale, walls, projects, testimonials, clips] = await Promise.all([
    getSettings(),
    getTimeline(),
    getFeaturedArtworks(),
    getForSaleArtworks(),
    getWallArtworks(),
    getProjects(),
    getTestimonials(),
    getClips(),
  ]);
  const featuredIds = new Set(featured.map((a) => a.id));
  const others = forSale.filter((a) => !featuredIds.has(a.id));
  const wallWork = walls.filter((a) => a.category === "mural" || a.category === "graffiti");

  return (
    <>
      <JsonLd data={personJsonLd(settings)} />
      <Hero settings={settings} />
      <Story settings={settings} timeline={timeline} />
      {featured.length > 0 && <Featured featured={featured} others={others} title={featured.some((a) => a.is_for_sale) ? "For sale" : "Featured"} artist={settings.artist_name} />}
      <Walls walls={wallWork.length >= 4 ? wallWork : walls} />
      {projects.length > 0 && <Projects projects={projects} />}
      <Process testimonials={testimonials} clips={clips} poster={imageUrl(settings.process_poster_path ?? settings.hero_image_path) ?? ""} />
      <Contact settings={settings} />
      <ScrollEffects />
    </>
  );
}
