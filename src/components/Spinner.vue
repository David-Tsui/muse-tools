<template>
  <div class="spinner-overlay">
    <div class="spinner"></div>
    <div class="spinner-text">
      <slot name="loading-text">
        Loading...
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.spinner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(30,30,40,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 99;
}
.spinner {
  border: 8px solid #eee;
  border-top: 8px solid #764ba2;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  animation: spin 1s linear infinite;
  margin-bottom: 18px;
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
.spinner-text {
  color: #fff;
  font-size: 1.2em;
  letter-spacing: 1px;
}
</style>
