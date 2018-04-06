const CACHE = "readhn-v2";

// Open a cache and use `addAll()` with an array of assets to add all of them
// to the cache. Return a promise resolving when all the assets are added.
const precache = () => caches.open(CACHE).then(cache => cache.add("/"));

// Time limited network request. If the network fails or the response is not
// served before timeout, the promise is rejected.
const fromNetwork = (request, timeout) =>
  new Promise((fulfill, reject) => {
    // Reject in case of timeout.
    const timeoutId = setTimeout(reject, timeout);
    // Fulfill in case of success.
    fetch(request).then(response => {
      clearTimeout(timeoutId);
      const responseClone = response.clone();
      // Re-cache the latest version of the page
      caches.open(CACHE).then(cache => cache.put(request, responseClone));
      fulfill(response);
      // Reject also if network fetch rejects.
    }, reject);
  });

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
const fromCache = request =>
  caches
    .open(CACHE)
    .then(cache =>
      cache
        .match(request)
        .then(matching => matching || Promise.reject("no-match"))
    );

// On install, cache some resource.
self.addEventListener("install", evt => {
  console.log("The service worker is being installed.");

  // Ask the service worker to keep installing until the returning promise
  // resolves.
  evt.waitUntil(precache());
});

// On fetch, use cache but update the entry with the latest contents
// from the server.
self.addEventListener("fetch", evt => {
  console.log("The service worker is serving the asset.");

  if (!navigator.onLine) {
    return evt.respondWith(fromCache(evt.request));
  }

  // Try network and if it fails, go for the cached copy.
  evt.respondWith(
    fromNetwork(evt.request, 4000).catch(() => fromCache(evt.request))
  );
});
