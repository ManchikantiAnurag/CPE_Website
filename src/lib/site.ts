import { getCollection, getEntry, type DataEntryMap } from "astro:content";

export interface NavLink {
    label: string;
    href: string;
    description?: string;
}

export interface NavItem extends NavLink {
    children: NavLink[];
}

/** Courses sorted for display, with the route each one lives at. */
export async function getCourseLinks(): Promise<NavLink[]> {
    const courses = await getCollection("courses");

    return courses
        .sort((a, b) => a.data.order - b.data.order)
        .map((course) => ({
            label: course.data.code,
            href: `/courses/${course.id}`,
            description: course.data.title,
        }));
}

/**
 * Reads one page-section collection. Every section document is stored under
 * the entry id "content", so pages name only the collection.
 */
export async function getSection<C extends keyof DataEntryMap>(collection: C) {
    const entry = await getEntry(collection, "content");
    if (!entry) {
        throw new Error(`Missing content for the "${String(collection)}" collection`);
    }
    return entry.data;
}

export async function getSiteSettings() {
    const entry = await getEntry("siteSettings", "site-settings");
    if (!entry) throw new Error("Missing src/content/site-settings.json");
    return entry.data;
}

export async function getContactDetails() {
    const entry = await getEntry("contactDetails", "contact-details");
    if (!entry) throw new Error("Missing src/content/contact-details.json");
    return entry.data;
}

/**
 * Primary navigation with the course dropdown filled from the courses
 * collection, so adding a course in the CMS updates the menu automatically.
 */
export async function getPrimaryNavigation(): Promise<NavItem[]> {
    const entry = await getEntry("navigation", "navigation");
    if (!entry) throw new Error("Missing src/content/navigation.json");

    const courseLinks = await getCourseLinks();

    return entry.data.primary.map((item) => ({
        label: item.label,
        href: item.href,
        children: item.children_source === "courses" ? courseLinks : item.children,
    }));
}

export async function getFooterNoteLinks(): Promise<NavLink[]> {
    const entry = await getEntry("navigation", "navigation");
    return entry?.data.footer_note_links ?? [];
}

/** Uses the page-specific numbers when set, otherwise the shared ones. */
export function resolvePhones(preferred: string[], fallback: string[]) {
    return preferred.length ? preferred : fallback;
}
