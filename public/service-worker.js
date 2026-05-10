const APP_CACHE = "weathering-with-you-app-v1";
const WEATHER_CACHE = "weathering-with-you-weather-v1";
const APP_SHELL = ["/", "/index.html", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![APP_CACHE, WEATHER_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;

  if (url.pathname.startsWith("/api/v1/weather/")) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(WEATHER_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw _error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const cache = await caches.open(APP_CACHE);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}
