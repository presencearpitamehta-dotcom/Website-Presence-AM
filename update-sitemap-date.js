// Rewrites <lastmod> in sitemap.xml at build time, honestly.
//
// Why this is not a blanket "stamp today on everything":
// Google documents that it ignores a site's lastmod values entirely once it
// detects they are inaccurate. Claiming all 13 pages changed on every deploy
// is exactly that, and it also put a date beside the homepage in search
// results, which is not wanted.
//
// Policy:
//   - Blog posts  -> the dateModified the post already declares in its own
//                    JSON-LD. That date is author-curated and reflects a real
//                    content change, so the sitemap and the page agree.
//   - Every other -> no <lastmod> at all. The field is optional in the
//     page        -> sitemap spec, and omitting it leaves Google nothing to
//                    print beside the homepage or the commercial pages.
//
// Deliberately NOT git mtimes: a sitewide cosmetic edit (a schema tweak, a
// footer change) touches every file and would reset every date at once,
// producing exactly the inaccuracy this script exists to avoid.
//
// Fails safe: a post whose dateModified cannot be read keeps whatever
// lastmod it already had rather than having one invented for it.

const fs = require('fs');
const path = require('path');

const SITEMAP = 'sitemap.xml';

/** Pull dateModified out of a page's JSON-LD. Returns YYYY-MM-DD or null. */
function declaredDate(file) {
  let html;
  try {
    html = fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
  const blocks = html.match(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  );
  if (!blocks) return null;

  for (const block of blocks) {
    const body = block.replace(/^[\s\S]*?>/, '').replace(/<\/script>$/, '');
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      continue;
    }
    const nodes = data['@graph'] || (Array.isArray(data) ? data : [data]);
    for (const node of nodes) {
      const d = node && node.dateModified;
      if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) {
        return d.slice(0, 10);
      }
    }
  }
  return null;
}

/** Map a <loc> URL to the file that serves it. */
function fileFor(loc) {
  let p = loc.replace(/^https?:\/\/[^/]+/, '') || '/';
  if (p.endsWith('/')) p += 'index.html';
  return p.replace(/^\//, '');
}

let xml = fs.readFileSync(SITEMAP, 'utf8');
let dated = 0;
let stripped = 0;
let skipped = 0;

// Each <url> block is decided on its own.
xml = xml.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
  const locMatch = block.match(/<loc>\s*(.*?)\s*<\/loc>/);
  if (!locMatch) return block;

  const file = fileFor(locMatch[1]);
  const isPost =
    file.startsWith('blog/') && path.basename(file) !== 'index.html';

  if (!isPost) {
    const out = block.replace(/[ \t]*<lastmod>.*?<\/lastmod>[ \t]*\r?\n?/g, '');
    if (out !== block) stripped++;
    return out;
  }

  const date = declaredDate(file);
  if (!date) {
    console.warn(`  ! no dateModified in ${file}; leaving its lastmod as-is`);
    skipped++;
    return block;
  }
  dated++;

  if (/<lastmod>.*?<\/lastmod>/.test(block)) {
    return block.replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${date}</lastmod>`);
  }
  return block.replace(/(<loc>.*?<\/loc>)/, `$1\n    <lastmod>${date}</lastmod>`);
});

fs.writeFileSync(SITEMAP, xml);
console.log(
  `sitemap.xml: ${dated} post(s) dated from their own schema, ` +
    `${stripped} lastmod removed, ${skipped} skipped`
);
