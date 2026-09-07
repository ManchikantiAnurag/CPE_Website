// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import awsAmplify from "astro-aws-amplify";

// https://astro.build/config
export default defineConfig({
  adapter: awsAmplify(),
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
    server: { allowedHosts: [".trycloudflare.com"] }
  },
});
