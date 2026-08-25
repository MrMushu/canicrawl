// Submit the site's URLs to IndexNow (Bing, Seznam, Yandex, and partners —
// Bing's index feeds several AI search products). Standard SEO plumbing for
// our own site: no accounts, no content posted anywhere.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "8c2f1e94ab674d0f9c3b57a1de86f240";
const sitemap = fs.readFileSync(path.join(ROOT, "dist/sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const host = new URL(urls[0]).host;

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  signal: AbortSignal.timeout(30000),
  body: JSON.stringify({
    host,
    key: KEY,
    keyLocation: `https://${host}/${KEY}.txt`,
    urlList: urls.slice(0, 10000),
  }),
});
console.log(`IndexNow: submitted ${Math.min(urls.length, 10000)} URLs for ${host} — HTTP ${res.status}`);
