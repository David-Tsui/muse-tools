<template>
  <div class="piano-container">
    <h1 class="piano-title">🎹 Vue Piano</h1>
    <!-- 傳遞滑鼠事件 handler 給 PianoKeyboard -->
    <PianoKeyboard
      :keys="keys"
      :activeNotes="activeNotes"
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
    <PianoControls
      :volume="volume"
      @play-scale="playScale"
      @play-chord="playChord"
      @stop-all="stopAll"
      @update-volume="updateVolume"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, shallowRef, onMounted, onUnmounted } from 'vue'
import PianoKeyboard from './PianoKeyboard.vue'
import PianoControls from './PianoControls.vue'
import * as Tone from 'tone'

const activeNotes = ref<string[]>([]);
const volume = ref(0.5);
const synth = shallowRef<Tone.PolySynth | null>(null);
const isAudioStarted = ref(false);
const mouseDown = ref(false)
const lastHoveredKey = ref<string | null>(null)

// Piano key configuration
const keys = reactive<PianoKey[]>([
  { note: 'C4', type: 'white', label: 'C', style: {} },
  { note: 'C#4', type: 'black', label: 'C#', style: { left: '43px' } },
  { note: 'D4', type: 'white', label: 'D', style: {} },
  { note: 'D#4', type: 'black', label: 'D#', style: { left: '105px' } },
  { note: 'E4', type: 'white', label: 'E', style: {} },
  { note: 'F4', type: 'white', label: 'F', style: {} },
  { note: 'F#4', type: 'black', label: 'F#', style: { left: '228px' } },
  { note: 'G4', type: 'white', label: 'G', style: {} },
  { note: 'G#4', type: 'black', label: 'G#', style: { left: '290px' } },
  { note: 'A4', type: 'white', label: 'A', style: {} },
  { note: 'A#4', type: 'black', label: 'A#', style: { left: '352px' } },
  { note: 'B4', type: 'white', label: 'B', style: {} },
  { note: 'C5', type: 'white', label: 'C', style: {} },
  { note: 'C#5', type: 'black', label: 'C#', style: { left: '476px' } },
  { note: 'D5', type: 'white', label: 'D', style: {} },
  { note: 'D#5', type: 'black', label: 'D#', style: { left: '538px' } },
  { note: 'E5', type: 'white', label: 'E', style: {} }
]);

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
  keys.forEach(key => {
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

onUnmounted(() => {
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

<style>
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
  display: flex;
  position: relative;
  background: #2c3e50;
  border-radius: 10px;
  padding: 20px;
  box-shadow: inset 0 5px 15px rgba(0, 0, 0, 0.3);
}

.key {
  position: relative;
  cursor: pointer;
  border: 2px solid #34495e;
  transition: all 0.1s ease;
  user-select: none;
}

.white-key {
  width: 60px;
  height: 200px;
  background: linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%);
  border-radius: 0 0 8px 8px;
  margin: 0 1px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

.black-key {
  width: 35px;
  height: 120px;
  background: linear-gradient(to bottom, #2c3e50 0%, #1a252f 100%);
  border-radius: 0 0 5px 5px;
  position: absolute;
  z-index: 2;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
}

.key:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
}

.key.active {
  transform: translateY(3px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
}

.white-key.active {
  background: linear-gradient(to bottom, #e8e8e8 0%, #d0d0d0 100%);
}

.black-key.active {
  background: linear-gradient(to bottom, #1a252f 0%, #0f1419 100%);
}

.key-label {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
}

.white-key .key-label {
  color: #2c3e50;
}

.black-key .key-label {
  color: #ecf0f1;
  bottom: 8px;
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
