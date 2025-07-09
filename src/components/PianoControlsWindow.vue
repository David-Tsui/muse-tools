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
  margin: 0 auto;
  padding: 1rem 0;
  width: fit-content;
  max-width: 932px;
}
</style>
