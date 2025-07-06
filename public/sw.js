const CACHE_NAME = 'piano-audio-v1'
const AUDIO_URLS = [
  'https://cdn.freesound.org/previews/448/448579_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448573_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448565_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448544_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448540_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448606_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448542_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448616_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448581_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448586_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448557_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448591_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448578_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448572_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448564_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448547_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448541_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448607_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448600_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448615_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448588_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448587_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448558_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448590_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448563_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448571_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448569_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448546_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448538_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448608_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448601_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448614_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448589_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448584_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448559_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448593_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448562_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448570_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448568_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448549_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448539_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448609_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448602_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448613_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448595_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448585_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448552_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448592_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448561_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448577_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448536_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448548_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448532_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448619_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448603_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448612_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448594_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448582_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448553_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448599_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448560_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448576_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448537_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448551_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448533_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448618_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448604_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448611_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448597_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448583_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448554_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448598_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448567_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448575_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448534_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448550_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448545_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448617_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448605_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448610_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448596_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448580_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448555_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448556_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448566_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448574_9311684-lq.mp3',
  'https://cdn.freesound.org/previews/448/448535_9311684-lq.mp3',
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
