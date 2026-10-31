import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jeff — Wall Art & Graffiti",
    short_name: "Jeff",
    description: "Murals, graffiti, canvases and prints by Jeff.",
    start_url: "/",
    display: "standalone",
    background_color: "#08070C",
    theme_color: "#7B2FFF",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
