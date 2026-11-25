// Tells Bing and the other IndexNow engines that pages changed. Run by hand
// after a deploy: node scripts/indexnow.mjs (or pass paths: / /about)
const SITE = "https://www.sehaj.tech";
const KEY = "4b56856aeca1a03fcac071913d0a63aa"; // public by design, served at /4b56856aeca1a03fcac071913d0a63aa.txt

const paths = process.argv.slice(2);
const urlList = paths.length
  ? paths.map((p) => new URL(p, SITE).toString())
  : [...(await (await fetch(`${SITE}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
console.log(res.status, res.statusText, urlList);
