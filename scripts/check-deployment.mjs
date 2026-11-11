import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";

// Run against `pnpm preview` (the Worker running locally in workerd).
const base = process.env.DEPLOY_TEST_URL ?? "http://localhost:4321";
for (const path of ["/", "/about", "/achievements", "/admissions", "/campus-life", "/contact", "/courses", "/gallery", "/news", "/admin/config.yml", "/favicon.svg"]) {
  assert.equal((await fetch(base + path)).status, 200, path);
}
for (const collection of ["courses", "events"]) {
  const route = collection === "events" ? "news" : "courses";
  for (const file of (await readdir(`src/content/${collection}`)).filter((file) => file.endsWith(".json"))) {
    const response = await fetch(`${base}/${route}/${file.slice(0, -5)}`);
    assert.equal(response.status, 200, file);
    assert.match(await response.text(), /<h1[\s>]/);
  }
  assert.equal((await fetch(`${base}/${route}/not-a-real-slug`)).status, 404);
}

// Prerendered pages reference images optimized at build time, served as
// immutable static assets rather than transformed per request.
const home = await (await fetch(base)).text();
const image = home.match(/src="(\/_astro\/[^"]+\.webp)"/);
assert.ok(image, "build-time optimized image");
const imageResponse = await fetch(base + image[1]);
assert.equal(imageResponse.status, 200, "optimized image");
assert.equal(imageResponse.headers.get("content-type"), "image/webp");
assert.match(imageResponse.headers.get("cache-control") ?? "", /immutable/);

// Static assets serve the CMS (public/admin/index.html) at /admin.
const admin = await fetch(`${base}/admin`, { redirect: "manual" });
assert.equal(admin.status, 200);
assert.match(await admin.text(), /sveltia-cms/);
const slash = await fetch(`${base}/about/`, { redirect: "manual" });
assert.equal(slash.status, 307);
assert.equal(new URL(slash.headers.get("location"), base).pathname, "/about");
for (const page of ["contact", "admissions"]) {
  for (const json of [true, false]) {
    const response = await fetch(`${base}/api/form`, {
      method: "POST",
      body: new URLSearchParams({ name: "Deployment check", student_name: "Deployment check", mobile: "0000000000", message: "Test submission" }),
      headers: { accept: json ? "application/json" : "text/html", origin: base, referer: `${base}/${page}` },
      redirect: "manual",
    });
    assert.equal(response.status, json ? 200 : 303);
    if (json) assert.deepEqual(await response.json(), { ok: true });
    else assert.equal(response.headers.get("location"), `${base}/${page}`);
  }
}
console.log("Deployment checks passed.");
