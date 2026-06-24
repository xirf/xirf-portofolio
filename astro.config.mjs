import UnoCss from "unocss/astro";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import yaml from "@rollup/plugin-yaml";
import mdx from "@astrojs/mdx";
import remarkMath from "remark-math";
import rehypeMath from "rehype-mathjax";
import rehypeExternalLinks from "rehype-external-links";
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';

// https://astro.build/config
export default defineConfig({
  site: "https://andka.my.id",
  vite: {
    plugins: [yaml()]
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
    processor: unified({
      remarkPlugins: [
        remarkMath
      ],
      rehypePlugins: [
        [rehypeHeadingIds, { headingIdCompat: true }],
        [rehypeExternalLinks,
          {
            rel: ['external', 'nofollow', 'noopener', 'noreferrer'],
            target: ["_blank"]
          }
        ],
        rehypeMath
      ]
    })
  }
});
