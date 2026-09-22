/**
 * Scrape all main-namespace articles from a Fandom (MediaWiki) wiki using
 * the public API, and save them as compact plain-text JSON.
 *
 * Usage:
 *   node tools/scrape_wiki.js --site egg-inc.fandom.com --out .tmp/egg_inc_wiki.json
 *
 * Notes learned:
 * - Fandom wikis expose a standard MediaWiki api.php with no auth required.
 * - action=query&list=allpages&apnamespace=0 lists only real articles
 *   (namespace 0), which automatically excludes Talk, User, User blog,
 *   File, Category, Template, Forum, etc. This is what keeps the scrape
 *   scoped to actual game content instead of the whole Fandom site.
 * - The TextExtracts extension (prop=extracts) is NOT enabled on this
 *   wiki's api.php, so explaintext is unavailable. Instead this tool uses
 *   action=parse&prop=text (fully rendered HTML, with templates/infoboxes
 *   expanded) and strips it down to plain text locally. action=parse only
 *   accepts one page per request, so pages are fetched one at a time.
 * - No local Python on this machine; this environment only has Node.js,
 *   so tools here are written in Node using the built-in fetch.
 */

const fs = require("fs");
const path = require("path");

const HEADERS = { "User-Agent": "EggIncWikiScraper/1.0 (personal research use)" };

function htmlToText(html) {
  return html
    .replace(/<(script|style|figure|sup class="reference")[\s\S]*?<\/\1>/gi, " ")
    .replace(/<table class="metadata[\s\S]*?<\/table>/gi, " ") // stub/cleanup notices
    .replace(/<(br|\/tr|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, "\n")
    .replace(/<(tr|li|h[1-6])[^>]*>/gi, "\n")
    .replace(/<td[^>]*>/gi, " | ")
    .replace(/<\/table>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseArgs(argv) {
  const args = { excludePrefix: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--site") args.site = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--exclude-prefix") args.excludePrefix.push(argv[++i]);
  }
  return args;
}

async function apiGet(baseUrl, params) {
  const url = baseUrl + "?" + new URLSearchParams(params).toString();
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function getAllTitles(baseUrl) {
  const titles = [];
  let params = {
    action: "query",
    list: "allpages",
    apnamespace: "0",
    aplimit: "max",
    format: "json",
  };
  while (true) {
    const data = await apiGet(baseUrl, params);
    for (const p of data.query.allpages) titles.push(p.title);
    if (!data.continue) break;
    params = { ...params, ...data.continue };
  }
  return titles;
}

async function getPageText(baseUrl, title) {
  const params = {
    action: "parse",
    page: title,
    prop: "text",
    format: "json",
    redirects: "1",
  };
  const data = await apiGet(baseUrl, params);
  if (data.error || !data.parse) return null;
  const html = data.parse.text["*"];
  const text = htmlToText(html);
  return text || null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.site || !args.out) {
    console.error("Usage: node scrape_wiki.js --site <host> --out <file.json> [--exclude-prefix X]");
    process.exit(1);
  }

  const baseUrl = `https://${args.site}/api.php`;

  console.error(`Fetching article list from ${args.site} ...`);
  let titles = await getAllTitles(baseUrl);
  if (args.excludePrefix.length) {
    titles = titles.filter((t) => !args.excludePrefix.some((p) => t.startsWith(p)));
  }
  console.error(`Found ${titles.length} articles.`);

  const result = {};
  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    try {
      const text = await getPageText(baseUrl, title);
      if (text) result[title] = text;
    } catch (err) {
      console.error(`  skipped "${title}": ${err.message}`);
    }
    if ((i + 1) % 20 === 0 || i === titles.length - 1) {
      console.error(`  fetched ${i + 1}/${titles.length}`);
    }
    await sleep(120);
  }

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(result), "utf-8");

  const totalChars = Object.values(result).reduce((n, v) => n + v.length, 0);
  console.error(`Saved ${Object.keys(result).length} articles (${totalChars.toLocaleString()} chars) to ${args.out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
