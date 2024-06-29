import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import UnoCss from "unocss/astro";
import sitemap from '@astrojs/sitemap';
import { transformerNotationDiff } from "@shikijs/transformers"
import vercel from "@astrojs/vercel/serverless";
import { h } from "hastscript"

// https://astro.build/config
export default defineConfig({
  site: 'https://andka.my.id',
  integrations: [ mdx(), sitemap(), UnoCss({
    injectReset: true
  }) ],
  markdown: {
    shikiConfig: {
      theme: "catppuccin-frappe",
      wrap: true,
      transformers: [
        transformerNotationDiff(),
        {
          pre(node) {
            const filename = JSON.stringify(this.options.meta) || "index" + (this.options.extension || ".txt");

            const button = h('button', {
              class: 'shiki-copy',
              "data-code": this.source,
              onclick: `
              navigator.clipboard.writeText(this.dataset.code);
              this.classList.add('copied');
              setTimeout(() => this.classList.remove('copied'), 300)
            `
            }, [
              h('span', { class: 'ready' }),
              h('span', { class: 'success' })
            ])


            const span = h(
              "span",
              {
                class: "shiki-filename",
              },
              filename
            );

            node.children.unshift(button)
            node.children.unshift(span);
          },
        }
      ]
    }
  },
  output: "hybrid",
  adapter: vercel()
});
