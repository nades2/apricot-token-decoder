// Service worker offline-first. Ne contacte aucun serveur tiers, ne collecte rien.
const CACHE = "apricot-v1";
self.addEventListener("install", (e) => {
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok && new URL(req.url).origin === self.location.origin) cache.put(req, res.clone());
        return res;
      } catch {
        return cached || Response.error();
      }
    })
  );
});
