// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import awsAmplify from "astro-aws-amplify";

const site = process.env.SITE_URL ?? "https://cpecolg.com";

export default defineConfig({
  site,
  output: "server",
  adapter: awsAmplify({ runtime: "nodejs22.x" }),
  security: {
    allowedDomains: [
      { hostname: new URL(site).hostname },
      { hostname: "**.amplifyapp.com", protocol: "https" },
      { hostname: "localhost", protocol: "http", port: "3000" },
    ],
  },
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
    server: { allowedHosts: [".trycloudflare.com"] }
  },
});
