import { getSettings } from "@/lib/queries";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { Cursor } from "@/components/ui/Cursor";
import { SectionRail } from "@/components/ui/SectionRail";
import { Preloader } from "@/components/ui/Preloader";
import { Motion } from "@/components/ui/Motion";
import { VideoModal } from "@/components/ui/VideoModal";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <>
      <a href="#main" className="sr-only-focusable fixed top-3 left-3 z-[95] rounded-full bg-accent px-4 py-2 text-ink">
        Skip to content
      </a>
      <Preloader tagline={settings.tagline_words.join(" ")} />
      <Nav name={settings.artist_name} socials={settings.socials} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <SectionRail />
      <Cursor />
      <VideoModal url={settings.process_video_url} />
      <Motion />
    </>
  );
}
