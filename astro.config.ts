import { defineConfig } from 'astro/config';
import unocss from "unocss/astro";

import vercel from "@astrojs/vercel/serverless";
import sitemap from "@astrojs/sitemap";
import alpinejs from "@astrojs/alpinejs";

// https://astro.build/config
export default defineConfig({
  integrations: [
    alpinejs(),
    unocss({
      injectReset: true
    }),
    sitemap(),
  ],
  site: "https://andka.me",
  output: "server",
  adapter: vercel()
});