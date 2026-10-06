import { mkdir, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const content = "src/content";
const output = "public/og";
const pageSources = new Map([
    ["home", "home"],
    ["about", "about"],
    ["admissions", "admissions"],
    ["campus-life", "campus-life"],
    ["contact", "contact"],
    ["courses", "courses-page"],
    ["gallery", "gallery-page"],
    ["news", "news-page"],
]);

const escapeXml = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
})[character]);

const linesFor = (title) => {
    const lines = [];
    for (const word of title.split(/\s+/)) {
        const last = lines.length - 1;
        if (last >= 0 && `${lines[last]} ${word}`.length <= 28) lines[last] += ` ${word}`;
        else lines.push(word);
    }
    return lines;
};

const render = async (name, title) => {
    const lines = linesFor(title);
    const fontSize = lines.length > 3 ? 58 : 70;
    const lineHeight = fontSize * 1.17;
    const y = 292 - ((lines.length - 1) * lineHeight) / 2;
    const titleSvg = lines.map((line, index) =>
        `<text x="84" y="${y + index * lineHeight}" font-size="${fontSize}" font-weight="700" font-family="Georgia, serif" fill="#111111">${escapeXml(line)}</text>`
    ).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
        <rect width="1200" height="630" fill="#fffce7"/>
        <rect width="24" height="630" fill="#d92228"/>
        <circle cx="1110" cy="100" r="265" fill="#fbd33d" opacity="0.72"/>
        <rect x="84" y="75" width="85" height="8" fill="#d92228"/>
        <text x="84" y="126" font-size="25" font-weight="700" letter-spacing="3" font-family="Arial, sans-serif" fill="#d92228">CPE EDUCATIONAL INSTITUTIONS</text>
        ${titleSvg}
        <rect x="84" y="492" width="1032" height="2" fill="#111111" opacity="0.16"/>
        <text x="84" y="548" font-size="31" font-family="Arial, sans-serif" font-weight="700" fill="#111111">CPE JUNIOR COLLEGE</text>
        <text x="1116" y="548" text-anchor="end" font-size="23" font-family="Arial, sans-serif" fill="#333333">VISAKHAPATNAM · EST. 2007</text>
    </svg>`;
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(output, `${name}.png`));
};

await mkdir(output, { recursive: true });
for (const [slug, directory] of pageSources) {
    const { meta_title } = JSON.parse(await readFile(join(content, directory, "seo.json"), "utf8"));
    const title = slug === "home" ? "CPE Junior College" : meta_title.replace(/ — CPE Junior College$/, "");
    await render(slug, title);
}
for (const filename of await readdir(join(content, "courses"))) {
    if (!filename.endsWith(".json")) continue;
    const { title } = JSON.parse(await readFile(join(content, "courses", filename), "utf8"));
    await render(`courses-${filename.slice(0, -5)}`, title);
}
