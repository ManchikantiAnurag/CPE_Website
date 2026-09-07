import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const base = "http://localhost:3000";
const manifest = JSON.parse(await readFile(".amplify-hosting/deploy-manifest.json", "utf8"));
assert.equal(manifest.computeResources[0].runtime, "nodejs22.x");
for (const path of ["/", "/about", "/admissions", "/campus-life", "/contact", "/courses", "/gallery", "/news", "/admin/index.html", "/admin/config.yml", "/favicon.svg"]) {
  assert.equal((await fetch(base + path)).status, 200, path);
}
for (const slug of ["ca", "cec", "clat", "cma", "ipmat", "mec"]) {
  const response = await fetch(`${base}/courses/${slug}`);
  assert.equal(response.status, 200, slug);
  assert.match(await response.text(), /<h1[\s>]/);
}
assert.equal((await fetch(`${base}/courses/not-a-course`)).status, 404);
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
console.log("Deployment checks passed.");
