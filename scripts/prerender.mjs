// Runs after `vite build` and the SSR build. Writes real HTML for every public page,
// plus sitemap.xml, llms.txt and llms-full.txt, so crawlers and AI bots that do not run
// JavaScript still see all the content.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const dist = path.join(root, "dist");
const ssrEntry = path.join(root, "dist-ssr", "entry-server.js");

const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
for (const marker of ["<!--app-head-->", "<!--app-html-start-->", "<!--app-html-end-->"]) {
  if (!template.includes(marker)) {
    throw new Error(`Template marker missing from dist/index.html: ${marker}`);
  }
}

const ssr = await import(pathToFileURL(ssrEntry).href);
const { render, renderHeadHtml, ROUTES, SITE, PRICES, HOME_FAQS, HOME_STEPS, HOME_FEATURE_LIST, LANDING_PAGES } = ssr;

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function build({ html, head, title, prerendered }) {
  let out = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  out = out.replace("<!--app-head-->", head);
  if (prerendered) {
    out = out.replace('<div id="root">', '<div id="root" data-prerendered="true">');
    out = out.replace(/<!--app-html-start-->[\s\S]*?<!--app-html-end-->/, () => html);
  } else {
    out = out.replace("<!--app-html-start-->", "").replace("<!--app-html-end-->", "");
  }
  return out;
}

function fileFor(routePath) {
  return routePath === "/" ? "index.html" : `${routePath.slice(1)}.html`;
}

const HOME_PRELOAD =
  '<link rel="preload" as="image" href="/mockups/mobile-pos.png" media="(min-width: 960px)" fetchpriority="high" />';

let count = 0;
for (const route of ROUTES) {
  const { html, seo } = render(route.path);
  if (!seo) throw new Error(`No SEO props were registered while rendering ${route.path}`);
  const { title, tags } = renderHeadHtml(seo);
  const head = route.path === "/" ? `${tags}\n    ${HOME_PRELOAD}` : tags;
  fs.writeFileSync(path.join(dist, fileFor(route.path)), build({ html, head, title, prerendered: true }));
  count += 1;
}

// 404 page (hosts serve this for unknown URLs, with a 404 status)
{
  const { html, seo } = render("/__not-found__");
  const { title, tags } = renderHeadHtml(seo);
  fs.writeFileSync(path.join(dist, "404.html"), build({ html, head: tags, title, prerendered: true }));
}

// Client-only shell for the admin console (never indexed)
fs.writeFileSync(
  path.join(dist, "app.html"),
  build({
    html: "",
    head: '<meta name="robots" content="noindex, nofollow" />',
    title: "QuickBill POS Admin",
    prerendered: false,
  })
);

// sitemap.xml
const urls = ROUTES.map(
  (r) =>
    `  <url>\n    <loc>${SITE.origin}${r.path === "/" ? "/" : r.path}</loc>\n    <lastmod>${SITE.updated}</lastmod>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`
).join("\n");
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);

// llms.txt (short index) and llms-full.txt (everything) for AI assistants
const rupee = (n) => `₹${n.toLocaleString("en-IN")}`;
const summary =
  `QuickBill POS is an offline billing app for Indian shops such as kirana stores, cafés, bakeries and sweet shops. ` +
  `It makes GST bills with CGST and SGST, shows and prints a UPI QR code, and prints on Bluetooth thermal printers (58 mm and 80 mm). ` +
  `It runs on Android 7.0+ phones, tablets and POS handhelds and works without internet. ` +
  `Plans: ${rupee(PRICES.monthly)} a month, ${rupee(PRICES.yearly)} a year, or the Annual Kit with a Bluetooth printer for ${rupee(PRICES.kit)}.`;

const llms = [
  "# QuickBill POS",
  "",
  `> ${summary}`,
  "",
  "## Key facts",
  "",
  ...HOME_FEATURE_LIST.map((f) => `- ${f}`),
  `- Pricing: ${rupee(PRICES.monthly)} per month, ${rupee(PRICES.yearly)} per year, Annual Kit ${rupee(PRICES.kit)} (printer + 1 year + 5 paper rolls). Unlimited bills on every plan.`,
  "- Platform: Android 7.0 or newer, 64-bit (arm64-v8a). Direct APK download. No iOS app is distributed from this website.",
  "- Support: WhatsApp chat only, +91 94469 60834.",
  "",
  "## Pages",
  "",
  `- [Home](${SITE.origin}/): Overview, pricing, download and FAQ.`,
  ...LANDING_PAGES.map((p) => `- [${p.navTitle}](${SITE.origin}/${p.slug}): ${p.cardBlurb}`),
  "",
  "## Legal",
  "",
  `- [Privacy Policy](${SITE.origin}/privacy-policy)`,
  `- [Terms and Conditions](${SITE.origin}/terms-and-conditions)`,
  "",
  "## Optional",
  "",
  `- [Full text of this site for language models](${SITE.origin}/llms-full.txt)`,
  "",
].join("\n");
fs.writeFileSync(path.join(dist, "llms.txt"), llms);

const full = [];
full.push("# QuickBill POS: full site content", "", `> ${summary}`, "");
full.push("## How it works", "");
HOME_STEPS.forEach((s, i) => full.push(`${i + 1}. ${s.name}: ${s.text}`));
full.push("", "## Features", "", ...HOME_FEATURE_LIST.map((f) => `- ${f}`), "");
full.push("## Frequently asked questions", "");
HOME_FAQS.forEach((f) => full.push(`### ${f.q}`, "", f.a, ""));
for (const p of LANDING_PAGES) {
  full.push(`## ${p.h1}`, "", `URL: ${SITE.origin}/${p.slug}`, "", p.lead, "");
  for (const s of p.sections) {
    full.push(`### ${s.h2}`, "");
    (s.body ?? []).forEach((b) => full.push(b, ""));
    (s.bullets ?? []).forEach((b) => full.push(`- ${b}`));
    if (s.bullets) full.push("");
  }
  if (p.howTo) {
    full.push(`### ${p.howTo.name}`, "");
    p.howTo.steps.forEach((st, i) => full.push(`${i + 1}. ${st.name}: ${st.text}`));
    full.push("");
  }
  full.push(`### Questions about ${p.navTitle.toLowerCase()}`, "");
  p.faqs.forEach((f) => full.push(`**${f.q}** ${f.a}`, ""));
}
fs.writeFileSync(path.join(dist, "llms-full.txt"), full.join("\n"));

console.log(`Prerendered ${count} pages + 404.html + app.html, sitemap.xml, llms.txt, llms-full.txt`);
