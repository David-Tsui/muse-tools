import { ref, computed, type Ref } from 'vue'
import { getCssVarPx } from '../utils/dom'

export function usePianoHighlightDrag(
  $elem: Ref<HTMLElement | null>,
  whiteKeys: Ref<PianoKey[]>,
  highlightCount: Ref<number>,
  activeRange: Ref<{ start: string, end: string } | null>,
  emitUpdateActiveRangeKeys: (range: { start: string, end: string }) => void,
) {
  const keyWidth = ref(0)

  onMounted(() => {
    keyWidth.value = getCssVarPx($elem.value, '--white-key-width', 36) + getCssVarPx($elem.value, '--white-key-border-width', 2) * 2
  })

  const dragging = ref(false)
  const dragStartX = ref(0)
  const dragStartIdx = ref(0)

  const draggingRange = ref<{ startIdx: number, endIdx: number } | null>(null)

  function onHighlightMouseDown(e: { clientX: number }) {
    dragging.value = true
    dragStartX.value = e.clientX
    dragStartIdx.value = whiteKeys.value.findIndex(k => k.note === activeRange.value!.start)
    document.addEventListener('mousemove', onHighlightMouseMove)
    document.addEventListener('mouseup', onHighlightMouseUp)
  }

  function onHighlightMouseMove(e: { clientX: number } ) {
    if (!dragging.value) return

    const dx = e.clientX - dragStartX.value
    const moveKeys = Math.round(dx / keyWidth.value)
    let newStartIdx = dragStartIdx.value + moveKeys
    newStartIdx = Math.max(0, Math.min(whiteKeys.value.length - highlightCount.value, newStartIdx))

    draggingRange.value = {
      startIdx: newStartIdx,
      endIdx: newStartIdx + highlightCount.value - 1
    }
  }

  function onHighlightMouseUp() {
    dragging.value = false
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

  function onHighlightTouchMove(e: TouchEvent) {
    if (!dragging.value) return
    if (e.touches.length > 0) {
      onHighlightMouseMove(e.touches[0])
    }
  }
  function onHighlightTouchEnd(e: TouchEvent) {
    onHighlightMouseUp()
  }

  const highlightStyle = computed(() => {
    let startIdx: number
    if (draggingRange.value) {
      startIdx = draggingRange.value.startIdx
    } else if (activeRange.value) {
      startIdx = whiteKeys.value.findIndex(k => k.note ===
      activeRange.value?.start)
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
    const startIdx = whiteKeys.value.findIndex(k => k.note ===
      activeRange.value?.start)
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
    const startIdx = whiteKeys.value.findIndex(k => k.note ===
      activeRange.value?.start)
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
    dragging,
    draggingRange,
    onHighlightMouseDown,
    onHighlightTouchMove,
    onHighlightTouchEnd,
    highlightStyle,
    leftShadowStyle,
    rightShadowStyle
  }
}
