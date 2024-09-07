import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		idOnly: z.boolean().optional(),
		hasMath: z.boolean().optional(),
		draft: z.boolean().optional(),
		heroImage: z.string()
	}),
});

export const collections = { blog };
