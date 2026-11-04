import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const base = "http://localhost:3000";
const manifest = JSON.parse(await readFile(".amplify-hosting/deploy-manifest.json", "utf8"));
assert.equal(manifest.computeResources[0].runtime, "nodejs22.x");
for (const path of ["/", "/about", "/admissions", "/campus-life", "/contact", "/courses", "/gallery", "/news", "/admin/index.html", "/admin/config.yml", "/favicon.svg"]) {
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
const home = await (await fetch(base)).text();
const image = home.match(/src="([^"]*\/_image\?[^"]+)"/);
assert.ok(image, "SSR image URL");
const imageResponse = await fetch(new URL(image[1].replaceAll("&amp;", "&"), base));
assert.equal(imageResponse.status, 200, "optimized image");
assert.match(imageResponse.headers.get("content-type"), /^image\//);
const admin = await fetch(`${base}/admin`, { redirect: "manual" });
assert.equal(admin.status, 302);
assert.equal(admin.headers.get("location"), "/admin/index.html");
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
for (const origin of [process.env.SITE_URL ?? "https://cpecollege.com", "https://main.deployment-check.amplifyapp.com"]) {
  const response = await fetch(`${base}/api/form`, {
    method: "POST",
    body: new URLSearchParams({ name: "Deployment check" }),
    headers: { accept: "application/json", origin, "x-forwarded-host": new URL(origin).host, "x-forwarded-proto": "https" },
  });
  assert.equal(response.status, 200, `forwarded origin: ${origin}`);
}
console.log("Deployment checks passed.");
