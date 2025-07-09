<template>
  <div class="piano-control-window">
    <PianoKeyboard
      v-model:activeRangeKeys="modelValue"
      :keys="keysAll"
      :highlight-count="props.rangeCount"
      mini-map
    />
  </div>
</template>

<script setup lang="ts">
import { keysAll } from '../constant/piano'

const props = withDefaults(
  defineProps<{
    modelValue: {
      start: string
      end: string
    }
    rangeCount?: number
  }>(),
  {
    rangeCount: 14
  }
)

const emit = defineEmits(['update:modelValue'])

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<style scoped>
.piano-control-window {
  width: fit-content;
  min-width: 600px;
  max-width: 932px;
  height: 160px;
  margin: 0 auto;
}
</style>
