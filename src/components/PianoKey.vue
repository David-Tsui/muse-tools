<template>
  <div
    :class="['key', type + '-key', { active }]"
    :style="style"
    :data-note="note"
    @mousedown="onDown"
    @mouseenter="onEnter"
    @mouseup="onUp"
    @mouseleave="onLeave"
  >
    <div class="key-label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  note: string
  type: 'white' | 'black'
  label: string
  style?: Record<string, string>
  active: boolean
}>()

const emit = defineEmits(['down', 'up', 'enter', 'leave'])

function onDown() {
  emit('down', props.note)
}
function onUp() {
  emit('up', props.note)
}
function onEnter() {
  emit('enter', props.note)
}
function onLeave() {
  emit('leave', props.note)
}
</script>
