<template>
  <div class="piano-container">
    <h1 class="piano-title">🎹 Vue Piano</h1>
    <Spinner v-if="isAudioLoading">
      <template #loading-text>
        Loading piano sounds... ({{ loadedCount }}/{{ totalToLoad }})
      </template>
    </Spinner>
    <div class="piano-control-window">
      <PianoControlsWindow
        v-model="activeRangeKeys"
        :range-count="keyRangeCount"
      />
    </div>
    <PianoRangeInput
      v-model:active-range-keys="activeRangeKeys"
      v-model:range-count="keyRangeCount"
    />
    <PianoKeyboard
      :keys="keysAll"
      :activeNotes="activeNotes"
      :activeRangeKeys="activeRangeKeys"
      @play="playNote"
      @stop="stopNote"
      @key-mousedown="handleKeyMouseDown"
      @key-mouseenter="handleKeyMouseEnter"
      @key-mouseup="handleKeyMouseUp"
      @key-mouseleave="handleKeyMouseLeave"
    />
    <div class="current-notes">
      <div v-for="note in activeNotes" :key="note" class="note-display">
        {{ note }}
      </div>
    </div>
    <PianoControlsPanel
      :volume="volume"
      @play-scale="playScale"
      @play-chord="playChord"
      @stop-all="stopAll"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PianoKeyboard from './PianoKeyboard.vue'
import PianoControlsPanel from './PianoControlsPanel.vue'
import { keysAll, PIANO_AUDIO_SOURCES } from '../constant/piano'
import Spinner from './Spinner.vue'

const activeNotes = ref<string[]>([]);
const activeRangeKeys = ref<{ start: string, end: string }>({ start: 'C2', end: 'B7' })
const keyRangeCount = ref(42)
const volume = ref(0.5)
const mouseDown = ref(false)
const lastHoveredKey = ref<string | null>(null)

const audioMap = new Map<string, HTMLAudioElement>()
const isAudioLoading = ref(true)
const loadedCount = ref(0)
const totalToLoad = Object.values(PIANO_AUDIO_SOURCES).filter(Boolean).length

function preloadAllAudio() {
  loadedCount.value = 0
  isAudioLoading.value = true
  const promises: Promise<void>[] = []
  Object.entries(PIANO_AUDIO_SOURCES).forEach(([note, src]) => {
    if (src) {
      const audio = new Audio(src)
      audio.preload = 'auto'
      audio.oncanplaythrough = () => {
        loadedCount.value++
        if (loadedCount.value >= totalToLoad) {
          isAudioLoading.value = false
        }
      }
      audio.onerror = () => {
        loadedCount.value++
        if (loadedCount.value >= totalToLoad) {
          isAudioLoading.value = false
        }
      }
      audioMap.set(note, audio)
      // 強制觸發載入
      promises.push(audio.load?.() ?? Promise.resolve())
    }
  })
}

const playNote = (note: string) => {
  const audio = audioMap.get(note)
  if (!audio) return
  audio.currentTime = 0
  audio.volume = volume.value
  audio.play().catch(() => {})
  if (!activeNotes.value.includes(note)) {
    activeNotes.value.push(note)
  }
}

const stopNote = (note: string) => {
  const audio = audioMap.get(note)
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
  const index = activeNotes.value.indexOf(note)
  if (index > -1) {
    activeNotes.value.splice(index, 1)
  }
}

// Play a scale
const playScale = async () => {
  try {
    const scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
    await scale.reduce((prev, note) => {
      return prev.then(async () => {
        playNote(note)
        await new Promise(res => setTimeout(res, 150))
        stopNote(note)
      })
    }, Promise.resolve())
  } catch (error) {
    console.error('Error playing scale:', error)
  }
}

// Play a chord
const playChord = async () => {
  try {
    const chord = ['C4', 'E4', 'G4', 'C5']
    chord.forEach(note => {
      playNote(note)
      setTimeout(() => {
        stopNote(note)
      }, 1500)
    })
  } catch (error) {
    console.error('Error playing chord:', error)
  }
}

// Stop all notes
const stopAll = () => {
  activeNotes.value.forEach(note => {
    stopNote(note)
  })
  activeNotes.value = []
}

// Keyboard controls
const keyMap: { [key: string]: string } = {
  'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
  'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
  'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5',
  'p': 'D#5', ';': 'E5'
};

const handleKeyDown = (event: KeyboardEvent) => {
  const note = keyMap[event.key.toLowerCase()];
  if (note && !activeNotes.value.includes(note)) {
    playNote(note);
  }
};

const handleKeyUp = (event: KeyboardEvent) => {
  const note = keyMap[event.key.toLowerCase()];
  if (note) {
    stopNote(note);
  }
};

// Mouse event handlers for piano keys
const handleKeyMouseDown = async (note: string) => {
  mouseDown.value = true
  if (lastHoveredKey.value && lastHoveredKey.value !== note) {
    stopNote(lastHoveredKey.value)
  }
  lastHoveredKey.value = note
  await playNote(note)
}

const handleKeyMouseEnter = async (note: string) => {
  if (mouseDown.value && lastHoveredKey.value !== note) {
    if (lastHoveredKey.value) stopNote(lastHoveredKey.value)
    lastHoveredKey.value = note
    await playNote(note)
  }
}

const handleKeyMouseUp = (note: string) => {
  mouseDown.value = false
  stopNote(note)
  lastHoveredKey.value = null
}

const handleKeyMouseLeave = (note: string) => {
  if (mouseDown.value) {
    stopNote(note)
    lastHoveredKey.value = null
  }
}

function checkSWCacheStatusByMessage(): Promise<{ allCached: boolean, cachedCount: number, expectedCount: number }> {
  return new Promise(resolve => {
    if (!navigator.serviceWorker.controller) {
      resolve({ allCached: false, cachedCount: 0, expectedCount: 0 })
      return
    }
    // 設定回應監聽
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'SW_CACHE_STATUS') {
        resolve(event.data.payload)
      }
    }, { once: true })
    // 發送訊息給 SW
    navigator.serviceWorker.controller.postMessage({ type: 'CHECK_CACHE_STATUS' })
  })
}

async function checkAudioHasCache() {
  const allCached = await checkSWCacheStatusByMessage()

  if (allCached) {
    preloadAllAudio()
  } else {
    console.warn('Audio cache not fully loaded, preloading audio files...')
    preloadAllAudio()
  }
}

onMounted(() => {
  checkAudioHasCache()
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  // Add data attributes for animation targeting
  keysAll.forEach(key => {
    setTimeout(() => {
      const element = document.querySelector(`[data-note="${key.note}"]`);
      if (element) {
        element.setAttribute('data-note', key.note);
      }
    }, 100);
  });

  document.addEventListener('mouseup', () => {
    mouseDown.value = false
    if (lastHoveredKey.value) {
      stopNote(lastHoveredKey.value)
      lastHoveredKey.value = null
    }
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  document.removeEventListener('mouseup', () => {
    mouseDown.value = false
    if (lastHoveredKey.value) {
      stopNote(lastHoveredKey.value)
      lastHoveredKey.value = null
    }
  })
})
</script>

<style scoped>
.piano-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem 0;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.piano-title {
  text-align: center;
  color: white;
  font-size: 2.5em;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.piano-keyboard {
  padding: 20px;
}

.current-notes {
  text-align: center;
  margin-top: 30px;
  min-height: 40px;
}

.note-display {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  margin: 0 5px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
