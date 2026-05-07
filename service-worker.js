/* Service Worker — Comisaría N° 47 (Fase 7 v7.0.0) */
const CACHE_VERSION = "v7.2.1";
const APP_CACHE   = "c47-app-"   + CACHE_VERSION;
const LIBS_CACHE  = "c47-libs-"  + CACHE_VERSION;
const TILES_CACHE = "c47-tiles-" + CACHE_VERSION;

const MAX_TILES = 600;

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

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.endsWith(CACHE_VERSION)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Excluir Firebase de cache
  if (url.hostname.includes("firebaseio.com") ||
      url.hostname.includes("firebase.googleapis.com") ||
      url.hostname.includes("firestore.googleapis.com") ||
      url.hostname.includes("googleapis.com") ||
      url.hostname.includes("identitytoolkit") ||
      url.hostname.includes("securetoken") ||
      url.hostname.includes("firebaseapp.com")) {
    return;
  }

  if (req.method !== "GET") return;

  if (url.hostname.includes("tile.openstreetmap.org") ||
      url.hostname.includes("openstreetmap.fr")) {
    event.respondWith(handleTile(req));
    return;
  }

  if (url.hostname.includes("cdnjs.cloudflare.com") ||
      url.hostname.includes("unpkg.com") ||
      url.hostname.includes("cdn.jsdelivr.net")) {
    event.respondWith(handleLibs(req));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(handleApp(req));
    return;
  }
});

async function handleApp(req) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const resp = await fetch(req);
    if (resp.ok) cache.put(req, resp.clone());
    return resp;
  } catch (e) {
    return cached || new Response("Offline", { status: 503 });
  }
}

async function handleLibs(req) {
  const cache = await caches.open(LIBS_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const resp = await fetch(req);
    if (resp.ok) cache.put(req, resp.clone());
    return resp;
  } catch (e) {
    return cached || new Response("Lib offline", { status: 503 });
  }
}

async function handleTile(req) {
  const cache = await caches.open(TILES_CACHE);
  const cached = await cache.match(req);
  fetch(req).then(r => { if (r.ok) cache.put(req, r.clone()); enforceLRU(cache); }).catch(() => {});
  return cached || fetch(req);
}

async function enforceLRU(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_TILES) {
    for (let i = 0; i < keys.length - MAX_TILES; i++) await cache.delete(keys[i]);
  }
}
