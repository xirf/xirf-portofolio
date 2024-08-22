import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		idOnly: z.boolean().optional(),
		draft: z.boolean().optional(),
		heroImage: image()
	}),
});

export const collections = { blog };
