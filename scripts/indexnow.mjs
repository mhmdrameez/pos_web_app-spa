// Tells Bing, Yandex, Naver, Seznam and other IndexNow engines that the site changed.
// Run after each deploy:  npm run indexnow
import fs from "node:fs";
import path from "node:path";

const HOST = "www.quickbillpos.in";
const key = fs.readFileSync(path.join(process.cwd(), "scripts", ".indexnow-key"), "utf8").trim();

const sitemapPath = path.join(process.cwd(), "dist", "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  console.error("dist/sitemap.xml not found. Run `npm run build` first.");
  process.exit(1);
}
const urlList = [...fs.readFileSync(sitemapPath, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList }),
});

console.log(`IndexNow responded ${res.status} for ${urlList.length} URLs`);
if (res.status !== 200 && res.status !== 202) {
  console.log("Make sure the site is deployed so the key file is reachable, then retry.");
  process.exit(1);
}
