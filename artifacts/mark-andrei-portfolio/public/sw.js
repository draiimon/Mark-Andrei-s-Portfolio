const CACHE_NAME = "mark-andrei-static-v2";
const MEDIA_PATHS = ["/assets/", "/uploads/"];
const CACHEABLE_DESTINATIONS = new Set(["script", "style", "font", "image", "video", "audio"]);

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isCacheable(request, url) {
  return (
    request.method === "GET" &&
    url.origin === self.location.origin &&
    !url.pathname.startsWith("/api/") &&
    !url.pathname.endsWith("/sw.js") &&
    (MEDIA_PATHS.some((path) => url.pathname.startsWith(path)) ||
      CACHEABLE_DESTINATIONS.has(request.destination))
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (!isCacheable(request, url)) return;

  const isMedia = MEDIA_PATHS.some((path) => url.pathname.startsWith(path));
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const refresh = fetch(request)
        .then((response) => {
          if (response.ok) void cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);

      return isMedia && cached ? cached : cached ? cached : refresh;
    }),
  );
});