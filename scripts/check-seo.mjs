import assert from "node:assert/strict";

const base = process.env.SEO_TEST_URL ?? "http://localhost:4321";
const site = process.env.SITE_URL ?? "https://cpecollege.com";
const sitemap = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemap.status, 200);
const xml = await sitemap.text();
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]));
assert.ok(urls.length >= 16, "sitemap includes public pages and content routes");
assert.equal(new Set(urls.map(String)).size, urls.length, "unique sitemap URLs");
assert.ok(urls.some((url) => url.pathname === "/courses/mec"));
assert.ok(urls.some((url) => url.pathname === "/news/19th-annual-day-celebrations"));
for (const url of urls) {
    assert.equal(url.origin, new URL(site).origin);
    assert.ok(!url.pathname.startsWith("/admin") && !url.pathname.startsWith("/api/"));
    const response = await fetch(new URL(url.pathname, base));
    assert.equal(response.status, 200, url.pathname);
    const html = await response.text();
    assert.ok(html.includes(`rel="canonical" href="${url.href}"`), url.pathname);
    assert.equal([...html.matchAll(/<h1[\s>]/g)].length, 1, `${url.pathname}: one H1`);
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    assert.equal(title?.split("CPE Junior College").length, 2, `${url.pathname}: brand once`);
    const blocks = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
    assert.equal(blocks.length, 1, `${url.pathname}: JSON-LD present`);
    const graph = JSON.parse(blocks[0][1])["@graph"];
    const organization = graph.find((entry) => entry["@type"] === "EducationalOrganization");
    assert.equal(organization.url, new URL(site).href);
    if (url.pathname.startsWith("/courses/")) {
        const course = graph.find((entry) => entry["@type"] === "Course");
        assert.equal(course.url, url.href);
        assert.equal(course.provider["@id"], organization["@id"]);
    }
    const image = html.match(/property="og:image" content="([^"]+)"/)?.[1];
    assert.equal(new URL(image).origin, new URL(site).origin);
    assert.equal((await fetch(new URL(new URL(image).pathname, base))).status, 200);
}
const robots = await fetch(`${base}/robots.txt`);
assert.equal(robots.status, 200);
assert.ok((await robots.text()).includes(`Sitemap: ${new URL("/sitemap.xml", site).href}`));
console.log(`SEO checks passed for ${urls.length} pages.`);
