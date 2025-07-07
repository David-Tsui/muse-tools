const CACHE_NAME = 'piano-audio-v3'
const AUDIO_BASE_URL = 'https://danigb.github.io/samples/splendid-grand-piano/'

self.addEventListener('fetch', event => {
  const url = event.request.url
  if (url.includes(AUDIO_BASE_URL)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(response =>
          response ||
          fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
        )
      )
    )
  }
})

self.addEventListener('message', async event => {
  if (event.data && event.data.type === 'CHECK_CACHE_STATUS') {
    const cache = await caches.open(CACHE_NAME)
    const keys = await cache.keys()
    event.source.postMessage({
      type: 'SW_CACHE_STATUS',
      payload: {
        cachedCount: keys.length,
        expectedCount: AUDIO_URLS.length,
        allCached: keys.length === AUDIO_URLS.length
      }
    })
  }
})
