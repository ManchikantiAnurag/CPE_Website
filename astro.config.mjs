// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://cpecolg.com",
  adapter: cloudflare({ imageService: "compile" }),
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
    server: { allowedHosts: [".trycloudflare.com"] }
  },
});
