import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const concerts = defineCollection({
  loader: file('src/content/concerts/concerts.json'),
  schema: z.object({
    id: z.string(),
    title: z.object({ pl: z.string(), en: z.string() }),
    date: z.string(),
    venue: z.object({ pl: z.string(), en: z.string() }),
    city: z.string(),
    poster: z.string().optional(),
    description: z.object({ pl: z.string(), en: z.string() }),
  }),
});

export const collections = { concerts };
