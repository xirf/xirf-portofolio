import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ 
		pattern: "**/*.{md,mdx}", 
		base: "./src/content/blog" 
	}),
	schema: z.object({
		title: z.string(),
		slug: z.string(),
		pubDate: z.coerce.date(),
		tags: z.array(z.string()),
		thumbnail: z.string().url(),
		credit: z.string().optional(),
	})
});

export const collections = { blog };
