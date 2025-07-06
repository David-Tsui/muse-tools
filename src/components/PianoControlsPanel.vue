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

<style scoped>
.controls {
  text-align: center;
  margin-top: 20px;
}

.control-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  margin: 0 10px;
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
