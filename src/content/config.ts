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
		heroImage: image().refine(img => img.width < 1080 && img.height <= 720, {
			message: "Image too big. Max width: 1080px, max height: 720px",
		}),
	}),
});

export const collections = { blog };
