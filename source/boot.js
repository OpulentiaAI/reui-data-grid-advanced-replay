function __lrBootMain() {
  'use strict';
  var ORIGIN = 'https://reui.io';
  var CHILD = !!window.__lrPageKey;
  var P = CHILD ? window.parent : null;
  var D = null, blobs = {}, imgs = {}, frames = {}, ready = false, queue = [];
  var R = window.__reuiReplay = { ready: false, blocked: [], served: { api: 0, img: 0, script: 0, frames: 0 }, child: CHILD };
  function abs(u) { try { var x = new URL(String(u), ORIGIN + (CHILD ? window.__lrPageKey.replace(ORIGIN, '') : '/blocks/data-grid/advanced')); if (x.protocol === 'file:' || (x.origin === location.origin && x.origin !== ORIGIN && /^https?:$/.test(x.protocol))) return ORIGIN + x.pathname + x.search + x.hash; return x.href; } catch (e) { return String(u); } }
  function keyFor(map, u) { if (!map) return null; u = abs(u); if (map[u] != null) return u; var n = u.split('#')[0]; if (map[n] != null) return n; var p = n.split('?')[0]; for (var k in map) { if (k.split('?')[0] === p) return k; } return null; }
  function toast(msg) { var top = CHILD ? P : window; if (top !== window && top.__reuiReplay && top.__reuiReplay.toast) return top.__reuiReplay.toast(msg); var t = document.getElementById('lr-toast'); if (!t) { t = document.createElement('div'); t.id = 'lr-toast'; t.setAttribute('role', 'status'); t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;background:rgba(9,9,11,.94);color:#fafafa;font:13px/18px Inter,system-ui,sans-serif;padding:9px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.14);pointer-events:none;opacity:0;transition:opacity .2s'; (document.body || document.documentElement).appendChild(t); } t.textContent = msg; t.style.opacity = '1'; clearTimeout(t._h); t._h = setTimeout(function () { t.style.opacity = '0'; }, 2400); }
  R.toast = toast;

  (function () { var NU = window.URL; if (NU.__lr) return; var fallback = CHILD ? window.__lrPageKey : ORIGIN + '/blocks/data-grid/advanced';
    function LU(u, b) { if (!(this instanceof LU)) throw new TypeError("Failed to construct 'URL': Please use the 'new' operator."); try { return b === undefined ? new NU(u) : new NU(u, b); } catch (e) { var bs = b === undefined ? '' : String(b && b.href || b); if (b === undefined || /^(about:|null$|$)/.test(bs)) { try { return new NU(u, fallback); } catch (e2) {} } throw e; } }
    LU.prototype = NU.prototype; Object.getOwnPropertyNames(NU).forEach(function (k) { if (!(k in LU) || k === 'canParse' || k === 'parse') { try { LU[k] = NU[k]; } catch (e) {} } }); LU.canParse = function (u, b) { try { new LU(u, b); return true; } catch (e) { return false; } }; LU.__lr = 1; window.URL = LU; })();
  (function () { var PM = window.postMessage; window.postMessage = function (m, o, t) { if (o && typeof o === 'object' && !Array.isArray(o)) { if (o.targetOrigin && !/^(\*|\/|https?:|file:)/.test(o.targetOrigin)) o = Object.assign({}, o, { targetOrigin: '*' }); } else if (typeof o === 'string' && !/^(\*|\/|https?:\/\/[^/]+$)/.test(o)) o = '*'; else if (typeof o === 'string' && o !== '*' && o !== '/' && o !== location.origin) o = '*'; return t === undefined ? PM.call(this, m, o) : PM.call(this, m, o, t); }; })();
  var getAttr = Element.prototype.getAttribute, setAttr = Element.prototype.setAttribute;
  Element.prototype.getAttribute = function (n) { if (this.__lrSrc && String(n).toLowerCase() === 'src') { try { var u = new URL(this.__lrSrc); return u.origin === ORIGIN ? u.pathname + u.search : this.__lrSrc; } catch (e) { return this.__lrSrc; } } return getAttr.call(this, n); };
  /* scripts */
  var sDesc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
  Object.defineProperty(HTMLScriptElement.prototype, 'src', { configurable: true, enumerable: true, get: function () { return this.__lrSrc || sDesc.get.call(this); }, set: function (v) { var k = D && keyFor(D.scripts, v); if (k) { this.__lrSrc = k; R.served.script++; sDesc.set.call(this, blobs[k]); } else { this.__lrSrc = abs(v); R.blocked.push('script ' + v); sDesc.set.call(this, 'data:text/javascript,'); } } });
  /* images */
  function imgUrl(v) { if (!v || /^(data|blob):/.test(v)) return v; var k = keyFor(imgs, v); if (k) { R.served.img++; return imgs[k]; } R.blocked.push('img ' + abs(v)); return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; }
  function mapSrcset(v) { if (!v) return v; return String(v).split(/,\s+(?=\S)/).map(function (part) { var b = part.trim().split(/\s+/); b[0] = imgUrl(b[0]); return b.join(' '); }).join(', '); }
  var iDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  Object.defineProperty(HTMLImageElement.prototype, 'src', { configurable: true, enumerable: true, get: function () { return this.__lrSrc || iDesc.get.call(this); }, set: function (v) { this.__lrSrc = abs(v); iDesc.set.call(this, imgUrl(v)); } });
  var ssDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'srcset');
  Object.defineProperty(HTMLImageElement.prototype, 'srcset', { configurable: true, enumerable: true, get: function () { return ssDesc.get.call(this); }, set: function (v) { ssDesc.set.call(this, mapSrcset(v)); } });
  /* iframes -> in-memory preview documents */
  function frameHtml(v) {
    var k = D && keyFor(D.pages, v);
    if (!k || k === D.main) { R.blocked.push('frame ' + abs(v)); return null; }
    var src = CHILD ? P.__lrBootSrc : window.__lrBootSrc;
    var inject = '<script>window.__lrPageKey=' + JSON.stringify(k) + ';(' + src + ')()<\/script>';
    R.served.frames++;
    return D.pages[k].html.replace(/<style data-lr-css-ref="([^"]+)"><\/style>/g, function (m, u) { return D.css[u] != null ? '<style>' + D.css[u] + '</style>' : ''; }).replace(/<head([^>]*)>/i, function (m) { return m + inject; });
  }
  function loadFrame(f, v) { var h = frameHtml(v); if (h == null) { fDesc.set.call(f, 'about:blank'); return; } setAttr.call(f, 'srcdoc', h); }
  var fDesc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
  Object.defineProperty(HTMLIFrameElement.prototype, 'src', { configurable: true, enumerable: true, get: function () { return this.__lrSrc || fDesc.get.call(this); }, set: function (v) { if (/^blob:|^about:/.test(v)) return fDesc.set.call(this, v); this.__lrSrc = abs(v); if (!ready) { this.__lrPending = v; return; } loadFrame(this, v); } });
  Element.prototype.setAttribute = function (n, v) {
    var ln = String(n).toLowerCase();
    if (this instanceof HTMLScriptElement && ln === 'src') { this.src = v; return; }
    if (this instanceof HTMLImageElement && ln === 'src') { this.src = v; return; }
    if (this instanceof HTMLIFrameElement && ln === 'src') { this.src = v; return; }
    if ((this instanceof HTMLImageElement || this instanceof HTMLSourceElement) && ln === 'srcset') return setAttr.call(this, n, mapSrcset(v));
    if (this instanceof HTMLLinkElement && ln === 'href') { var rel = (this.rel || getAttr.call(this, 'rel') || '').toLowerCase(); if (/preload|prefetch|modulepreload|preconnect|dns-prefetch/.test(rel)) return setAttr.call(this, n, 'data:,'); if (/stylesheet/.test(rel)) { var ck = D && keyFor(D.css, v); return setAttr.call(this, n, ck ? 'data:text/css;base64,' + btoa(unescape(encodeURIComponent(D.css[ck]))) : 'data:text/css,'); } }
    return setAttr.call(this, n, v);
  };
  /* network */
  function apiKey(u) { if (!D) return null; var k = keyFor(D.api, u); return k; }
  var realFetch = window.fetch;
  window.fetch = function (input, init) {
    var u = typeof input === 'string' ? input : (input && input.url) || String(input);
    var go = function () {
      var a = abs(u);
      var k = apiKey(a); if (k) { var r = D.api[k]; R.served.api++; return Promise.resolve(new Response(r.body, { status: r.status || 200, headers: { 'content-type': r.ct || 'application/json' } })); }
      var ik = keyFor(imgs, a); if (ik) { R.served.img++; return realFetch(imgs[ik]); }
      var sk = keyFor(D.scripts, a); if (sk) return Promise.resolve(new Response(D.scripts[sk], { status: 200, headers: { 'content-type': 'application/javascript' } }));
      R.blocked.push('fetch ' + a.slice(0, 140));
      if (/[?&]_rsc=/.test(a)) return Promise.resolve(new Response('', { status: 404 }));
      return Promise.resolve(new Response(/\/api\//.test(a) ? '{}' : '', { status: /\/api\//.test(a) ? 200 : 204, headers: { 'content-type': 'application/json' } }));
    };
    return ready ? go() : new Promise(function (res) { queue.push(function () { res(go()); }); });
  };
  XMLHttpRequest.prototype.open = function (m, u) { this.__lrUrl = abs(u); };
  XMLHttpRequest.prototype.send = function () { var x = this; R.blocked.push('xhr ' + x.__lrUrl.slice(0, 120)); var k = apiKey(x.__lrUrl); var body = k ? D.api[k].body : ''; ['readyState', 'status', 'responseText', 'response'].forEach(function (p, i) { Object.defineProperty(x, p, { configurable: true, value: [4, k ? 200 : 204, body, body][i] }); }); setTimeout(function () { try { x.onreadystatechange && x.onreadystatechange(); } catch (e) {} x.dispatchEvent(new Event('readystatechange')); x.dispatchEvent(new ProgressEvent('load')); x.dispatchEvent(new ProgressEvent('loadend')); try { x.onload && x.onload(); } catch (e) {} }, 0); };
  try { navigator.sendBeacon = function (u) { R.blocked.push('beacon ' + String(u).slice(0, 80)); return true; }; } catch (e) {}
  ['WebSocket', 'EventSource'].forEach(function (k) { window[k] = function () { throw new Error('ReUI replay: ' + k + ' disabled'); }; });
  window.open = function () { toast('Opening new windows is disabled in this replay.'); return null; };
  try { if (navigator.clipboard) navigator.clipboard.writeText = function () { toast('Copied (clipboard disabled in this replay).'); return Promise.resolve(); }; } catch (e) {}
  /* navigation guard */
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest && ev.target.closest('a[href]');
    if (!a) return; var href = getAttr.call(a, 'href') || '';
    if (/^#/.test(href)) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    var label = (a.getAttribute('aria-label') || a.textContent || 'This link').replace(/\s+/g, ' ').trim().slice(0, 48);
    toast(label + ' → opens reui.io' + (href.charAt(0) === '/' ? href.split('?')[0] : '') + ' (outside this replay)');
  }, true);
  document.addEventListener('submit', function (ev) { ev.preventDefault(); ev.stopImmediatePropagation(); toast('Forms are disabled in this replay.'); }, true);
  var pS = history.pushState, rS = history.replaceState;
  // keep router state, but never change the real address (reload-safe on file://, GitHub Pages, srcdoc)
  history.pushState = function (s, t) { try { return rS.call(history, s, t); } catch (e) {} };
  history.replaceState = function (s, t) { try { return rS.call(history, s, t); } catch (e) {} };
  window.__lrLocation = new URL(CHILD ? window.__lrPageKey : ORIGIN + '/blocks/data-grid/advanced');

  function runScripts(order) {
    for (var j = 0; j < order.length; j++) { var o = order[j], s = document.createElement('script'); for (var an in o.attrs) setAttr.call(s, an, o.attrs[an]); s.async = false; s.src = o.src; (document.body || document.documentElement).appendChild(s); }
  }
  function remapDom() {
    document.querySelectorAll('img').forEach(function (im) { var s = getAttr.call(im, 'src'); if (s && !/^(data|blob):/.test(s)) im.src = s; var ss = getAttr.call(im, 'srcset'); if (ss) setAttr.call(im, 'srcset', mapSrcset(ss)); });
    document.querySelectorAll('iframe').forEach(function (f) { var s = f.__lrPending || getAttr.call(f, 'src'); f.__lrPending = null; if (s && !/^(blob|about):/.test(s)) loadFrame(f, s); });
  }
  async function boot() {
    if (CHILD) { D = P.__lrD; blobs = P.__lrBlobs; imgs = P.__lrImgs; }
    else {
      var raw = Uint8Array.from(atob(window.RU_DATA), function (c) { return c.charCodeAt(0); }); window.RU_DATA = null;
      D = JSON.parse(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
      for (var k in D.scripts) blobs[k] = URL.createObjectURL(new Blob([D.scripts[k]], { type: 'text/javascript' }));
      for (var i in D.images) imgs[i] = 'data:' + (D.images[i].ct || 'image/png') + ';base64,' + D.images[i].b64;
      window.__lrD = D; window.__lrBlobs = blobs; window.__lrImgs = imgs; window.__lrFrames = frames;
    }
    ready = true; queue.splice(0).forEach(function (f) { f(); });
    remapDom();
    runScripts(CHILD ? D.pages[window.__lrPageKey].order : D.pages[D.main].order);
    R.ready = true;
  }
  var start = function () { boot().catch(function (e) { R.error = String(e && e.stack || e); }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}
window.__lrBootSrc = __lrBootMain.toString();
__lrBootMain();
