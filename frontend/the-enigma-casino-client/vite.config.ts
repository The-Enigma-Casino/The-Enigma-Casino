import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["/img/icono.webp"],
      manifest: {
        name: "The Enigma Casino",
        short_name: "Enigma",
        start_url: "/landing",
        display: "standalone",
        background_color: "#0f0f0f",
        theme_color: "#1c1c1c",
        orientation: "portrait",
        description:
          "Casino online multijugador con Poker, Blackjack, Ruleta y mini juegos.",
        lang: "es",
        categories: ["casino", "education", "multiplayer"],
        icons: [
          {
            src: "/img/icono.webp",
            sizes: "192x192",
            type: "image/webp",
          },
          {
            src: "/img/icono.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
      },
    }),
  ],
});
