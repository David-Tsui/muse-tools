<template>
  <div class="piano-keyboard">
    <PianoKey
      v-for="key in keys"
      :key="key.note"
      :note="key.note"
      :type="key.type"
      :label="key.label"
      :style="key.style"
      :active="activeNotes.includes(key.note)"
      @mousedown.native="onMouseDown(key.note)"
      @mouseenter.native="onMouseEnter(key.note)"
      @mouseup.native="onMouseUp(key.note)"
      @mouseleave.native="onMouseLeave(key.note)"
      @down="onPlay"
      @up="onStop"
    />
  </div>
</template>

<script setup lang="ts">
import PianoKey from './PianoKey.vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  keys: Array<{ note: string, type: 'white' | 'black', label: string, style?: Record<string, string> }>
  activeNotes: string[]
}>()

const emit = defineEmits(['play', 'stop', 'key-mousedown', 'key-mouseenter', 'key-mouseup', 'key-mouseleave'])

function onPlay(note: string) {
  emit('play', note)
}
function onStop(note: string) {
  emit('stop', note)
}
function onMouseDown(note: string) {
  emit('key-mousedown', note)
}
function onMouseEnter(note: string) {
  emit('key-mouseenter', note)
}
function onMouseUp(note: string) {
  emit('key-mouseup', note)
}
function onMouseLeave(note: string) {
  emit('key-mouseleave', note)
}
</script>
