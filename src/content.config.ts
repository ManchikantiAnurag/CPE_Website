import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

const courses = defineCollection({
    loader: glob({ base: "src/content/courses", pattern: "**/*.json" }),
    schema: z.object({
        code: z.string(),
        title: z.string(),
        tagline: z.string(),
        order: z.number(),
        overview: z.string(),
        highlights: z.array(z.string()).default([]),
        careers: z.array(z.string()).default([]),
        enquiry_phones: z.array(z.string()).default([]),
        enquiry_emails: z.array(z.string()).default([]),
        duration: z.string().optional(),
        eligibility: z.string().optional(),
        board: z.string().optional(),
    }),
});

const careers = defineCollection({
    loader: file("src/content/careers.json", {
        parser: (text) => JSON.parse(text).careers,
    }),
    schema: z.object({
        id: z.string(),
        name: z.string(),
    }),
});

const contactDetails = defineCollection({
    loader: file("src/content/contact-details.json", {
        parser: (text) => ({ "contact-details": JSON.parse(text) }),
    }),
    schema: z.object({
        phone_numbers: z.array(z.string()).default([]),
        emails: z.array(z.string()).default([]),
    }),
});

export const collections = { courses, careers, contactDetails };
