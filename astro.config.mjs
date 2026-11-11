// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://cpecollege.com",
  // URLs have no trailing slash (/about), matching canonical URLs and the
  // sitemap; wrangler.jsonc serves about/index.html at /about to match.
  trailingSlash: "never",
  adapter: cloudflare({
    // Prerendered pages get their images resized to WebP at build time (no
    // Cloudflare Images usage). Anything transformed on demand goes through
    // the Images binding, and the adapter caches each result at the edge so a
    // given transformation is only produced once per data center.
    imageService: { build: "compile", runtime: "cloudflare-binding" },
  }),
  // No sessions are used; this stops the adapter provisioning a KV namespace.
  session: false,
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
    server: { allowedHosts: [".trycloudflare.com"] }
  },
});
