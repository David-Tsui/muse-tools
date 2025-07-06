<template>
  <div
    class="piano-key"
    :class="[isWhite ? 'piano-key--white' : 'piano-key--black', { active: isActive }]"
    :data-note="keyData.note"
    @mousedown="handleMouseDown"
    @mouseenter="handleMouseEnter"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
  >
    <span class="piano-key__label">{{ keyData.label }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  keyData: PianoKey
  isActive: boolean
  isWhite: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  (e: 'onMousedown', note: string): void
  (e: 'onMouseenter', note: string): void
  (e: 'onMouseup', note: string): void
  (e: 'onMouseleave', note: string): void
}>()

function handleMouseDown(e: MouseEvent) {
  emit('onMousedown', props.keyData.note)
}

function handleMouseEnter() {
  if (!props.disabled)
    emit('onMouseenter', props.keyData.note)
}
function handleMouseUp() {
  if (!props.disabled)
    emit('onMouseup', props.keyData.note)
}
function handleMouseLeave() {
  if (!props.disabled)
    emit('onMouseleave', props.keyData.note)
}
</script>

<style lang="scss" scoped>
.piano-key {
  position: relative;
  cursor: pointer;
  border-style: solid;
  border-color: #34495e;
  border-width: var(--white-key-border-width);
  transition: all 0.1s ease;
  user-select: none;
}

.piano-key--white {
  width: var(--white-key-width);
  min-width: var(--white-key-width);
  height: var(--white-key-height);
  background: linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);

  // &:is(.mini *) {
  //   border-radius: 0 0 4px 4px;
  // }

  &.active {
    background: linear-gradient(to bottom, #e8e8e8 0%, #d0d0d0 100%);
  }
}

.piano-key--black {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: var(--black-key-width);
  min-width: var(--black-key-width);
  height: var(--black-key-height);
  background: linear-gradient(to bottom, #2c3e50 0%, #1a252f 100%);
  border-radius: 0 0 5px 5px;
  z-index: 2;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);

  // &:is(.mini *) {
  //   border-radius: 0 0 3px 3px;
  // }

  &.active {
    background: linear-gradient(to bottom, #1a252f 0%, #0f1419 100%);
  }
}

.piano-key__label {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;

  &:is(.mini *) {
    font-size: 10px;
  }

  &:is(.piano-key--white *) {
    color: var(--white-key-label-color);
  }

  &:is(.piano-key--black *) {
    color: var(--black-key-label-color);
    bottom: 8px;
  }
}
</style>
