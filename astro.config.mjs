import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";
import UnoCss from "unocss/astro";
import yaml from "@rollup/plugin-yaml";

import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import expressiveCode from "astro-expressive-code";


// https://astro.build/config
export default defineConfig({
  site: "https://andka.my.id",
  vite: {
    plugins: [ yaml() ]
  },
  integrations: [
    expressiveCode({
      themes: [ "catppuccin-frappe", "catppuccin-latte" ],
      plugins: [ pluginCollapsibleSections(), pluginLineNumbers() ],
      defaultProps: {
        showLineNumbers: true,
        wrap: true,
      },
    }),
    mdx(),
    sitemap({
      changefreq: 'monthly',
      'priority': 0.7,
      'lastmod': new Date().toISOString().split('T')[ 0 ],
    }),
    UnoCss({ injectReset: true }),
  ],
  output: "hybrid",
  adapter: vercel({
    webAnalytics: true
  }),
});
