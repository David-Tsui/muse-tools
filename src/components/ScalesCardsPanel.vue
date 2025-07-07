<template>
  <div class="scale-section">
    <!-- <div class="scale-title">相對/關係大小調 (Relative Major & Minor Scales)</div> -->
    <div class="scale-pairs">
      <div v-for="pair in scalePairs" :key="pair.major.key" class="scale-pair">
        <div class="scale-pair-title">{{ pair.major.key + '大調'}} / {{ pair.minor.key + '小調' }}</div>
        <div class="scale-buttons">
          <button
            :class="['scale-button', 'major', { active: selectedScale?.key === pair.major.key && selectedScale?.type === 'major' }]"
            @click="selectScale(pair.major)">
            {{ pair.major.name }}
          </button>
          <button
            :class="['scale-button', 'minor', { active: selectedScale?.key === pair.minor.key && selectedScale?.type === 'minor' }]"
            @click="selectScale(pair.minor)">
            {{ pair.minor.name.replace(/harmonic/i, '') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { scalePairs } from '../constant/piano'
import { useTonal } from '../composables/useTonal';

const emit = defineEmits<{
  (e: 'select', scale: PianoScale, notes: string[]): void
}>()

const { getPerfectScaleNotes } = useTonal()

const selectedScale = ref<PianoScale | null>(null)

const selectScale = (scale: PianoScale) => {
  selectedScale.value = scale

  const scaleNotes = getPerfectScaleNotes(scale.name.toLowerCase(), {
    start: scale.start,
    end: scale.end,
  })
  emit('select', scale, scaleNotes);
}
</script>

<style lang="scss" scoped>
.scale-selection {
  margin-bottom: 20px;
}

.scale-section {
  padding: 16px;
  border-radius: 15px;
}

.scale-title {
  text-align: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.scale-pairs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-content: center;
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;

  @media (min-width: 767px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.scale-pair {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 15px;
  backdrop-filter: blur(10px);
  min-width: 140px;
  text-align: center;
}

.scale-pair-title {
  color: white;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  opacity: 0.8;
}

.scale-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scale-button {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 6px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-size: .875rem;
  font-weight: bold;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  width: 100%;
}

.scale-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.scale-button.active {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.scale-button.major {
  background: rgba(74, 144, 226, 0.3);
  border-color: rgba(74, 144, 226, 0.5);
}

.scale-button.major:hover {
  background: rgba(74, 144, 226, 0.4);
}

.scale-button.major.active {
  background: rgba(74, 144, 226, 0.6);
}

.scale-button.minor {
  background: rgba(156, 39, 176, 0.3);
  border-color: rgba(156, 39, 176, 0.5);
}

.scale-button.minor:hover {
  background: rgba(156, 39, 176, 0.4);
}

.scale-button.minor.active {
  background: rgba(156, 39, 176, 0.6);
}

.current-scale {
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
