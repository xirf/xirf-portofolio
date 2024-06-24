import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import UnoCss from "unocss/astro"
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://andka.my.id',
	integrations: [
		mdx(),
		sitemap(),
		UnoCss({
			injectReset: true,
		})
	],
});
