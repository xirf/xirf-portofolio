import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import solidJs from "@astrojs/solid-js";
import unocss from "@unocss/astro";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: 'https://andka.me',
  integrations: [mdx(), sitemap(), solidJs(), unocss({
    injectReset: true
  })],
  output: "server",
  adapter: vercel()
});
