<template>
  <div
    ref="keyboardRoot"
    class="piano-keyboard"
    :class="{ mini: pressDisabled }"
  >
    <!-- Highlight window -->
    <div
      v-if="activeRange && pressDisabled"
      class="highlight-window"
      :style="highlightStyle"
      @mousedown.stop="onHighlightMouseDown"
    ></div>
    <!-- Shadow overlays -->
    <div
      v-if="activeRange && pressDisabled"
      class="shadow-overlay left"
      :style="leftShadowStyle"
    ></div>
    <div
      v-if="activeRange && pressDisabled"
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
          :isActive="Boolean(activeNotes?.includes(key.note))"
          is-white
          :disabled="Boolean(pressDisabled)"
          :style="{ gridColumn: idx + 1 }"
          @on-mousedown="pressDisabled ? onKeySetActiveRangeStart(key.note) : onMouseDown(key.note)"
          @on-mouseenter="!pressDisabled && onMouseEnter(key.note)"
          @on-mouseup="!pressDisabled && onMouseUp(key.note)"
          @on-mouseleave="!pressDisabled && onMouseLeave(key.note)"
        />
      </div>
      <div class="piano-black-keys">
        <PianoKey
          v-for="(key) in octave.black"
          :key="key.note"
          :keyData="key"
          :isActive="Boolean(activeNotes?.includes(key.note))"
          :is-white="false"
          :disabled="Boolean(pressDisabled)"
          :style="{ gridColumn: getBlackKeyGridColumnInOctave(key.note), pointerEvents: pressDisabled ? 'auto' : undefined }"
          @on-mousedown="pressDisabled ? onKeySetActiveRangeStart(key.note) : onMouseDown(key.note)"
          @on-mouseenter="!pressDisabled && onMouseEnter(key.note)"
          @on-mouseup="!pressDisabled && onMouseUp(key.note)"
          @on-mouseleave="!pressDisabled && onMouseLeave(key.note)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { keysAll, keysDimension } from '../constant/piano'
import { debounce } from 'lodash-es'
import { usePianoHighlightDrag } from '../composables/usePianoHighlightDrag'
import PianoKey from './PianoKey.vue';

const props = withDefaults(defineProps<{
  keys: PianoKey[]
  activeNotes?: string[]
  activeRangeKeys?: { start: string, end: string }
  highlightCount?: number // 用於高亮區域的鍵數量
  pressDisabled?: boolean // 是否禁用按鍵事件
}>(), {
  highlightCount: 42,
  pressDisabled: false
})

const emit = defineEmits([
  'key-mousedown', 'key-mouseenter', 'key-mouseup', 'key-mouseleave',
  'update:activeRangeKeys'
])

function onMouseDown(note: string) { emit('key-mousedown', note) }
function onMouseEnter(note: string) { emit('key-mouseenter', note) }
function onMouseUp(note: string) { emit('key-mouseup', note) }
function onMouseLeave(note: string) { emit('key-mouseleave', note) }

const keyWidth = keysDimension.white.width
const currentKeyDimension = computed(() => {
  return props.pressDisabled
    ? { white: keysDimension.white.mini, black: keysDimension.black.mini }
    : { white: keysDimension.white, black: keysDimension.black }
})
const whiteKeyWidth = computed(() => currentKeyDimension.value.white.width + 'px')
const whiteKeyHeight = computed(() => currentKeyDimension.value.white.height + 'px')
const whiteKeyBorderWidth = computed(() => currentKeyDimension.value.white.borderWidth + 'px')
const blackKeyWidth = computed(() => currentKeyDimension.value.black.width + 'px')
const blackKeyHeight = computed(() => currentKeyDimension.value.black.height + 'px')

const whiteKeys = computed(() => props.keys.filter(k => k.type === 'white'))

const activeRange  = ref<{ start: string, end: string } | null>(props.activeRangeKeys || null)

watch(() => props.activeRangeKeys, (newRange) => {
  if (newRange) {
    activeRange.value = { start: newRange.start, end: newRange.end }
  } else {
    activeRange.value = null
  }
}, {  deep: true })

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

const octaves = computed(() => {
  return splitKeysByOctave(keysAll)
})

// 黑鍵在 octave 內的 grid column
function getBlackKeyGridColumnInOctave(note: PianoKey['note']) {
  const columnMap = {
    'C#': 7, 'D#': 12, 'F#': 26, 'G#': 31, 'A#': 36
  }

  const key = note.slice(0, 2) as keyof typeof columnMap
  return columnMap[key] || 1
}

const currentWhiteKeyWidth = computed(() => {
  const { width, borderWidth } = currentKeyDimension.value.white
  return width + borderWidth * 2
})

const currentKeyboardWidth = computed(() => {
  if (!activeRange.value)
    return whiteKeys.value.length * currentWhiteKeyWidth.value + 'px'

  const startIdx = getWhiteKeyIndex(activeRange.value.start)
  const endIdx = getWhiteKeyIndex(activeRange.value.end)
  const count = endIdx - startIdx + 1
  return `${count * currentWhiteKeyWidth.value}px`
})

const keyboardRoot = ref<HTMLElement | null>(null)

const activeStartWhiteKeyIdx = computed(() => {
  if (!activeRange.value)
    return 0
  return getWhiteKeyIndex(activeRange.value.start)
})

// 計算需要平移的 px 數
const octaveTranslateX = computed(() => {
  if (props.pressDisabled)
    return 0
  return -(activeStartWhiteKeyIdx.value * currentWhiteKeyWidth.value) + 'px'
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
  if (!props.pressDisabled) return

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
  getWhiteKeyIndex,
  whiteKeys,
  toRef(() => props.highlightCount),
  currentWhiteKeyWidth,
  activeRange,
  emitUpdateActiveRangeKeys,
  keyWidth
)
</script>

<style lang="scss" scoped>
.piano-keyboard {
  --white-key-width: v-bind(whiteKeyWidth);
  --white-key-height: v-bind(whiteKeyHeight);
  --white-key-border-width: v-bind(whiteKeyBorderWidth);
  --black-key-width: v-bind(blackKeyWidth);
  --black-key-height: v-bind(blackKeyHeight);
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

  &.mini {
    width: unset;
  }
}

.piano-keyboard.mini {
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

.piano-key:is(:not(.mini *)) {
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
  }
  &:active {
    transform: translateY(3px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  }
}
</style>
