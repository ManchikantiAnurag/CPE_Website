import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
    const pages = Object.keys(import.meta.glob("./**/*.astro"))
        .filter((path) => !path.includes("[") && path !== "./admin.astro")
        .map((path) => path.replace(/^\.\//, "/").replace(/(?:\/index)?\.astro$/, ""))
        .map((path) => path === "/index" ? "/" : path);
    for (const collection of ["courses", "events"] as const) {
        const prefix = collection === "events" ? "news" : "courses";
        for (const entry of await getCollection(collection)) {
            pages.push(`/${prefix}/${entry.id}`);
        }
    }
    const urls = pages.sort().map((path) => {
        const url = new URL(path, site).href.replaceAll("&", "&amp;");
        return `<url><loc>${url}</loc></url>`;
    });
    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`,
        { headers: { "Content-Type": "application/xml; charset=utf-8" } },
    );
};
