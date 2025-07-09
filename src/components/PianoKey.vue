<template>
  <div
    class="piano-key"
    :class="[
      isWhite ? 'piano-key--white' : 'piano-key--black',
      { 'active': isActive }
    ]"
    :data-note="keyData.note"
    @mousedown="emit('mousedown', keyData.note)"
    @mouseup="emit('mouseup', keyData.note)"
    @mouseenter="emit('mouseenter', keyData.note)"
    @mouseleave="emit('mouseleave', keyData.note)"
  >
    <span class="piano-key__label">{{ hideLabel ? '' : displayLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { KeyLabelDisplayMode, noteMapToSingingName } from '../constant/piano'

const props = defineProps<{
  keyData: PianoKey
  isActive: boolean
  isWhite: boolean
  disabled: boolean
  hideLabel?: boolean
}>()

const emit = defineEmits<{
  (e: 'mousedown', note: string): void
  (e: 'mouseenter', note: string): void
  (e: 'mouseup', note: string): void
  (e: 'mouseleave', note: string): void
}>()

const displayMode = inject<Ref<KeyLabelDisplayMode>>('displayMode')

const displayLabel = computed(() => {
  const key = props.keyData

  switch (displayMode?.value) {
    case KeyLabelDisplayMode.NONE:
      return ''
    case KeyLabelDisplayMode.NAME:
      return key.label
    case KeyLabelDisplayMode.NAME_WITH_OCTAVE:
      return key.note
    case KeyLabelDisplayMode.SINGING_NAME:
      return noteMapToSingingName[key.label] || ''
    default:
      return props.keyData.label
  }
})
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

  &:hover {
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
  }
  &.active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  }
}

.piano-key--white {
  width: var(--white-key-width);
  min-width: var(--white-key-width);
  height: var(--white-key-height);
  background: linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);

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

  &.active {
    background: linear-gradient(to bottom, #245f95 0%, #0b2641 100%);
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

  &:is(.piano-keyboard--minimap *) {
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
