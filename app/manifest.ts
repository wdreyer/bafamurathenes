import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BAFA Murathènes",
    short_name: "Murathènes",
    description:
      "Formations BAFA en Auvergne avec Murathènes : formation générale, étape 3 approfondissement, infos pratiques et accompagnement.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffbeb",
    theme_color: "#0f172a",
    lang: "fr",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
