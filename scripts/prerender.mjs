// Runs after `vite build` and the SSR build. Writes real HTML for every public page,
// plus sitemap.xml, llms.txt and llms-full.txt, so crawlers and AI bots that do not run
// JavaScript still see all the content.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const dist = path.join(root, "dist");
const ssrEntry = path.join(root, "dist-ssr", "entry-server.js");

let template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
for (const marker of ["<!--app-head-->", "<!--app-html-start-->", "<!--app-html-end-->"]) {
  if (!template.includes(marker)) {
    throw new Error(`Template marker missing from dist/index.html: ${marker}`);
  }
}

// Inline the site stylesheet: one less request before first paint, and it is small enough to be worth it.
const cssLink = template.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/);
if (cssLink) {
  const css = fs.readFileSync(path.join(dist, cssLink[1]), "utf8");
  template = template.replace(cssLink[0], () => `<style>${css}</style>`);
  console.log(`Inlined ${cssLink[1]} (${(css.length / 1024).toFixed(1)} KB)`);
}

const ssr = await import(pathToFileURL(ssrEntry).href);
const {
  render,
  renderHeadHtml,
  ROUTES,
  SITE,
  PRICES,
  HOME_FAQS,
  HOME_STEPS,
  HOME_FEATURE_LIST,
  LANDING_PAGES,
  LANGS,
  getDict,
  guideLangs,
  guidesFor,
  homePath,
  pagePath,
} = ssr;

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function build({ html, head, title, htmlLang, prerendered }) {
  let out = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  out = out.replace('<html lang="en-IN">', `<html lang="${htmlLang}">`);
  out = out.replace("<!--app-head-->", head);
  if (prerendered) {
    out = out.replace('<div id="root">', '<div id="root" data-prerendered="true">');
    out = out.replace(/<!--app-html-start-->[\s\S]*?<!--app-html-end-->/, () => html);
  } else {
    out = out.replace("<!--app-html-start-->", "").replace("<!--app-html-end-->", "");
  }
  return out;
}

/** "/" -> index.html, "/hi" -> hi/index.html, "/hi/gst-billing-app" -> hi/gst-billing-app.html */
function fileFor(routePath) {
  if (routePath === "/") return "index.html";
  const clean = routePath.slice(1);
  const isLangHome = LANGS.some((l) => l.code !== "en" && l.code === clean);
  return isLangHome ? `${clean}/index.html` : `${clean}.html`;
}

function write(relFile, content) {
  const full = path.join(dist, relFile);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

const HOME_PRELOAD =
  '<link rel="preload" as="image" href="/mockups/mobile-pos.webp" type="image/webp" media="(min-width: 960px)" fetchpriority="high" />';

const isHomeRoute = (p) => p === "/" || LANGS.some((l) => l.code !== "en" && `/${l.code}` === p);

const langOfRoute = (p) => {
  const first = p.split("/")[1] ?? "";
  return LANGS.some((l) => l.code === first && l.code !== "en") ? first : "en";
};

// Render everything first so each script's font can be cut down to the glyphs the site really uses.
const rendered = ROUTES.map((route) => {
  const { html, seo } = render(route.path);
  if (!seo) throw new Error(`No SEO props were registered while rendering ${route.path}`);
  return { route, html, seo, lang: langOfRoute(route.path) };
});

// Indic fonts: the full Noto files are 35-125 KB each. Shape every text on the site and keep only the
// glyphs that come out (about 5-15 KB per script). Dictionary text is included for strings that appear later.
const scriptOf = (family) => family.split(" ").pop().toLowerCase();
const fontByScript = {};
{
  const samples = {};
  const add = (info, text) => (samples[scriptOf(info.fontFamily)] ??= []).push({ lang: info.code, text });
  for (const r of rendered) {
    const info = LANGS.find((l) => l.code === r.lang);
    if (info.fontFamily) add(info, r.html.replace(/<[^>]*>/g, " "));
  }
  for (const info of LANGS) {
    if (!info.fontFamily) continue;
    add(info, JSON.stringify(getDict(info.code)));
    // Release dates are formatted in the browser with Intl, so cover every month name.
    const months = [];
    for (let m = 0; m < 12; m++) {
      for (const month of ["short", "long"]) {
        months.push(new Date(2026, m, 15).toLocaleDateString(`${info.htmlLang}-u-nu-latn`, { day: "numeric", month, year: "numeric" }));
      }
    }
    add(info, months.join("\n"));
  }

  const { subsetIndicFont } = await import("./indic-font.mjs");
  fs.mkdirSync(path.join(dist, "fonts"), { recursive: true });
  for (const [script, list] of Object.entries(samples)) {
    const source = fs.readFileSync(path.join(root, "fonts-src", `noto-${script}-${script}.woff2`));
    const family = LANGS.find((l) => l.fontFamily && scriptOf(l.fontFamily) === script).fontFamily;
    let css = "";
    const sizes = [];
    for (const weight of [400, 700]) {
      const { data, glyphs } = await subsetIndicFont(source, list, weight);
      const hash = crypto.createHash("sha1").update(data).digest("hex").slice(0, 8);
      const name = `noto-${script}-${weight}.${hash}.woff2`;
      fs.writeFileSync(path.join(dist, "fonts", name), data);
      css += `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url(/fonts/${name}) format("woff2")}`;
      sizes.push(`${weight}: ${(data.length / 1024).toFixed(1)} KB (${glyphs} glyphs)`);
    }
    fontByScript[script] = { css };
    console.log(`Font ${script}: ${(source.length / 1024).toFixed(0)} KB full -> ${sizes.join(", ")}`);
  }
}

let count = 0;
for (const { route, html, seo, lang } of rendered) {
  const { title, tags, htmlLang } = renderHeadHtml(seo);
  let head = isHomeRoute(route.path) ? `${tags}\n    ${HOME_PRELOAD}` : tags;
  const fam = LANGS.find((l) => l.code === lang).fontFamily;
  if (fam) head += `\n    <style>${fontByScript[scriptOf(fam)].css}</style>`;
  write(fileFor(route.path), build({ html, head, title, htmlLang, prerendered: true }));
  count += 1;
}

// 404 page (hosts serve this for unknown URLs, with a 404 status)
{
  const { html, seo } = render("/__not-found__");
  const { title, tags, htmlLang } = renderHeadHtml(seo);
  write("404.html", build({ html, head: tags, title, htmlLang, prerendered: true }));
}

// Client-only shell for the admin console (never indexed)
write(
  "app.html",
  build({
    html: "",
    head: '<meta name="robots" content="noindex, nofollow" />',
    title: "QuickBill POS Admin",
    htmlLang: "en-IN",
    prerendered: false,
  })
);

// sitemap.xml, with hreflang alternates for translated pages
const loc = (p) => `${SITE.origin}${p === "/" ? "/" : p}`;
const urls = ROUTES.map((r) => {
  let alts = "";
  if (r.alternates.length) {
    alts = r.alternates
      .map((a) => `\n    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${loc(a.path)}" />`)
      .join("");
    const en = r.alternates.find((a) => a.hreflang === "en-IN");
    alts += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${loc(en ? en.path : r.path)}" />`;
  }
  return `  <url>\n    <loc>${loc(r.path)}</loc>\n    <lastmod>${SITE.updated}</lastmod>\n    <priority>${r.priority.toFixed(1)}</priority>${alts}\n  </url>`;
}).join("\n");
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`
);

// llms.txt (short index) and llms-full.txt (everything) for AI assistants
const rupee = (n) => `₹${n.toLocaleString("en-IN")}`;
const summary =
  `QuickBill POS is an offline billing app for Indian shops such as kirana stores, cafés, bakeries and sweet shops. ` +
  `It makes GST bills with CGST and SGST, shows and prints a UPI QR code, and prints on Bluetooth thermal printers (58 mm and 80 mm). ` +
  `It runs on Android 7.0+ phones, tablets and POS handhelds and works without internet. ` +
  `Plans: ${rupee(PRICES.monthly)} a month, ${rupee(PRICES.yearly)} a year, or the Annual Kit with a Bluetooth printer for ${rupee(PRICES.kit)}.`;

const langHomes = LANGS.filter((l) => l.code !== "en").map(
  (l) => `- [${l.english} (${l.native})](${SITE.origin}${homePath(l.code)}): The home page in ${l.english}.`
);
const hiGuides = guidesFor("hi").map(
  (p) => `- [${p.navTitle}](${SITE.origin}${pagePath("hi", p.slug)}): ${p.cardBlurb}`
);

const llms = [
  "# QuickBill POS",
  "",
  `> ${summary}`,
  "",
  "## Key facts",
  "",
  ...HOME_FEATURE_LIST.map((f) => `- ${f}`),
  `- Pricing: ${rupee(PRICES.monthly)} per month, ${rupee(PRICES.yearly)} per year, Annual Kit ${rupee(PRICES.kit)} (printer + 1 year + 5 paper rolls). Unlimited bills on every plan.`,
  "- Platform: Android 7.0 or newer, 64-bit (arm64-v8a). Direct APK download.",
  "- Support: WhatsApp chat only, +91 79078 58474.",
  "",
  "## Pages (English)",
  "",
  `- [Home](${SITE.origin}/): Overview, pricing, download and FAQ.`,
  ...LANDING_PAGES.map((p) => `- [${p.navTitle}](${SITE.origin}/${p.slug}): ${p.cardBlurb}`),
  "",
  "## Other languages",
  "",
  ...langHomes,
  "",
  "## Hindi guides",
  "",
  ...hiGuides,
  "",
  "## Legal (English)",
  "",
  `- [Privacy Policy](${SITE.origin}/privacy-policy)`,
  `- [Terms and Conditions](${SITE.origin}/terms-and-conditions)`,
  "",
  "## Optional",
  "",
  `- [Full text of this site for language models](${SITE.origin}/llms-full.txt)`,
  "",
].join("\n");
write("llms.txt", llms);

const full = [];
full.push("# QuickBill POS: full site content", "", `> ${summary}`, "");
full.push("## How it works", "");
HOME_STEPS.forEach((s, i) => full.push(`${i + 1}. ${s.name}: ${s.text}`));
full.push("", "## Features", "", ...HOME_FEATURE_LIST.map((f) => `- ${f}`), "");
full.push("## Frequently asked questions", "");
HOME_FAQS.forEach((f) => full.push(`### ${f.q}`, "", f.a, ""));
for (const lang of guideLangs()) {
  const info = LANGS.find((l) => l.code === lang);
  for (const p of guidesFor(lang)) {
    full.push(`## ${p.h1}`, "", `URL: ${SITE.origin}${pagePath(lang, p.slug)}  (language: ${info.english})`, "", p.lead, "");
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
    full.push(`### ${p.navTitle}: ${lang === "en" ? "questions" : "FAQ"}`, "");
    p.faqs.forEach((f) => full.push(`**${f.q}** ${f.a}`, ""));
  }
}
write("llms-full.txt", full.join("\n"));

console.log(`Prerendered ${count} pages + 404.html + app.html, sitemap.xml, llms.txt, llms-full.txt`);
