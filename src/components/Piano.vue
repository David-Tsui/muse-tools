<template>
  <div class="piano-container">
    <h1 class="piano-title">🎹 Vue Piano</h1>
    <Spinner v-if="isAudioLoading">
      <template #loading-text>
        Loading piano sounds...
      </template>
    </Spinner>
    <div class="piano-control-window">
      <PianoControlsWindow
        v-model="activeRangeKeys"
        :range-count="activeRangeKeysCount"
      />
    </div>
    <PianoRangeInput
      v-model:active-range-keys="activeRangeKeys"
      v-model:range-count="activeRangeKeysCount"
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
      v-model:volume="volume"
      v-model:displayMode="displayMode"
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
import { KeyLabelDisplayMode, keysAll } from '../constant/piano'
import Spinner from './Spinner.vue'
import { useSmplr } from '../composables/useSmplr'

const activeNotes = ref<string[]>([])
const activeRangeKeysCount = ref(getInitialWhiteKeyCount())
const activeRangeKeys = ref<{ start: string, end: string }>( getActiveRangeKeys('C2', activeRangeKeysCount.value))
const volume = ref(0.5)
const displayMode = ref<KeyLabelDisplayMode>(KeyLabelDisplayMode.NAME)

provide<Ref<KeyLabelDisplayMode>>('displayMode', displayMode)

function getInitialWhiteKeyCount() {
  const width = window.innerWidth
  if (width < 500) return 8    // 手機
  if (width < 900) return 14   // 平板
  if (width < 1600) return 29  // 小型桌機
  return 42                    // 桌機
}

function getActiveRangeKeys(start: string, count: number) {
  const whiteKeys = keysAll.filter(k => k.type === 'white')
  const startIdx = whiteKeys.findIndex(k => k.note === start)
  const endIdx = Math.min(whiteKeys.length - 1, startIdx + count - 1)
  return {
    start: whiteKeys[startIdx]?.note ?? whiteKeys[0].note,
    end: whiteKeys[endIdx]?.note ?? whiteKeys[whiteKeys.length - 1].note,
  }
}

const mouseDown = ref(false)
const lastHoveredKey = ref<string | null>(null)

const isAudioLoading = ref(true)

const {
  play: smplrPlay,
  stop: smplrStop,
  isAudioLoaded,
} = useSmplr()

watch(isAudioLoaded, (loaded) => {
  isAudioLoading.value = !loaded
})

const playNote = (note: string) => {
  smplrPlay(note)
  if (activeNotes.value.includes(note))
    return
  activeNotes.value.push(note)
}

const stopNote = (note: string) => {
  smplrStop()
  const index = activeNotes.value.indexOf(note)
  if (index > -1) {
    activeNotes.value.splice(index, 1)
  }
}

async function playNotesSequence(notes: string[], interval: number = 500) {
  await notes.reduce(async (prev, note) => {
    await prev
    playNote(note)
    await new Promise(res => setTimeout(res, interval))
    stopNote(note)
  }, Promise.resolve())

  return
}

// Play a scale
const playScale = async (scaleNotes: string[]) => {
  try {
    await playNotesSequence(scaleNotes, 200)
    const reverseNotes = [...scaleNotes].reverse()
    reverseNotes.shift()
    await playNotesSequence(reverseNotes, 200)
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
  'p': 'D#5', ';': 'E5', '\'': 'F5',
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
const handleKeyMouseDown = (note: string) => {
  mouseDown.value = true
  if (lastHoveredKey.value && lastHoveredKey.value !== note) {
    stopNote(lastHoveredKey.value)
  }
  lastHoveredKey.value = note
  playNote(note)
}

const handleKeyMouseEnter = (note: string) => {
  if (!(mouseDown.value && lastHoveredKey.value !== note))
    return

  if (lastHoveredKey.value)
    stopNote(lastHoveredKey.value)

  lastHoveredKey.value = note
  playNote(note)
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

function resetActiveRange() {
  activeRangeKeysCount.value = getInitialWhiteKeyCount()
  activeRangeKeys.value = getActiveRangeKeys('C2', activeRangeKeysCount.value)
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  window.addEventListener('resize', resetActiveRange)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('resize', resetActiveRange)
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
  overflow: hidden;
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
