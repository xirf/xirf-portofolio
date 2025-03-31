import UnoCss from "unocss/astro";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import mdx from "@astrojs/mdx";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';
import rehypeExternalLinks from "rehype-external-links";
import rehypeMath from "rehype-katex";
import remarkMath from "remark-math";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/serverless";
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
      'lastmod': new Date().toISOString().split('T')[ 0 ],
    }),
    UnoCss({ injectReset: true }),
  ],
  output: "server",
  adapter: vercel()
});
