<template>
  <!-- activeRangeKeys 控制 input：只輸入 start，key count 可調整，end 自動計算且 readonly -->
    <div
      class="active-range-inputs"
      style="margin-bottom: 16px;
      text-align: center;"
    >
      <label>
        Start:
        <input
          v-model="inputStart"
          @change="onActiveRangeInputChange"
          maxlength="3"
        />
      </label>
      <label>
        Key count:
        <input
          type="number"
          v-model.number="keyRangeCount"
          min="7"
          max="88"
          @change="onActiveRangeInputChange"
        />
      </label>
      <label>
        End:
        <input
          :value="inputEnd"
          readonly
        />
      </label>
    </div>
</template>

<script setup lang="ts">
import { keysAll } from '../constant/piano';

const props = withDefaults(
  defineProps<{
    activeRangeKeys: {
      start: string;
      end: string;
    };
    rangeCount?: number;
  }>(),
  {
    rangeCount: 14
  }
);
const emit = defineEmits<{
  (e: 'update:activeRangeKeys', value: { start: string; end: string }): void;
  (e: 'update:rangeCount', value: number): void;
}>();

const activeRangeKeys = computed({
  get: () => props.activeRangeKeys,
  set: (value) => {
    emit('update:activeRangeKeys', value)
  }
})
const keyRangeCount = computed({
  get: () => props.rangeCount,
  set: (value) => {
    if (value < 7 || value > 88) return
    emit('update:rangeCount', value)
  }
})
const inputStart = ref(activeRangeKeys.value.start)

watch(() => activeRangeKeys.value.start, (newStart) => {
  inputStart.value = newStart
})

// 計算 inputEnd
const inputEnd = computed(() => {
  const whiteKeys = keysAll.filter(k => k.type === 'white')
  const startIdx = whiteKeys.findIndex(k => k.note === inputStart.value)
  if (startIdx === -1) return ''
  const endIdx = startIdx + props.rangeCount - 1
  if (endIdx >= whiteKeys.length) return whiteKeys[whiteKeys.length - 1].note
  return whiteKeys[endIdx].note
})

function onActiveRangeInputChange() {
  const noteRegex = /^[a-gA-G]{1}\d{1}$/
  const whiteKeys = keysAll.filter(k => k.type === 'white')
  const startIdx = whiteKeys.findIndex(k => k.note === inputStart.value)

  if (noteRegex.test(inputStart.value) && startIdx !== -1) {
    let endIdx = startIdx + props.rangeCount - 1
    if (endIdx >= whiteKeys.length) endIdx = whiteKeys.length - 1
    activeRangeKeys.value = {
      start: whiteKeys[startIdx].note,
      end: whiteKeys[endIdx].note
    }
  }
}
</script>

<style scoped>
input {
  width: 50px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px;
  font-size: 14px;
}

input[readonly] {
  background-color: #eee;
  cursor: not-allowed;
}

label + label {
  margin-left: 0.875rem;
}
</style>
