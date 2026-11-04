import assert from "node:assert/strict";
import { readFile, readdir, access } from "node:fs/promises";
import { createRequire } from "node:module";

// Reuse Astro's YAML parser without adding a second dependency.
const { parse } = createRequire(import.meta.resolve("astro/package.json"))("yaml");
const index = await readFile("public/admin/index.html", "utf8");
const urls = [...index.matchAll(/href="(\/admin\/[^\"]+\.yml)"/g)].map(match => match[1]);
assert.equal(new Set(urls).size, urls.length, "Duplicate CMS configuration link");
const collections = [];
const singletons = [];
for (const url of urls) {
    const config = parse(await readFile(`public${url}`, "utf8"), { uniqueKeys: true });
    collections.push(...config.collections ?? []);
    singletons.push(...config.singletons ?? []);
}
for (const file of await readdir("public/admin/collections")) {
    if (file.endsWith(".yml")) assert.ok(urls.includes(`/admin/collections/${file}`), `Unregistered CMS config: ${file}`);
}
for (const group of [collections, singletons]) {
    assert.equal(new Set(group.map(item => item.name)).size, group.length, "Duplicate collection/singleton name");
}
const covered = new Set();
const collectionByName = new Map(collections.map(item => [item.name, item]));

function checkFields(fields, location) {
    assert.ok(Array.isArray(fields), `Missing editor fields: ${location}`);
    assert.equal(new Set(fields.map(field => field.name)).size, fields.length, `Duplicate field: ${location}`);
    for (const field of fields) {
        if (field.fields) checkFields(field.fields, `${location}.${field.name}`);
        if (field.field?.fields) checkFields(field.field.fields, `${location}.${field.name}[]`);
        if (field.widget === "relation") {
            const target = field.collection === "_singletons"
                ? singletons.find(item => item.name === field.file)
                : collectionByName.get(field.collection);
            assert.ok(target, `Unknown relation target: ${location}.${field.name}`);
            if (field.file && field.collection !== "_singletons") {
                assert.ok(target.files?.some(file => file.name === field.file), `Unknown relation file: ${location}.${field.name}`);
            }
        }
    }
}

async function checkValue(value, field, location) {
    if (value == null) return;
    if (field.widget === "object") {
        assert.equal(typeof value, "object", `Expected object: ${location}`);
        await checkObject(value, field.fields, location);
    } else if (field.widget === "list") {
        assert.ok(Array.isArray(value), `Expected list: ${location}`);
        for (const [i, item] of value.entries()) {
            if (field.fields) await checkObject(item, field.fields, `${location}[${i}]`);
            else if (field.field) await checkValue(item, field.field, `${location}[${i}]`);
        }
    } else if (field.widget === "image" || field.widget === "file") {
        if (value.startsWith("/media/")) await access(`src/assets${value}`);
        else if (value.startsWith("/") && !value.startsWith("//")) await access(`public${value}`);
    } else if (field.widget === "select") {
        const choices = field.options.map(option => typeof option === "object" ? option.value : option);
        for (const item of field.multiple ? value : [value]) assert.ok(choices.includes(item), `Unknown option: ${location}: ${item}`);
    }
}

async function checkObject(value, fields, location) {
    assert.ok(value && typeof value === "object" && !Array.isArray(value), `Expected object: ${location}`);
    for (const field of fields) {
        assert.ok(field.name in value || field.required === false || field.default !== undefined, `Missing required value: ${location}.${field.name}`);
    }
    for (const [name, data] of Object.entries(value)) {
        const field = fields.find(field => field.name === name);
        assert.ok(field, `Content has no CMS editor field: ${location}.${name}`);
        await checkValue(data, field, `${location}.${name}`);
    }
}

async function checkFile(file, fields) {
    assert.ok(!covered.has(file), `Content registered twice: ${file}`);
    covered.add(file);
    await checkObject(JSON.parse(await readFile(file, "utf8")), fields, file);
}

for (const collection of [...collections, ...singletons]) {
    if (collection.folder) {
        checkFields(collection.fields, collection.name);
        let files;
        try { files = await readdir(collection.folder); }
        catch (error) { if (error.code !== "ENOENT") throw error; files = []; }
        for (const file of files.filter(file => file.endsWith(".json"))) {
            await checkFile(`${collection.folder}/${file}`, collection.fields);
        }
    } else {
        for (const file of collection.files ?? [collection]) {
            checkFields(file.fields, `${collection.name}/${file.name}`);
            await checkFile(file.file, file.fields);
        }
    }
}
for (const path of await readdir("src/content", { recursive: true })) {
    if (path.endsWith(".json")) assert.ok(covered.has(`src/content/${path}`), `Content missing from CMS: ${path}`);
}
console.log(`CMS checks passed: ${collections.length} collections, ${singletons.length} singletons, ${covered.size} content files; all fields, relation targets and media references checked.`);
