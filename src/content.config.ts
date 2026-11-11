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

const courseContent = z.object({
    paragraphs: z.array(z.string()).default([]),
    items: z.array(z.union([
        z.string(),
        z.object({ text: z.string(), children: z.array(z.string()).default([]) }),
    ])).default([]),
    closing_paragraphs: z.array(z.string()).default([]),
});

const courseSubsection = courseContent.extend({ heading: z.string() });

const courses = defineCollection({
    loader: glob({ base: "src/content/courses", pattern: "**/*.json" }),
    schema: z.object({
        code: z.string(),
        display_code: z.string().trim().optional(),
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
        sections: z
            .array(
                courseContent.extend({
                    heading: z.string(),
                    subsections: z.array(courseSubsection).default([]),
                }),
            )
            .default([]),
    }),
});

/** Chip filters on the gallery and news pages, referenced by each item. */
const categoryList = (path: string) =>
    defineCollection({
        loader: file(path, { parser: (text) => JSON.parse(text).categories }),
        schema: z.object({ id: z.string(), name: z.string(), order: z.number() }),
    });

const galleryCategories = categoryList("src/content/gallery-categories.json");
const newsCategories = categoryList("src/content/news-categories.json");

const gallery = defineCollection({
    loader: glob({ base: "src/content/gallery", pattern: "**/*.json" }),
    schema: z.object({
        title: z.string(),
        category: z.string(),
        /** ISO date, newest first on the page. */
        date: z.string(),
        /** Set to link the tile out to a video instead of showing a photo. */
        video_url: z.string().default(""),
    }).merge(image),
});

const news = defineCollection({
    loader: glob({ base: "src/content/news", pattern: "**/*.json" }),
    schema: z.object({
        title: z.string(),
        category: z.string(),
        date: z.string(),
        summary: z.string(),
        /** Optional link out to a notice, form or full article. */
        link: cta.partial().default({}),
    }).merge(image),
});

const events = defineCollection({
    loader: glob({ base: "src/content/events", pattern: "**/*.json" }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
        summary: z.string(),
        tagline: z.string(),
        venue: z.string(),
        participants: z.string(),
        about_title: z.string().default("About the Event"),
        about_image: z.string(),
        about_image_alt: z.string(),
        paragraphs: z.array(z.string()),
        activities_title: z.string().default("Celebrating Student Talent"),
        activities: z.array(z.object({ title: z.string(), icon: z.string() })).default([]),
        gallery_title: z.string().default("Event Gallery"),
        gallery: z.array(image).default([]),
    }).merge(image),
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

/** Shared across the home and about pages, so people are described once. */
const leadership = defineCollection({
    loader: file("src/content/leadership.json", {
        parser: (text) => JSON.parse(text).people,
    }),
    schema: z.object({
        id: z.string(),
        order: z.number(),
        name: z.string(),
        role: z.string(),
        bio: z.string(),
        photo: z.string().default(""),
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

const homeTestimonials = section(
    "src/content/home/testimonials.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        items: z
            .array(z.object({ quote: z.string(), name: z.string(), role: z.string() }))
            .default([]),
    }),
);

const homeContactCards = section(
    "src/content/home/contact-cards.json",
    z.object({
        eyebrow: z.string().default(""),
        title: z.string().default(""),
        cards: z.object({
            visit: z.string(),
            call: z.string(),
            write: z.string(),
            link_label: z.string(),
        }),
    }),
);

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

/* ----------------------------------------------------------- courses page */

const coursesSeo = section("src/content/courses-page/seo.json", seo);

const coursesHero = section(
    "src/content/courses-page/hero.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        intro: z.string(),
    }),
);

/* ------------------------------------------------------------- about page */

const aboutSeo = section("src/content/about/seo.json", seo);

const aboutHero = section(
    "src/content/about/hero.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        intro: z.string(),
    }),
);

const aboutCpe = section(
    "src/content/about/about-cpe.json",
    z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            paragraphs: z.array(z.string()).default([]),
        })
        .merge(image),
);

const aboutHistory = section(
    "src/content/about/history.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        items: z
            .array(
                z.object({
                    year: z.string().default(""),
                    icon: z.string().default(""),
                    title: z.string(),
                    description: z.string(),
                }),
            )
            .default([]),
    }),
);

const aboutVisionMission = section(
    "src/content/about/vision-mission.json",
    z.object({
        vision: z.object({
            eyebrow: z.string(),
            title: z.string(),
            description: z.string(),
        }),
        mission: z.object({
            eyebrow: z.string(),
            items: z.array(z.string()).default([]),
        }),
        core_values: z
            .object({
                eyebrow: z.string(),
                items: z
                    .array(z.object({ name: z.string(), description: z.string() }))
                    .default([]),
            })
            .default({ eyebrow: "Core Values", items: [] }),
    }).merge(image),
);

const aboutImpact = section(
    "src/content/about/impact.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        items: z.array(z.object({ icon: z.string(), value: z.string(), label: z.string() })),
    }),
);

const aboutAdmissionsBanner = section(
    "src/content/about/admissions-banner.json",
    z.object({ kicker: z.string(), title: z.string(), description: z.string(), cta }),
);

const aboutWhyChoose = section(
    "src/content/about/why-choose.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        items: z
            .array(z.object({ title: z.string(), description: z.string() }))
            .default([]),
    }),
);

const aboutLeadership = section(
    "src/content/about/leadership.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        description: z.string(),
        cta,
    }),
);

/* -------------------------------------------- gallery and news index pages */

/** Hero for a page whose body is a filtered list that may still be empty. */
const listPageHero = z.object({
    eyebrow: z.string(),
    title: z.string(),
    intro: z.string(),
    empty_message: z.string(),
});

const gallerySeo = section("src/content/gallery-page/seo.json", seo);
const galleryHero = section("src/content/gallery-page/hero.json", listPageHero);

const newsSeo = section("src/content/news-page/seo.json", seo);
const newsHero = section(
    "src/content/news-page/hero.json",
    listPageHero.extend({ events_title: z.string().default("Our Events") }),
);

/* ------------------------------------------------------- campus life page */

const campusLifeSeo = section("src/content/campus-life/seo.json", seo);

const campusLifeHero = section(
    "src/content/campus-life/hero.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        intro: z.string(),
    }),
);

const campusLifeIntro = section(
    "src/content/campus-life/life-at-cpe.json",
    z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            paragraphs: z.array(z.string()).default([]),
        })
        .merge(image),
);

const campusLifeOnCampus = section(
    "src/content/campus-life/on-campus.json",
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

const campusLifeAcademics = section(
    "src/content/campus-life/academics.json",
    z
        .object({
            eyebrow: z.string(),
            title: z.string(),
            paragraphs: z.array(z.string()).default([]),
            cta: cta,
        })
        .merge(image),
);

/* ----------------------------------------------------------- contact page */

const contactSeo = section("src/content/contact/seo.json", seo);

const contactHero = section(
    "src/content/contact/hero.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        intro: z.string(),
    }),
);

const contactLocation = section(
    "src/content/contact/location.json",
    z.object({
        eyebrow: z.string(),
        title: z.string(),
        map_title: z.string(),
    }),
);

export const collections = {
    courses,
    gallery,
    galleryCategories,
    news,
    events,
    newsCategories,
    careers,
    leadership,
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
    homeTestimonials,
    homeContactCards,

    admissionsSeo,
    admissionsHero,
    admissionsCallout,
    admissionsProcess,
    admissionsEligibility,
    admissionsDocuments,
    admissionsDates,
    admissionsProspectus,
    admissionsEnquiry,

    coursesSeo,
    coursesHero,

    aboutSeo,
    aboutHero,
    aboutCpe,
    aboutHistory,
    aboutVisionMission,
    aboutImpact,
    aboutAdmissionsBanner,
    aboutWhyChoose,
    aboutLeadership,

    campusLifeSeo,
    campusLifeHero,
    campusLifeIntro,
    campusLifeOnCampus,
    campusLifeAcademics,

    gallerySeo,
    galleryHero,
    newsSeo,
    newsHero,

    contactSeo,
    contactHero,
    contactLocation,
};
