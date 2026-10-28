// Auto-stamps today's date into sitemap.xml on every deploy.
// Netlify/Cloudflare runs this as a build step so <lastmod> always reflects
// the latest deploy — signalling freshness to search crawlers.
const fs = require('fs');
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
let xml = fs.readFileSync('sitemap.xml', 'utf8');
xml = xml.replace(/<lastmod>.*?<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
fs.writeFileSync('sitemap.xml', xml);
console.log('sitemap.xml lastmod updated to ' + today);
