const CACHE_NAME = 'piano-audio-v2'
const AUDIO_URLS = [
  '/sound/A0.mp3',
  '/sound/As0.mp3',
  '/sound/B0.mp3',
  '/sound/C1.mp3',
  '/sound/Cs1.mp3',
  '/sound/D1.mp3',
  '/sound/Ds1.mp3',
  '/sound/E1.mp3',
  '/sound/F1.mp3',
  '/sound/Fs1.mp3',
  '/sound/G1.mp3',
  '/sound/Gs1.mp3',
  '/sound/A1.mp3',
  '/sound/As1.mp3',
  '/sound/B1.mp3',
  '/sound/C2.mp3',
  '/sound/Cs2.mp3',
  '/sound/D2.mp3',
  '/sound/Ds2.mp3',
  '/sound/E2.mp3',
  '/sound/F2.mp3',
  '/sound/Fs2.mp3',
  '/sound/G2.mp3',
  '/sound/Gs2.mp3',
  '/sound/A2.mp3',
  '/sound/As2.mp3',
  '/sound/B2.mp3',
  '/sound/C3.mp3',
  '/sound/Cs3.mp3',
  '/sound/D3.mp3',
  '/sound/Ds3.mp3',
  '/sound/E3.mp3',
  '/sound/F3.mp3',
  '/sound/Fs3.mp3',
  '/sound/G3.mp3',
  '/sound/Gs3.mp3',
  '/sound/A3.mp3',
  '/sound/As3.mp3',
  '/sound/B3.mp3',
  '/sound/C4.mp3',
  '/sound/Cs4.mp3',
  '/sound/D4.mp3',
  '/sound/Ds4.mp3',
  '/sound/E4.mp3',
  '/sound/F4.mp3',
  '/sound/Fs4.mp3',
  '/sound/G4.mp3',
  '/sound/Gs4.mp3',
  '/sound/A4.mp3',
  '/sound/As4.mp3',
  '/sound/B4.mp3',
  '/sound/C5.mp3',
  '/sound/Cs5.mp3',
  '/sound/D5.mp3',
  '/sound/Ds5.mp3',
  '/sound/E5.mp3',
  '/sound/F5.mp3',
  '/sound/Fs5.mp3',
  '/sound/G5.mp3',
  '/sound/Gs5.mp3',
  '/sound/A5.mp3',
  '/sound/As5.mp3',
  '/sound/B5.mp3',
  '/sound/C6.mp3',
  '/sound/Cs6.mp3',
  '/sound/D6.mp3',
  '/sound/Ds6.mp3',
  '/sound/E6.mp3',
  '/sound/F6.mp3',
  '/sound/Fs6.mp3',
  '/sound/G6.mp3',
  '/sound/Gs6.mp3',
  '/sound/A6.mp3',
  '/sound/As6.mp3',
  '/sound/B6.mp3',
  '/sound/C7.mp3',
  '/sound/Cs7.mp3',
  '/sound/D7.mp3',
  '/sound/Ds7.mp3',
  '/sound/E7.mp3',
  '/sound/F7.mp3',
  '/sound/Fs7.mp3',
  '/sound/G7.mp3',
  '/sound/Gs7.mp3',
  '/sound/A7.mp3',
  '/sound/As7.mp3',
  '/sound/B7.mp3',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(AUDIO_URLS))
  )
})

self.addEventListener('fetch', event => {
  const url = event.request.url
  if (AUDIO_URLS.some(audioUrl => url.includes(audioUrl))) {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
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
