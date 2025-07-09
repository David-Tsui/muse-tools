<template>
  <div>
    <div class="controls">
      <button class="control-button" @click="nextDisplayMode">
        Display: {{ keyLabelDisplayModes.get(props.displayMode) }}
      </button>
      <Popover class="relative">
        <PopoverButton class="control-button">Play Scale</PopoverButton>
        <PopoverPanel
          class="absolute bottom-0 z-10 w-fit overflow-auto before:(content-empty absolute inset-0 bg-#2c3e50/90 p-5 rd-15px backdrop-blur-md z--1)"
          v-slot="{ close }"
        >
          <ScalesCardsPanel @select="(...args) => {
            onSelectScale(...args)
            close()
          }" />
          <button
            class="control-button mb-4"
            @click="close()"
            aria-label="Close"
          >
            Close
          </button>
        </PopoverPanel>
      </Popover>
      <button class="control-button" @click="$emit('play-chord')">Play Chord</button>
      <button class="control-button" @click="$emit('stop-all')">Stop All</button>
    </div>
    <div class="volume-control">
      <label style="color: white; font-weight: bold;">Volume: </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        :value="volume"
        class="volume-slider"
        @input="$emit('update:volume', Number(($event.target as HTMLInputElement).value))"
      >
      <span style="color: white; font-weight: bold;">{{ Math.round(volume * 100) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import ScalesCardsPanel from './ScalesCardsPanel.vue'
import { KeyLabelDisplayMode, keyLabelDisplayModes } from '../constant/piano'

const props = defineProps<{
  volume: number
  displayMode: KeyLabelDisplayMode
}>()

const emit = defineEmits<{
  (e: 'play-scale', scaleNotes: string[]): void
  (e: 'play-chord'): void
  (e: 'stop-all'): void
  (e: 'update:volume', volume: number): void
  (e: 'update:displayMode', mode: KeyLabelDisplayMode): void
}>()

function onSelectScale(_scale: PianoScale, scaleNotes: string[]) {
  emit('play-scale', scaleNotes)
}

const displayModes = Array.from(keyLabelDisplayModes.keys())
const currentIdx = computed(() => displayModes.indexOf(props.displayMode))

function nextDisplayMode() {
  const idx = (currentIdx.value + 1) % displayModes.length
  emit('update:displayMode', displayModes[idx])
}
</script>

<style scoped>
.controls {
  display: flex;
  justify-content: center;
  align-items: start;
  gap: 12px;
  text-align: center;
  margin-top: 20px;
}

::v-deep(.control-button) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.volume-control {
  margin-top: 15px;
}

.volume-slider {
  width: 200px;
  margin: 0 10px;
}
</style>
