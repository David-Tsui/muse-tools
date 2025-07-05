<template>
  <div>
    <div class="controls">
      <button class="control-button" @click="$emit('play-scale')">Play Scale</button>
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
        @input="$emit('update-volume', Number(($event.target as HTMLInputElement).value))"
      >
      <span style="color: white; font-weight: bold;">{{ Math.round(volume * 100) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ volume: number }>()
</script>
