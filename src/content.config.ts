import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

/**
 * Singletons are single JSON documents. `file()` needs an object keyed by
 * entry id, so each parser wraps its document under the id the pages read.
 */
const singleton = (path: string, id: string) =>
    file(path, { parser: (text) => ({ [id]: JSON.parse(text) }) });

/**
 * One page section, edited on its own in the CMS. Every section entry uses
 * the id "content", which is what `getSection()` in src/lib/site.ts reads.
 */
const section = <T extends z.ZodRawShape>(path: string, schema: z.ZodObject<T>) =>
    defineCollection({ loader: singleton(path, "content"), schema });

/* ------------------------------------------------------------------ shared */

const cta = z.object({ label: z.string(), href: z.string() });

const link = z.object({ label: z.string(), href: z.string() });

/** Images are optional so the site builds before assets are uploaded. */
const image = z.object({
    image: z.string().default(""),
    image_alt: z.string().default(""),
});

const seo = z.object({
    meta_title: z.string(),
    meta_description: z.string(),
});

/** A heading, a link out, and a placeholder until the college publishes items. */
const emptyStateSection = z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string().default(""),
    cta: cta,
    empty_message: z.string(),
});

/** An icon-headed panel of bullet points. */
const listSection = z.object({
    title: z.string(),
    items: z.array(z.string()).default([]),
});

/* -------------------------------------------------------------- site-wide */

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
    loader: singleton("src/content/contact-details.json", "contact-details"),
    schema: z.object({
        phone_numbers: z.array(z.string()).default([]),
        emails: z.array(z.string()).default([]),
        address: z
            .object({
                line1: z.string().optional(),
                line2: z.string().optional(),
                line3: z.string().optional(),
            })
            .default({}),
        map_url: z.string().optional(),
        social_links: z
            .array(
                z.object({
                    platform: z.enum([
                        "facebook",
                        "instagram",
                        "youtube",
                        "twitter",
                        "linkedin",
                    ]),
                    label: z.string(),
                    url: z.string().url(),
                }),
            )
            .default([]),
    }),
});

const siteSettings = defineCollection({
    loader: singleton("src/content/site-settings.json", "site-settings"),
    schema: z.object({
        institution_name: z.string(),
        college_name: z.string(),
        established_year: z.number(),
        affiliation: z.string(),
        logo: z.string().default(""),
        logo_alt: z.string().default(""),
        description: z.string(),
        cta_label: z.string().default("Apply Now"),
        cta_href: z.string().default("/admissions"),
    }),
});

const navigationItem = z.object({
    label: z.string(),
    href: z.string(),
    /**
     * "courses" fills the dropdown from the courses collection so programmes
     * are never retyped in the menu; "none" uses the `children` below.
     */
    children_source: z.enum(["none", "courses"]).default("none"),
    children: z.array(link).default([]),
});

const navigation = defineCollection({
    loader: singleton("src/content/navigation.json", "navigation"),
    schema: z.object({
        primary: z.array(navigationItem).default([]),
        footer_note_links: z.array(link).default([]),
    }),
});

/* ------------------------------------------------------------- home page */

const homeSeo = section("src/content/home/seo.json", seo);

const homeHero = section(
    "src/content/home/hero.json",
    z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            intro: z.string(),
            primary_cta: cta,
            secondary_cta: cta,
            stats: z
                .array(z.object({ label: z.string(), value: z.string() }))
                .default([]),
            badge: z.string().default(""),
        })
        .merge(image),
);

const homeAbout = section(
    "src/content/home/about.json",
    z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            paragraphs: z.array(z.string()).default([]),
            cta: cta,
        })
        .merge(image),
);

const homeCourses = section(
    "src/content/home/courses.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        description: z.string(),
        cta: cta,
    }),
);

const homeWhyChoose = section(
    "src/content/home/why-choose.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        items: z
            .array(
                z.object({
                    icon: z.string(),
                    title: z.string(),
                    description: z.string(),
                }),
            )
            .default([]),
    }),
);

const homeCareerFocus = section(
    "src/content/home/career-focus.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        description: z.string(),
        items: z
            .array(z.object({ title: z.string(), description: z.string() }))
            .default([]),
    }),
);

const homeLeadership = section(
    "src/content/home/leadership.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        cta: cta,
        people: z
            .array(
                z.object({
                    name: z.string(),
                    role: z.string(),
                    bio: z.string(),
                    photo: z.string().default(""),
                }),
            )
            .default([]),
    }),
);

const homeCampusLife = section(
    "src/content/home/campus-life.json",
    z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            description: z.string(),
            primary_cta: cta,
            secondary_cta: cta,
        })
        .merge(image),
);

const homeAchievements = section(
    "src/content/home/achievements.json",
    emptyStateSection,
);

const homeAdmissionsBanner = section(
    "src/content/home/admissions-banner.json",
    z.object({
        kicker: z.string(),
        title: z.string(),
        description: z.string(),
        // Empty falls back to the shared contact details.
        phones: z.array(z.string()).default([]),
        cta: cta,
    }),
);

const homeNews = section("src/content/home/news.json", emptyStateSection);

/* -------------------------------------------------------- admissions page */

const admissionsSeo = section("src/content/admissions/seo.json", seo);

const admissionsHero = section(
    "src/content/admissions/hero.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        intro: z.string(),
    }),
);

const admissionsCallout = section(
    "src/content/admissions/callout.json",
    z.object({
        title: z.string(),
        // Empty falls back to the shared contact details.
        phones: z.array(z.string()).default([]),
    }),
);

const admissionsProcess = section(
    "src/content/admissions/process.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        steps: z.array(z.string()).default([]),
    }),
);

const admissionsEligibility = section(
    "src/content/admissions/eligibility.json",
    listSection,
);

const admissionsDocuments = section(
    "src/content/admissions/documents.json",
    listSection,
);

const admissionsDates = section(
    "src/content/admissions/important-dates.json",
    listSection,
);

const admissionsProspectus = section(
    "src/content/admissions/prospectus.json",
    z.object({
        title: z.string(),
        description: z.string(),
    }),
);

const admissionsEnquiry = section(
    "src/content/admissions/enquiry.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        description: z.string(),
        form_title: z.string(),
        form_description: z.string(),
        submit_label: z.string(),
        // Where the form posts. Empty until a handler is configured.
        form_endpoint: z.string().default(""),
        footnote: z.object({
            text: z.string(),
            link_label: z.string(),
            link_href: z.string(),
            call_prefix: z.string(),
        }),
    }),
);

export const collections = {
    courses,
    careers,
    contactDetails,
    siteSettings,
    navigation,

    homeSeo,
    homeHero,
    homeAbout,
    homeCourses,
    homeWhyChoose,
    homeCareerFocus,
    homeLeadership,
    homeCampusLife,
    homeAchievements,
    homeAdmissionsBanner,
    homeNews,

    admissionsSeo,
    admissionsHero,
    admissionsCallout,
    admissionsProcess,
    admissionsEligibility,
    admissionsDocuments,
    admissionsDates,
    admissionsProspectus,
    admissionsEnquiry,
};
