/* ============================================================
 *  Service Worker — Comisaría N° 47 (Mapa del Delito)
 *  Etapa 4 - PWA con offline avanzado
 *
 *  Estrategias de cache:
 *    1) App shell  (HTML, manifest, íconos)  → cache-first
 *    2) Libs CDN   (Leaflet, leaflet.heat, xlsx)  → cache-first
 *    3) Tiles OSM  → stale-while-revalidate + LRU (limit MAX_TILES)
 *    4) Otros same-origin  → cache-first con fallback a red
 *
 *  Subido a GitHub Pages:
 *    - Este archivo debe estar en la MISMA carpeta que index.html
 *    - El scope del SW será esa carpeta
 *  Sin backend ni servidor.
 * ============================================================ */

const CACHE_VERSION = "v6.0.0";
const APP_CACHE   = "c47-app-"   + CACHE_VERSION;
const LIBS_CACHE  = "c47-libs-"  + CACHE_VERSION;
const TILES_CACHE = "c47-tiles-" + CACHE_VERSION;

const MAX_TILES = 600;  // LRU: ~10-15 MB

// Recursos de la propia app (cargados en install)
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./firebase-config.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon-180.png",
  "./icons/favicon-32.png"
];

// Librerías CDN (intentamos cachearlas anticipadamente, si falla seguimos)
const LIBS = [
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js",
  "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
  // imágenes default de marker de Leaflet
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
];

/* === INSTALL === */
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    try {
      const appCache = await caches.open(APP_CACHE);
      // Usamos addAll con tolerancia: si alguno falla, igual seguimos
      for (const url of APP_SHELL) {
        try { await appCache.add(url); }
        catch (e) { console.warn("[SW] no se pudo precachear", url, e); }
      }
    } catch (e) { console.warn("[SW] error abriendo app cache", e); }

    try {
      const libsCache = await caches.open(LIBS_CACHE);
      for (const url of LIBS) {
        try {
          // mode no-cors permite cachear opaque responses
          const req = new Request(url, { mode: "no-cors" });
          const res = await fetch(req);
          if (res) await libsCache.put(req, res);
        } catch (e) { /* sin internet en install: seguimos */ }
      }
    } catch (e) { console.warn("[SW] error abriendo libs cache", e); }

    self.skipWaiting();
  })());
});

/* === ACTIVATE === */
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // limpiar caches viejos
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k.startsWith("c47-") && !k.endsWith(CACHE_VERSION))
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

/* === Helpers === */
function isOSMTile(url) {
  return /^[abc]?\.?tile\.openstreetmap\.org$/.test(url.hostname);
}

function isCDNLib(url) {
  return url.hostname === "unpkg.com" || url.hostname === "cdn.jsdelivr.net";
}

// Para que las 3 réplicas a/b/c.tile.openstreetmap.org compartan el mismo cache key
function normalizeTileURL(urlStr) {
  return urlStr.replace(/:\/\/[abc]\.tile\.openstreetmap\.org/, "://tile.openstreetmap.org");
}

async function trimTilesCache(cache) {
  try {
    const keys = await cache.keys();
    if (keys.length > MAX_TILES) {
      // FIFO simple: borramos los primeros N que excedan
      const excess = keys.length - MAX_TILES;
      for (let i = 0; i < excess; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch (e) {}
}

async function handleTile(req) {
  const cache = await caches.open(TILES_CACHE);
  const cacheKey = normalizeTileURL(req.url);
  const cached = await cache.match(cacheKey);

  if (cached) {
    // stale-while-revalidate: refrescar en background si hay red
    fetch(req).then(res => {
      if (res) cache.put(cacheKey, res.clone()).catch(() => {});
    }).catch(() => {});
    return cached;
  }

  // No estaba en cache: ir a la red, cachear, devolver
  try {
    const res = await fetch(req);
    if (res) {
      const cloned = res.clone();
      cache.put(cacheKey, cloned).then(() => trimTilesCache(cache)).catch(() => {});
    }
    return res;
  } catch (e) {
    // Offline y sin cache: tile transparente 1px
    return new Response(
      new Uint8Array([
        137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,
        0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,
        0,0,0,13,73,68,65,84,120,156,99,0,1,0,0,5,
        0,1,13,10,45,180,0,0,0,0,73,69,78,68,174,66,96,130
      ]),
      { headers: { "Content-Type": "image/png" }, status: 200 }
    );
  }
}

async function handleLib(req) {
  const cache = await caches.open(LIBS_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res) cache.put(req, res.clone()).catch(() => {});
    return res;
  } catch (e) {
    return new Response("/* offline */", {
      status: 503,
      headers: { "Content-Type": "application/javascript" }
    });
  }
}

async function handleAppShell(req) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(req);
  if (cached) {
    // refresco en background
    fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
    }).catch(() => {});
    return cached;
  }
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
    return res;
  } catch (e) {
    if (req.mode === "navigate") {
      const fallback = await cache.match("./index.html");
      if (fallback) return fallback;
    }
    return new Response("Sin conexión", { status: 503 });
  }
}


function isFirebaseAPI(url) {
  return url.hostname === "firestore.googleapis.com"
      || url.hostname === "identitytoolkit.googleapis.com"
      || url.hostname === "securetoken.googleapis.com"
      || url.hostname === "firebasestorage.googleapis.com"
      || url.hostname.endsWith(".firebaseio.com")
      || url.hostname.endsWith(".cloudfunctions.net")
      || url.hostname === "www.googleapis.com";
}

function isFirebaseSDK(url) {
  // SDK desde gstatic CDN: NO cacheamos para que siempre traiga la última
  // versión y para no inflar el cache. El navegador igual usa su HTTP cache.
  return url.hostname === "www.gstatic.com" && url.pathname.includes("/firebasejs/");
}

/* === FETCH === */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Firebase tiene su propio offline (IndexedDB). No interceptar.
  if (isFirebaseAPI(url)) return;
  if (isFirebaseSDK(url)) return;

  if (isOSMTile(url)) {
    event.respondWith(handleTile(req));
    return;
  }

  if (isCDNLib(url)) {
    event.respondWith(handleLib(req));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(handleAppShell(req));
    return;
  }
  // resto: dejar que el navegador maneje normal
});

/* === Mensajes desde la app === */
self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type === "PRECACHE_TILES" && Array.isArray(data.tiles)) {
    event.waitUntil(precacheTiles(data.tiles, event.source));
    return;
  }

  if (data.type === "GET_CACHE_INFO") {
    event.waitUntil(reportCacheInfo(event.source));
    return;
  }

  if (data.type === "CLEAR_TILES") {
    event.waitUntil((async () => {
      await caches.delete(TILES_CACHE);
      if (event.source) event.source.postMessage({ type: "TILES_CLEARED" });
    })());
    return;
  }

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
});

async function precacheTiles(tiles, source) {
  const cache = await caches.open(TILES_CACHE);
  let ok = 0, fail = 0;
  const total = tiles.length;
  let lastReport = 0;

  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i];
    const url = `https://tile.openstreetmap.org/${t.z}/${t.x}/${t.y}.png`;
    const cached = await cache.match(url);
    if (cached) { ok++; }
    else {
      try {
        const res = await fetch(url, { mode: "no-cors" });
        if (res) {
          await cache.put(url, res.clone());
          ok++;
        } else {
          fail++;
        }
      } catch (e) {
        fail++;
      }
    }
    // reporte cada ~10%
    const now = Date.now();
    if (source && (now - lastReport > 250 || i === tiles.length - 1)) {
      lastReport = now;
      source.postMessage({
        type: "PRECACHE_PROGRESS",
        done: i + 1, total, ok, fail
      });
    }
  }

  await trimTilesCache(cache);
  if (source) source.postMessage({ type: "PRECACHE_DONE", ok, fail, total });
}

async function reportCacheInfo(source) {
  if (!source) return;
  const result = { type: "CACHE_INFO", caches: {} };
  for (const name of [APP_CACHE, LIBS_CACHE, TILES_CACHE]) {
    try {
      const c = await caches.open(name);
      const keys = await c.keys();
      result.caches[name] = keys.length;
    } catch (e) {
      result.caches[name] = 0;
    }
  }
  // estimación de uso si está disponible
  if ("storage" in navigator && navigator.storage.estimate) {
    try {
      const est = await navigator.storage.estimate();
      result.usage = est.usage || 0;
      result.quota = est.quota || 0;
    } catch (e) {}
  }
  source.postMessage(result);
}
