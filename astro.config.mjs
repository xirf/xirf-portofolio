import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import UnoCss from "unocss/astro";
import sitemap from '@astrojs/sitemap';
import vercel from "@astrojs/vercel/serverless";

import expressiveCode from "astro-expressive-code";
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

// https://astro.build/config
export default defineConfig({
  site: 'https://andka.my.id',
  integrations: [
    expressiveCode({
      themes: [ 'catppuccin-frappe', 'catppuccin-latte' ],
      plugins: [
        pluginCollapsibleSections(),
        pluginLineNumbers()
      ],
      defaultProps: {
        showLineNumbers: true,
        wrap: true
      }
    }),
    mdx(),
    sitemap(),
    UnoCss({ injectReset: true })
  ],
  output: "hybrid",
  adapter: vercel()
});