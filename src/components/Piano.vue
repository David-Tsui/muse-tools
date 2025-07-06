<template>
  <div class="piano-container">
    <h1 class="piano-title">🎹 Vue Piano</h1>
    <div class="piano-control-window">
      <PianoControlsWindow v-model="activeRangeKeys" />
    </div>
    <PianoRangeInput v-model:activeRangeKeys="activeRangeKeys" />
    <PianoKeyboard
      :keys="keysAll"
      :activeNotes="activeNotes"
      :activeRangeKeys="activeRangeKeys"
      @play="playNote"
      @stop="stopNote"
      @key-mousedown="handleKeyMouseDown"
      @key-mouseenter="handleKeyMouseEnter"
      @key-mouseup="handleKeyMouseUp"
      @key-mouseleave="handleKeyMouseLeave"
    />
    <div class="current-notes">
      <div v-for="note in activeNotes" :key="note" class="note-display">
        {{ note }}
      </div>
    </div>
    <PianoControlsPanel
      :volume="volume"
      @play-scale="playScale"
      @play-chord="playChord"
      @stop-all="stopAll"
      @update-volume="updateVolume"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue'
import PianoKeyboard from './PianoKeyboard.vue'
import PianoControlsPanel from './PianoControlsPanel.vue'
import * as Tone from 'tone'
import { keysAll } from '../constant/piano'

const activeNotes = ref<string[]>([]);
const activeRangeKeys = ref<{ start: string, end: string }>({ start: 'C4', end: 'B5' });

const volume = ref(0.5);
const synth = shallowRef<Tone.PolySynth | null>(null);
const isAudioStarted = ref(false);
const mouseDown = ref(false)
const lastHoveredKey = ref<string | null>(null)

// Initialize audio
const initAudio = async () => {
  if (!isAudioStarted.value) {
    try {
      await Tone.start();
      synth.value = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.5,
          release: 0.8
        }
      }).toDestination();
      synth.value.volume.value = Tone.gainToDb(volume.value);
      isAudioStarted.value = true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }
};

// Play a note
const playNote = async (note: string) => {
  try {
    await initAudio();

    if (!activeNotes.value.includes(note)) {
      activeNotes.value.push(note);
      synth.value?.triggerAttack(note);
    }
  } catch (error) {
    console.error('Error playing note:', error);
  }
};

// Stop a note
const stopNote = (note: string) => {
  const index = activeNotes.value.indexOf(note);
  if (index > -1) {
    activeNotes.value.splice(index, 1);
    if (synth.value) {
      synth.value.triggerRelease(note);
    }
  }
};

// Play a scale
const playScale = async () => {
  try {
    await initAudio();
    const scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

    for (let i = 0; i < scale.length; i++) {
      setTimeout(() => {
        synth.value?.triggerAttackRelease(scale[i], '8n');
        activeNotes.value.push(scale[i]);
        setTimeout(() => {
          const index = activeNotes.value.indexOf(scale[i]);
          if (index > -1) {
            activeNotes.value.splice(index, 1);
          }
        }, 150);
      }, i * 150);
    }
  } catch (error) {
    console.error('Error playing scale:', error);
  }
};

// Play a chord
const playChord = async () => {
  try {
    await initAudio();
    const chord = ['C4', 'E4', 'G4', 'C5'];

    chord.forEach(note => {
      if (synth.value) {
        synth.value.triggerAttackRelease(note, '2n');
        activeNotes.value.push(note);
        setTimeout(() => {
          const index = activeNotes.value.indexOf(note);
          if (index > -1) {
            activeNotes.value.splice(index, 1);
          }
        }, 1500);
      }
    });
  } catch (error) {
    console.error('Error playing chord:', error);
  }
};

// Stop all notes
const stopAll = () => {
  if (synth.value) {
    synth.value.releaseAll();
  }
  activeNotes.value = [];
};

// Update volume
const updateVolume = () => {
  if (synth.value) {
    synth.value.volume.value = Tone.gainToDb(volume.value);
  }
};

// Add user interaction handler for audio context
const handleUserInteraction = async () => {
  if (!isAudioStarted.value) {
    await initAudio();
  }
};

// Keyboard controls
const keyMap: { [key: string]: string } = {
  'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
  'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
  'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5',
  'p': 'D#5', ';': 'E5'
};

const handleKeyDown = (event: KeyboardEvent) => {
  const note = keyMap[event.key.toLowerCase()];
  if (note && !activeNotes.value.includes(note)) {
    playNote(note);
  }
};

const handleKeyUp = (event: KeyboardEvent) => {
  const note = keyMap[event.key.toLowerCase()];
  if (note) {
    stopNote(note);
  }
};

// Mouse event handlers for piano keys
const handleKeyMouseDown = async (note: string) => {
  mouseDown.value = true
  if (lastHoveredKey.value && lastHoveredKey.value !== note) {
    stopNote(lastHoveredKey.value)
  }
  lastHoveredKey.value = note
  await playNote(note)
}

const handleKeyMouseEnter = async (note: string) => {
  if (mouseDown.value && lastHoveredKey.value !== note) {
    if (lastHoveredKey.value) stopNote(lastHoveredKey.value)
    lastHoveredKey.value = note
    await playNote(note)
  }
}

const handleKeyMouseUp = (note: string) => {
  mouseDown.value = false
  stopNote(note)
  lastHoveredKey.value = null
}

const handleKeyMouseLeave = (note: string) => {
  if (mouseDown.value) {
    stopNote(note)
    lastHoveredKey.value = null
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  // Add user interaction listeners to start audio context
  document.addEventListener('click', handleUserInteraction);
  document.addEventListener('touchstart', handleUserInteraction);

  // Add data attributes for animation targeting
  keysAll.forEach(key => {
    setTimeout(() => {
      const element = document.querySelector(`[data-note="${key.note}"]`);
      if (element) {
        element.setAttribute('data-note', key.note);
      }
    }, 100);
  });

  document.addEventListener('mouseup', () => {
    mouseDown.value = false
    if (lastHoveredKey.value) {
      stopNote(lastHoveredKey.value)
      lastHoveredKey.value = null
    }
  })
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  document.removeEventListener('click', handleUserInteraction);
  document.removeEventListener('touchstart', handleUserInteraction);
  document.removeEventListener('mouseup', () => {
    mouseDown.value = false
    if (lastHoveredKey.value) {
      stopNote(lastHoveredKey.value)
      lastHoveredKey.value = null
    }
  })

  // Clean up Tone.js
  if (synth.value) {
    synth.value.dispose();
  }
});
</script>

<style scoped>
.piano-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.piano-title {
  text-align: center;
  color: white;
  font-size: 2.5em;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.piano-keyboard {
  padding: 20px;
}

.current-notes {
  text-align: center;
  margin-top: 30px;
  min-height: 40px;
}

.note-display {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  margin: 0 5px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
