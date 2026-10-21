// Builds dist/offline.html for reui.io/blocks/data-grid/advanced: shell page + 8 preview iframes, all served from memory.
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const ROOT = __dirname, DIST = path.join(ROOT, 'dist'); fs.mkdirSync(DIST, { recursive: true });
const cap = JSON.parse(fs.readFileSync(path.join(ROOT, 'raw/capture.json'), 'utf8'));
const api = JSON.parse(fs.readFileSync(path.join(ROOT, 'raw/api.json'), 'utf8'));
const ORIGIN = 'https://reui.io';
const abs = (u, base) => { try { return new URL(u.replace(/&amp;/g, '&'), base).href; } catch { return null; } };
const report = { pages: {}, fonts: 0, flags: 0, sizes: {} };
const b64fetch = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(u + ' ' + r.status); const b = Buffer.from(await r.arrayBuffer()); return { ct: (r.headers.get('content-type') || '').split(';')[0], b64: b.toString('base64'), n: b.length }; };

(async () => {
  const images = { ...cap.images };
  // flag icons (CDN blocks in-page CORS fetches)
  const flagUrls = new Set(); for (const h of Object.values(cap.pages)) for (const m of h.matchAll(/https:\/\/flagcdn\.com\/[a-z0-9/-]+\.svg/g)) flagUrls.add(m[0]);
  for (const s of Object.values(cap.scripts)) if (s) for (const m of s.matchAll(/https:\/\/flagcdn\.com\/[a-z0-9/-]+\.svg/g)) flagUrls.add(m[0]);
  const codes = new Set(); for (const s of Object.values(cap.scripts)) if (s) for (const m of s.matchAll(/flagcdn\.com\/\$\{/g)) codes.add('tmpl');
  for (const u of cap.urls.filter(u => /flagcdn\.com/.test(u))) flagUrls.add(u);
  for (const cc of ['us', 'gb', 'de', 'fr', 'br', 'mx', 'ca', 'es', 'jp', 'au', 'nl', 'it', 'in', 'kr', 'se', 'ch', 'sg', 'cn', 'pt', 'pl', 'ie', 'dk', 'no', 'fi', 'be', 'at', 'nz', 'ar', 'cl', 'co', 'za', 'ae', 'il', 'tr']) flagUrls.add(`https://flagcdn.com/${cc}.svg`);
  for (const u of flagUrls) { try { const r = await b64fetch(u); images[u] = { ct: r.ct || 'image/svg+xml', b64: r.b64 }; report.flags++; } catch {} }
  // CSS with fonts inlined
  const css = {};
  for (const [u, t] of Object.entries(cap.css)) { if (!t) continue; let out = t; const urls = [...new Set([...t.matchAll(/url\((['"]?)(?!data:)([^)'"]+)\1\)/g)].map(m => m[2]))]; for (const ru of urls) { let d = null; try { const r = await b64fetch(abs(ru, u)); d = `data:${r.ct || 'font/woff2'};base64,${r.b64}`; report.fonts++; } catch {} out = out.split(ru).join(d || 'about:blank'); } css[u] = out; }
  const imgData = (u, base) => { const a = abs(u, base); const k = a && (images[a] ? a : Object.keys(images).find(x => x.split('?')[0] === a.split('?')[0])); return k ? `data:${images[k].ct || 'image/png'};base64,${images[k].b64}` : null; };
  const pages = {};
  for (const [url, raw] of Object.entries(cap.pages)) {
    let html = raw; const order = [];
    html = html.replace(/<script\b([^>]*)\bsrc="([^"]+)"([^>]*)><\/script>/g, (m, a1, src, a2) => { const attrs = {}; for (const am of (a1 + ' ' + a2).matchAll(/([a-zA-Z_:-]+)(?:="([^"]*)")?/g)) { const n = am[1].toLowerCase(); if (['src', 'async', 'defer', 'nonce', 'integrity', 'crossorigin'].includes(n)) continue; attrs[n] = am[2] == null ? '' : am[2].replace(/&amp;/g, '&'); } order.push({ src: abs(src, url), attrs }); return ''; });
    html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*\/?>/g, (m, href) => { const a = abs(href, url); if (!css[a]) return ''; return url === cap.loc ? `<style data-lr-css>${css[a]}</style>` : `<style data-lr-css-ref="${a}"></style>`; });
    html = html.replace(/<link\b[^>]*rel="(?:preload|modulepreload|prefetch|preconnect|dns-prefetch)"[^>]*\/?>/g, '');
    html = html.replace(/<script\b[^>]*src="[^"]*"[^>]*>[\s\S]*?<\/script>/g, '');
    html = html.replace(/(<img\b[^>]*?\s)src="([^"]+)"/g, (m, pre, u) => { const d = imgData(u, url); return d ? `${pre}src="${d}"` : m; });
    html = html.replace(/\s(srcset|imagesrcset)="([^"]+)"/g, (m, n, v) => ' ' + n + '="' + v.split(/,\s+(?=\S)/).map(p => { const b = p.trim().split(/\s+/); const d = imgData(b[0], url); if (d) b[0] = d; return b.join(' '); }).join(', ') + '"');
    const missing = order.filter(o => !cap.scripts[o.src]); if (missing.length) throw new Error(url + ' missing scripts ' + missing.length);
    pages[url] = { html, order }; report.pages[url.replace(ORIGIN, '')] = { scripts: order.length, kb: Math.round(html.length / 1024) };
  }
  const main = cap.loc;
  const scripts = {}; let patched = 0; for (const [u, t] of Object.entries(cap.scripts)) if (t) { scripts[u] = t.split('location:window.location}').join('location:(window.__lrLocation||window.location)}'); if (scripts[u] !== t) patched++; }
  if (patched !== 1) throw new Error('router location patch count ' + patched); report.routerPatch = patched;
  let pm = 0; for (const u of Object.keys(scripts)) { const t = scripts[u]; const n = t.replace(/(postMessage\([^;]{0,200}?),window\.location\.origin\)/g, (m, a) => { pm++; return a + ',"*")'; }); scripts[u] = n; }
  if (pm < 3) throw new Error('postMessage patch count ' + pm); report.postMessagePatch = pm;
  const apis = {}; for (const [u, r] of Object.entries(api)) if (r.body != null) apis[u] = r;
  const data = { main, pages: Object.fromEntries(Object.entries(pages).map(([k, v]) => [k, k === main ? { order: v.order } : v])), scripts, css, images, api: apis, capturedAt: new Date().toISOString() };
  const gz = zlib.gzipSync(Buffer.from(JSON.stringify(data)), { level: 9 }); const b64 = gz.toString('base64');
  const CSP = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob: data:; style-src 'unsafe-inline' data:; img-src data: blob:; font-src data:; media-src data: blob:; connect-src data: blob:; worker-src blob:; frame-src blob: about:; form-action 'none'; base-uri 'none'; object-src 'none'";
  const boot = fs.readFileSync(path.join(ROOT, 'boot.js'), 'utf8');
  const inject = `<meta http-equiv="Content-Security-Policy" content="${CSP}"><script>window.RU_DATA=${JSON.stringify(b64)};</script><script>${boot.split('</script').join('<\\/script')}</script>`;
  const html = pages[main].html.replace(/<head([^>]*)>/i, m => m + inject);
  fs.writeFileSync(path.join(DIST, 'offline.html'), html);
  report.sizes = { gzMB: +(gz.length / 1048576).toFixed(2), htmlMB: +(html.length / 1048576).toFixed(2), scripts: Object.keys(scripts).length, images: Object.keys(images).length };
  fs.writeFileSync(path.join(ROOT, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
