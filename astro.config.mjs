import UnoCss from "unocss/astro";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import yaml from "@rollup/plugin-yaml"; 
import mdx from "@astrojs/mdx";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import rehypeMath from "rehype-mathjax";
import rehypeAccessibleEmojis from "rehype-accessible-emojis";
import rehypeExternalLinks from "rehype-external-links";
import { rehypeHeadingIds } from '@astrojs/markdown-remark';

// https://astro.build/config
export default defineConfig({
  site: "https://andka.my.id",
  vite: {
    plugins: [ yaml() ]
  },
  integrations: [
    mdx(),
    sitemap({
      changefreq: 'monthly',
      'priority': 0.7,
      'lastmod': new Date(),
    }),
    UnoCss({ injectReset: true }),
  ],
  markdown: {
    remarkPlugins: [
       remarkMath 
      ],
    rehypePlugins: [
      [rehypeHeadingIds, { headingIdCompat: true }],
      [ rehypeExternalLinks,
        {
          rel: [ 'external', 'nofollow', 'noopener', 'noreferrer' ],
          target: [ "_blank" ]
        }
      ],
      rehypeMath
    ]
  },
  output: "server",
  adapter: vercel({
    edgeMiddleware: true
  })
});
