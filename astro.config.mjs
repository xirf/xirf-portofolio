import UnoCss from "unocss/astro";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import yaml from "@rollup/plugin-yaml";

// https://astro.build/config
export default defineConfig({
  site: "https://andka.my.id",
  vite: {
    plugins: [ yaml() ]
  },
  integrations: [
    sitemap({
      changefreq: 'monthly',
      'priority': 0.7,
      'lastmod': new Date(),
    }),
    UnoCss({ injectReset: true }),
  ],
  output: "server",
  adapter: vercel({
    edgeMiddleware: true
  })
});
