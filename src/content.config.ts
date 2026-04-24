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
    type: z.enum(['sacred', 'secular', 'chamber']),
    period: z.enum(['medieval', 'renaissance', 'baroque']),
    free: z.boolean(),
    ticketUrl: z.string().nullable(),
    poster: z.string().optional(),
    description: z.object({ pl: z.string(), en: z.string() }),
  }),
});

export const collections = { concerts };
