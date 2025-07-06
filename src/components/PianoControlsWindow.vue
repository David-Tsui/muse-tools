<template>
  <div class="piano-control-window">
    <PianoKeyboard
      v-model:activeRangeKeys="modelValue"
      :keys="keysAll"
      :press-disabled="true"
    />
  </div>
</template>

<script setup lang="ts">
import { keysAll } from '../constant/piano'

const props = defineProps({
  modelValue: {
    type: Object as () => { start: string; end: string },
    default: () => ({ start: 'C3', end: 'E5' })
  }
})

const emit = defineEmits(['update:modelValue'])

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<style scoped>
.piano-control-window {
  width: 92vw;
  min-width: 600px;
  max-width: 932px;
  height: 160px;
  margin: 0 auto;
}
</style>
