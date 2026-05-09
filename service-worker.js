/* Service Worker — Comisaría N° 47 — v8.0.1 (auto-update) */
const CACHE_VERSION = "v8.6.3";
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
    // Notificar a todas las pestañas que hay versión nueva
    const allClients = await self.clients.matchAll({ type: "window" });
    allClients.forEach(client => {
      client.postMessage({ type: "SW_UPDATED", version: CACHE_VERSION });
    });
  })());
});

// Mensaje de la app: "saltá la espera y activate ya"
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
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
    // Para HTML usamos network-first (siempre intentar versión nueva)
    if (req.destination === "document" || req.url.endsWith("/") || req.url.endsWith(".html")) {
      event.respondWith(handleHtmlNetworkFirst(req));
      return;
    }
    event.respondWith(handleApp(req));
    return;
  }
});

async function handleHtmlNetworkFirst(req) {
  // Network-first: intenta traer la versión nueva siempre.
  // Si falla (offline), sirve la cacheada.
  const cache = await caches.open(APP_CACHE);
  try {
    const fresh = await fetch(req, { cache: "no-store" });
    if (fresh.ok) {
      cache.put(req, fresh.clone());
      return fresh;
    }
  } catch (e) { /* offline */ }
  const cached = await cache.match(req);
  return cached || new Response("Sin conexión y sin cache", { status: 503 });
}

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
