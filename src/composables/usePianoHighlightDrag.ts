import { ref, computed, type Ref } from 'vue'
import { getCssVarPx } from '../utils/dom'

export function usePianoHighlightDrag(
  $elem: Ref<HTMLElement | null>,
  getWhiteKeyIndex: (note: string) => number,
  whiteKeys: Ref<PianoKey[]>,
  highlightCount: Ref<number>,
  activeRange: Ref<{ start: string, end: string } | null>,
  emitUpdateActiveRangeKeys: (range: { start: string, end: string }) => void,
) {
  const keyWidth = ref(0)

  onMounted(() => {
    keyWidth.value = getCssVarPx($elem.value, '--white-key-width', 36) + getCssVarPx($elem.value, '--white-key-border-width', 2) * 2
  })

  let dragging = false
  let dragStartX = 0
  let dragStartIdx = 0

  const draggingRange = ref<{ startIdx: number, endIdx: number } | null>(null)

  function onHighlightMouseDown(e: MouseEvent) {
    dragging = true
    dragStartX = e.clientX
    dragStartIdx = getWhiteKeyIndex(activeRange.value!.start)
    document.addEventListener('mousemove', onHighlightMouseMove)
    document.addEventListener('mouseup', onHighlightMouseUp)
  }

  function onHighlightMouseMove(e: MouseEvent) {
    if (!dragging) return
    const dx = e.clientX - dragStartX
    const moveKeys = Math.round(dx / keyWidth.value)
    let newStartIdx = dragStartIdx + moveKeys
    newStartIdx = Math.max(0, Math.min(whiteKeys.value.length - highlightCount.value, newStartIdx))
    draggingRange.value = {
      startIdx: newStartIdx,
      endIdx: newStartIdx + highlightCount.value - 1
    }
  }

  function onHighlightMouseUp() {
    dragging = false
    document.removeEventListener('mousemove', onHighlightMouseMove)
    document.removeEventListener('mouseup', onHighlightMouseUp)

    if (draggingRange.value) {
      const newStart = whiteKeys.value[draggingRange.value.startIdx].note
      const newEnd = whiteKeys.value[draggingRange.value.endIdx].note
      activeRange.value = { start: newStart, end: newEnd }
      emitUpdateActiveRangeKeys({ start: newStart, end: newEnd })
      draggingRange.value = null
    }
  }

  const highlightStyle = computed(() => {
    let startIdx: number
    if (draggingRange.value) {
      startIdx = draggingRange.value.startIdx
    } else if (activeRange.value) {
      startIdx = getWhiteKeyIndex(activeRange.value.start)
    } else {
      return {}
    }
    const pianoLeftPadding = $elem.value
      ? parseFloat(getComputedStyle($elem.value).paddingLeft)
      : 0
    const left = `calc(${startIdx} * ${keyWidth.value}px + ${pianoLeftPadding}px)`
    const width = `calc(${highlightCount.value} * ${keyWidth.value}px)`

    return {
      left,
      width,
    }
  })

  const leftShadowStyle = computed(() => {
    if (!activeRange.value) return {}
    const startIdx = getWhiteKeyIndex(activeRange.value.start)
    const pianoLeftPadding = $elem.value
      ? parseFloat(getComputedStyle($elem.value).paddingLeft)
      : 0
    const width = `calc(${startIdx} * ${keyWidth.value}px + ${pianoLeftPadding}px)`

    return {
      left: 0,
      width,
    }
  })

  const rightShadowStyle = computed(() => {
    if (!activeRange.value) return {}
    const startIdx = getWhiteKeyIndex(activeRange.value.start)
    const pianoLeftPadding = $elem.value
      ? parseFloat(getComputedStyle($elem.value).paddingLeft)
      : 0
    const whiteKeysCount = whiteKeys.value.length - startIdx - highlightCount.value
    const left = `calc(${startIdx} * ${keyWidth.value}px + ${pianoLeftPadding}px + ${highlightCount.value} * ${keyWidth.value}px)`
    const width = `calc(${whiteKeysCount} * ${keyWidth.value}px)`

    return {
      left,
      width,
    }
  })

  return {
    draggingRange,
    onHighlightMouseDown,
    highlightStyle,
    leftShadowStyle,
    rightShadowStyle
  }
}
