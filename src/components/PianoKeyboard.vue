<template>
  <div
    ref="keyboardRoot"
    class="piano-keyboard"
    :class="{ 'minimap': miniMap }"
  >
    <!-- Highlight window -->
    <div
      v-if="activeRange && miniMap"
      class="highlight-window"
      :style="highlightStyle"
      @mousedown.stop="onHighlightMouseDown"
    ></div>
    <!-- Shadow overlays -->
    <div
      v-if="activeRange && miniMap"
      class="shadow-overlay left"
      :style="leftShadowStyle"
    ></div>
    <div
      v-if="activeRange && miniMap"
      class="shadow-overlay right"
      :style="rightShadowStyle"
    ></div>

    <!-- Octave grids -->
    <div
      v-for="(octave, octaveIdx) in octaves"
      class="piano-octave"
      :key="octaveIdx"
    >
      <div class="piano-white-keys">
        <PianoKey
          v-for="(key, idx) in octave.white"
          :key="key.note"
          :keyData="key"
          is-white
          :isActive="isNoteActive(key)"
          :disabled="Boolean(miniMap)"
          :style="{ gridColumn: idx + 1 }"
          @mousedown="miniMap ? onKeySetActiveRangeStart(key.note) : onMouseDown(key.note)"
          @mouseenter="!miniMap && onMouseEnter(key.note)"
          @mouseup="!miniMap && onMouseUp(key.note)"
          @mouseleave="!miniMap && onMouseLeave(key.note)"
          @touchstart="(e: TouchEvent) => onTouchStart(e, key.note)"
          @touchend="(e: TouchEvent) => onTouchEnd(e, key.note)"
          @touchmove="(e: TouchEvent) => onTouchMove(e, key.note)"
        />
      </div>
      <div class="piano-black-keys">
        <PianoKey
          v-for="(key) in octave.black"
          :key="key.note"
          :keyData="key"
          :isActive="isNoteActive(key)"
          :is-white="false"
          :disabled="Boolean(miniMap)"
          :style="{ gridColumn: getBlackKeyGridColumnInOctave(key.note), pointerEvents: miniMap ? 'auto' : undefined }"
          @mousedown="miniMap ? onKeySetActiveRangeStart(key.note) : onMouseDown(key.note)"
          @mouseenter="!miniMap && onMouseEnter(key.note)"
          @mouseup="!miniMap && onMouseUp(key.note)"
          @mouseleave="!miniMap && onMouseLeave(key.note)"
          @touchstart="(e: TouchEvent) => onTouchStart(e, key.note)"
          @touchend="(e: TouchEvent) => onTouchEnd(e, key.note)"
          @touchmove="(e: TouchEvent) => onTouchMove(e, key.note)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { keysAll } from '../constant/piano'
import { debounce } from 'lodash-es'
import { usePianoHighlightDrag } from '../composables/usePianoHighlightDrag'
import PianoKey from './PianoKey.vue'
import { getCssVarPx } from '../utils/dom'
import { useTonal } from '../composables/useTonal'

const props = withDefaults(defineProps<{
  keys: PianoKey[]
  activeNotes?: string[]
  activeRangeKeys?: { start: string, end: string }
  highlightCount?: number // 用於高亮區域的鍵數量
  miniMap?: boolean // 是否為小型鍵盤視圖
}>(), {
  highlightCount: 42,
  miniMap: false
})

const emit = defineEmits([
  'key-mousedown',
  'key-mouseenter',
  'key-mouseup',
  'key-mouseleave',
  'update:activeRangeKeys'
])

const keyboardRoot = ref<HTMLElement | null>(null)
// 新增一個 ref 來追蹤 touch 移動時的上一個 note
const lastTouchedNote = ref<string | null>(null)

// 其餘事件維持不變
function onMouseDown(note: string) { emit('key-mousedown', note) }
function onMouseEnter(note: string) { emit('key-mouseenter', note) }
function onMouseUp(note: string) { emit('key-mouseup', note) }
function onMouseLeave(note: string) { emit('key-mouseleave', note) }

function onTouchStart(e: TouchEvent, note: string) {
  e.preventDefault()
  emit('key-mousedown', note)
}
function onTouchEnd(e: TouchEvent, note: string) {
  e.preventDefault()
  emit('key-mouseup', lastTouchedNote.value || note)
}

function onTouchMove(e: TouchEvent, startNote: string) {
  e.preventDefault()
  if (props.miniMap) return

  // 取得觸控點下的元素
  const touch = e.touches[0]
  if (!touch) return

  const elem = document.elementFromPoint(touch.clientX, touch.clientY)

  if (elem && elem instanceof HTMLElement && elem.dataset.note) {
    const note = elem.dataset.note
    if (note !== lastTouchedNote.value) {
      lastTouchedNote.value = note
      emit('key-mouseenter', note)
    }
  } else {
    lastTouchedNote.value = null
  }
}
 const keyWidth = getCssVarPx(keyboardRoot.value, '--white-key-width', 36) + getCssVarPx(keyboardRoot.value, '--white-key-border-width', 2) * 2

const activeRange  = ref<{ start: string, end: string } | null>(props.activeRangeKeys || null)

watch(() => props.activeRangeKeys, (newRange) => {
  if (newRange) {
    activeRange.value = { start: newRange.start, end: newRange.end }
  } else {
    activeRange.value = null
  }
}, {  deep: true })

const whiteKeys = computed(() => props.keys.filter(k => k.type === 'white'))

function getWhiteKeyIndex(note: string) {
  return whiteKeys.value.findIndex(k => k.note === note)
}

function splitKeysByOctave(keys: PianoKey[]) {
  // 以 C 開頭分組
  const octaves: Array<{ white: PianoKey[], black: PianoKey[] }> = []
  let currentOctave: { white: PianoKey[], black: PianoKey[] } = { white: [], black: [] }

  keys.forEach(key => {
    if (key.note.match(/^C\d/)) { // scC1, C2, C3, etc.
      if (currentOctave.white.length || currentOctave.black.length) {
        octaves.push(currentOctave)
      }
      currentOctave = { white: [], black: [] }
    }

    if (key.type === 'white') {
      currentOctave.white.push(key)
    } else {
      currentOctave.black.push(key)
    }
  })

  if (currentOctave.white.length || currentOctave.black.length) {
    octaves.push(currentOctave)
  }

  return octaves
}

const octaves = computed(() => splitKeysByOctave(keysAll))

// 黑鍵在 octave 內的 grid column 定位
function getBlackKeyGridColumnInOctave(note: PianoKey['note']) {
  const columnMap = {
    'C#': 7, 'D#': 12, 'F#': 26, 'G#': 31, 'A#': 36
  }

  const key = note.slice(0, 2) as keyof typeof columnMap
  return columnMap[key] || 1
}

const currentKeyboardWidth = computed(() => {
  if (!activeRange.value)
    return `calc(${whiteKeys.value.length} * ${keyWidth})`

  const startIdx = getWhiteKeyIndex(activeRange.value.start)
  const endIdx = getWhiteKeyIndex(activeRange.value.end)
  const count = endIdx - startIdx + 1
  return `calc(${count * keyWidth}px)`
})

const activeStartWhiteKeyIdx = computed(() => {
  if (!activeRange.value)
    return 0
  return getWhiteKeyIndex(activeRange.value.start)
})

// 計算需要平移的 px 數
const octaveTranslateX = computed(() => {
  if (props.miniMap)
    return 0
  return -(activeStartWhiteKeyIdx.value * keyWidth) + 'px'
})

// 將 emit update:activeRangeKeys 包一層 debounce
const emitUpdateActiveRangeKeys = debounce(
  (range: { start: string, end: string }) => {
    emit('update:activeRangeKeys', range)
  },
  200,
  { leading: false, trailing: true }
)

function onKeySetActiveRangeStart(note: string) {
  if (!props.miniMap) return

  const whiteNote = note.replace(/#/, '') // 去掉黑鍵的 # 符號
  let startIdx = getWhiteKeyIndex(whiteNote)
  const newEndIdx = startIdx + props.highlightCount - 1

  // 如果 startIdx + highlightCount 超過白鍵數量，則將 startIdx 調整到最後一個白鍵
  if (newEndIdx >= whiteKeys.value.length) {
    startIdx = whiteKeys.value.length - props.highlightCount
  }

  const start = whiteKeys.value[startIdx].note
  const end = newEndIdx < whiteKeys.value.length
    ? whiteKeys.value[newEndIdx].note
    : whiteKeys.value[whiteKeys.value.length - 1].note

  emit('update:activeRangeKeys', { start, end })
}

const {
  onHighlightMouseDown,
  highlightStyle,
  leftShadowStyle,
  rightShadowStyle,
} = usePianoHighlightDrag(
  keyboardRoot,
  whiteKeys,
  toRef(() => props.highlightCount),
  activeRange,
  emitUpdateActiveRangeKeys,
)

const { getSimplifiedNote } = useTonal()

function isNoteActive(key: PianoKey): boolean {
  if (!props.activeNotes)
    return false

  return props.activeNotes.some(note => {
    return (
      note === key.enharmonic ||
      getSimplifiedNote(note) === key.note
    )
  })
}
</script>

<style lang="scss" scoped>
.piano-keyboard {
  --white-key-width: 36px;
  --white-key-height: 160px;
  --white-key-border-width: 2px;
  --black-key-width: 20px;
  --black-key-height: 95px;
  --white-key-label-color: #2c3e50;
  --black-key-label-color: #ecf0f1;
  --keyboard-translate-x: v-bind(octaveTranslateX);
  --keyboard-width: v-bind(currentKeyboardWidth);

  display: flex;
  position: relative;
  width: var(--keyboard-width);
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: hidden;
  white-space: nowrap;
  background: #2c3e50;
  padding: 10px 6px;
  border-radius: 10px;
  box-shadow: inset 0 5px 15px rgba(0, 0, 0, 0.3);
}

.piano-keyboard.minimap {
  --scale-ratio: 0.4;
  --white-key-width: 14.4px; /* 36px * 0.4 */
  --white-key-height: 64px; /* 160px * 0.4 */
  --black-key-width: 8px; /* 20px * 0.4 */
  --black-key-height: 38px; /* 95px * 0.4 */

  width: unset;

  .piano-key--white {
    border-radius: 0 0 4px 4px;
  }
  .piano-key--black {
    border-radius: 0 0 3px 3px;
  }
  .piano-key__label {
    font-size: 10px;
  }
}

@media (max-width: 768px) {
  .piano-keyboard:not(.mini) {
    --white-key-width: 48px;
    --black-key-width: 28px;
  }
}

.piano-keyboard .highlight-window {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(255,255,255,0.18);
  border: 2px solid #fff;
  border-radius: 6px;
  z-index: 3;
  cursor: grab;
  transition: left 0.08s;
}
.piano-keyboard .shadow-overlay {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(0,0,0,0.45);
  z-index: 4;
  pointer-events: none;

  &.left {
    left: 0;
  }
  &.right {
    right: 0;
  }
}

.piano-octave {
  display: flex;
  flex-direction: column;
  position: relative;
  transform: translateX(var(--keyboard-translate-x));
  transition: transform 0.12s cubic-bezier(.4,0,.2,1);
  will-change: transform;
}

.piano-white-keys {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
  width: 100%;
  z-index: 1;
}

.piano-black-keys {
  display: grid;
  grid-template-columns: repeat(42, 1fr);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
