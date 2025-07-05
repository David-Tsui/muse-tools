<template>
  <div class="player">
    <h2>1. Chord lookup player</h2>
    <!-- 新增 Chord 查詢輸入框 -->
    <div class="chord-lookup">
      <input
        v-model="chordInput"
        type="text"
        placeholder="Enter chord (e.g., Cmaj7)"
        @input="lookupChord"
      />
      <p v-if="chordNotes">Notes: {{ chordNotesForDisplay }}</p>
    </div>
    <!-- 新增 rootOctave 控制項 -->
    <div class="note-octave-control">
      <p>Tonic position:</p>
      <div class="octave-options">
        <label
          v-for="option in rootOctaveOptions"
          :key="option.value"
        >
          <input
            type="radio"
            v-model="rootOctave"
            :value="option.value"
          />
          {{ option.label }}
        </label>
      </div>
    </div>
    <div id="paper"></div>

    <!-- 新增進階和弦推薦 -->
    <div class="chord-recommendations" v-if="advancedChords.length">
      <p>Advanced Chords (based on <mark>{{ chordInput }}</mark>):</p>
      <ul>
        <li
          v-for="chord in advancedChords"
          :key="chord"
          @click="replaceChordInput(chord)"
          class="clickable-chord"
        >
          {{ chord }}
        </li>
      </ul>
    </div>
    <button
      v-if="lastInputChord"
      @click="resetChordInput"
    >
      Back to {{ lastInputChord }}
    </button>

    <div
      v-if="chordNotes && chordNotes.length > 0"
      class="section-audio"
    >
      <hr>
      <button @click="togglePlay">
        {{ isAudioPlaying ? "Stop" : "Play" }}
      </button>
    </div>

    <!-- 新增 audioBpm 控制項 -->
    <div v-show="chordInput" class="audio-bpm-control">
      <p>Bpm: {{ audioBpm }}</p>
      <input
        type="range"
        v-model="audioBpm"
        min="40"
        max="400"
      />
    </div>

    <!-- 如果是 major，則顯示 Major Key 資訊 -->
    <div v-if="majorKeyInfo" class="major-key-info">
      <p>Major Key: {{ majorKeyInfo.tonic }}</p>
      <p>Triads: {{ majorKeyInfo.triads.join(", ") }}</p>
      <p>Seventh Chords: {{ majorKeyInfo.chords.join(", ") }}</p>
    </div>

    <!-- 如果是 minor，則顯示 Minor Key 資訊 -->
    <div v-if="minorKeyInfo" class="minor-key-info">
      <p>Minor Key: {{ minorKeyInfo.tonic }}</p>
      <div>
        <ul class="tabs">
          <li
            :class="{ active: activeTab === 'natural' }"
            @click="activeTab = 'natural'"
          >
            Natural
          </li>
          <li
            :class="{ active: activeTab === 'harmonic' }"
            @click="activeTab = 'harmonic'"
          >
            Harmonic
          </li>
          <li
            :class="{ active: activeTab === 'melodic' }"
            @click="activeTab = 'melodic'"
          >
            Melodic
          </li>
        </ul>
        <div v-if="activeTab === 'natural'">
          <p>Triads: {{ minorKeyInfo.natural.triads.join(", ") }}</p>
          <p>Seventh Chords: {{ minorKeyInfo.natural.chords.join(", ") }}</p>
        </div>
        <div v-if="activeTab === 'harmonic'">
          <p>Triads: {{ minorKeyInfo.harmonic.triads.join(", ") }}</p>
          <p>Seventh Chords: {{ minorKeyInfo.harmonic.chords.join(", ") }}</p>
        </div>
        <div v-if="activeTab === 'melodic'">
          <p>Triads: {{ minorKeyInfo.melodic.triads.join(", ") }}</p>
          <p>Seventh Chords: {{ minorKeyInfo.melodic.chords.join(", ") }}</p>
        </div>
      </div>
    </div>

    <!-- 調整最近輸入和弦記錄為黏附面板 -->
    <div class="recent-chords sticky-panel" v-if="recentChords.length">
      <p>Recent:</p>
      <ul>
        <li
          v-for="(chord, index) in recentChords"
          :key="index"
          @click="replaceChordInput(chord)"
          class="clickable-chord"
        >
          {{ chord }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as Tone from "tone"
import { Chord, Key } from "tonal"
import ABCJS from "abcjs"

const isAudioPlayed = ref(false)
const isAudioPlaying = ref(false)
const audioBpm = ref(120)
const ToneTransport = Tone.getTransport()

// 2: 四分 音符, 4: 二分音符, 8: 全音符
enum Interval {
  QUARTER = 2,
  HALF = 4,
  WHOLE = 8,
}

enum Accidental {
  FLAT = "_",
  SHARP = "^",
  FLAT_DISPLAY = "♭",
  SHARP_DISPLAY = "♯",
}

// 使用 tonal 動態計算 Chord Notes
const chordInput = ref("")
const chordNotes = ref<string | null>(null)
const notesInterval = ref(Interval.HALF)
const rootOctave = ref<number>(4) // 預設從中央開始 (C4)
const separator = "|"

const advancedChords = ref<string[]>([])
const maxAdvancedChordsCount = 5
const lastInputChord = ref<string | null>(null);

const rootOctaveOptions = [
  { value: 4, label: "4" },
  { value: 3, label: "3" },
  { value: 0, label: "auto" },
];

const majorKeyInfo = ref<{
  tonic: string;
  triads: ReturnType<typeof Key.majorKey>["triads"]
  chords: ReturnType<typeof Key.majorKey>["chords"]
} | null>(null)

const minorKeyInfo = ref<{
  tonic: string;
  natural: ReturnType<typeof Key.minorKey>["natural"]
  harmonic: ReturnType<typeof Key.minorKey>["harmonic"]
  melodic: ReturnType<typeof Key.minorKey>["melodic"]
} | null>(null)

const activeTab = ref("natural")

const recentChords = ref<string[]>([]);

watch(rootOctave, () => {
  if (chordInput.value) {
    lookupChord()
  }
})

// 查詢 Chord 並推薦進階和弦
function lookupChord() {
  const clearInput = chordInput.value.replace(/[(),\s]/g, "")
  const [chordPart, bassPart] = clearInput.split("/") // Split chord and bass
  const result = Chord.get(chordPart)
  console.log('components/Player.vue - [Line: 142]| result: ', result)
  const tonic = rootOctave.value && `${result.tonic}${rootOctave.value}`

  if (!result || !result.aliases.length) {
    chordNotes.value = null
    advancedChords.value = []
    majorKeyInfo.value = null
    minorKeyInfo.value = null
    resetScore()
    return
  }

  const notes = tonic
    ? Chord.getChord(result.aliases[0], tonic).notes
    : result.notes

  if (bassPart) {
    // Add the bass note to the beginning of the notes array
    const bassNote = `${bassPart}${rootOctave.value}`
    chordNotes.value = [bassNote, ...notes].join(", ")
  } else {
    chordNotes.value = notes.length ? notes.join(", ") : null
  }

  // 更新進階和弦推薦
  advancedChords.value = Chord.extended(chordPart).slice(0, maxAdvancedChordsCount)

  // 更新 Major, Minor Key 資訊
  const tonicKey = result.tonic

  if (tonicKey && result.quality === "Major") {
    minorKeyInfo.value = null

    const majorKey = Key.majorKey(tonicKey)
    majorKeyInfo.value = {
      tonic: majorKey.tonic,
      triads: majorKey.triads,
      chords: majorKey.chords,
    }
  } else if (tonicKey && result.quality === "Minor") {
    majorKeyInfo.value = null

    const minorKey = Key.minorKey(tonicKey)
    minorKeyInfo.value = {
      tonic: minorKey.tonic,
      natural: minorKey.natural,
      harmonic: minorKey.harmonic,
      melodic: minorKey.melodic,
    }

  } else {
    // 如果無法識別調性，則清除相關資訊
    majorKeyInfo.value = null
    minorKeyInfo.value = null
  }

  if (chordInput.value) {
    addToRecentChords(chordInput.value); // Add to recent chords
  }

  displayScore()
}

const chordNotesForDisplay = computed(() => {
  if (!chordNotes.value) return ''
  return convertStringNotesToArray(chordNotes.value, true).join(", ");
});

const chordNotesForABC = computed(() => {
  if (!chordNotes.value) return ''

  const notes = convertStringNotesToArray(
    chordNotes.value,
    true,
    {
      flat: Accidental.FLAT,
      sharp: Accidental.SHARP,
    },
  )

  const notesWithCorrectPitch = notes.map(note => convertPitchNotation(note));
  console.log('components/Player.vue - [Line: 168]| notesWithCorrectPitch: ', notesWithCorrectPitch)
  return notesWithCorrectPitch.join(separator)
});

function convertStringNotesToArray(
  originalNotes: string,
  withOctave = false,
  token = {
    flat: Accidental.FLAT_DISPLAY,
    sharp: Accidental.SHARP_DISPLAY
  },
) {
  return originalNotes
    .split(", ")
    .map((originNote) => {
      const note = withOctave ? originNote : originNote.replace(/\d/g, "")
      return note.replace(/b/g, token.flat).replace(/#/g, token.sharp)
    })
}


// Example usage:
// console.log(convertPitchNotation("C4")); // Output: "C4"
// console.log(convertPitchNotation("A6")); // Output: "a6'"
// console.log(convertPitchNotation("G7")); // Output: "g7''"
// console.log(convertPitchNotation("C^5")); // Output: "^c5"
// console.log(convertPitchNotation("D_6")); // Output: "_d6'"
// console.log(convertPitchNotation("A6")); // Output: "a6'"

function convertPitchNotation(note: string): string {
  const match = note.match(/^([A-Ga-g])([\^_]*)(\d)?$/)

  if (!match) return note // Return the original note if it doesn't match the pattern

  let [_, letter, accidental, octave] = match
  const octaveNumber = parseInt(octave, 10)

  if (isNaN(octaveNumber)) {
    return `${accidental}${letter}`
  }

  const lowerOctaveMark = ","
  const higherOctaveMark = "'"
  const octaveAdjustment = octaveNumber - 4


  if (octaveAdjustment < 0) {
    octave += lowerOctaveMark.repeat(-octaveAdjustment)
  } else if (octaveAdjustment > 0) {
    letter = letter.toLowerCase()
    octave += higherOctaveMark.repeat(octaveAdjustment - 1)
  }

  const result = `${accidental}${letter}${octave}`
  console.log('components/Player.vue - [Line: 216]| result: ', result)
  return result
}

async function setAudio() {
  // 確保有有效的和弦音符
  if (!chordNotes.value) {
    console.warn("No valid chord notes to play.");
    return;
  }

  // 初始化音樂合成器
  const synth = new Tone.PolySynth(Tone.Synth, {
    volume: -8,
    oscillator: {
      type: "sine",
    },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 0.5,
    },
  }).toDestination();

  // 將和弦音符轉換為陣列
  const notesArray = chordNotes.value.split(", ").map(note => note.trim());
  console.log('components/Player.vue - [Line: 249]| notesArray: ', notesArray)

  // 清除之前的調度
  ToneTransport.cancel();

  // 使用 Tone.Transport.schedule 播放每個音符
  notesArray.forEach((note, index) => {
    console.log('components/Player.vue - [Line: 379]| note: ', note)
    ToneTransport.schedule((time) => {
      synth.triggerAttackRelease(note, "8n", time);
    }, `0:${index}`);
  });

  // 播放整個和弦
  ToneTransport.schedule((time) => {
    synth.triggerAttackRelease(notesArray, "2n", time);
  }, `0:${notesArray.length}`);

  // 設定播放完成的回調
  ToneTransport.schedule((time) => {
    ToneTransport.stop(time); // 停止 Transport，使用傳入的 time
    onPlaybackComplete();
  }, `0:${notesArray.length + 1}`);

  // 設定 BPM
  ToneTransport.bpm.value = audioBpm.value;
}

function onPlaybackComplete() {
  // 在播放完成時執行的邏輯
  console.log("Playback has completed. Perform your actions here.");
  isAudioPlaying.value = false;
  isAudioPlayed.value = true;
}

function togglePlay() {
  console.log('components/Player.vue - [Line: 285]| togglePlay: ')
  setAudio();

  if (isAudioPlaying.value) {
    ToneTransport.stop();
  } else {
    ToneTransport.start();
  }

  isAudioPlaying.value = !isAudioPlaying.value;
}

// 函數：顯示對應的樂譜
function displayScore() {
  if (!chordNotes.value) {
    resetScore()
    return
  }

  const notesWithInterval = chordNotesForABC.value
    .split(separator)
    .map(note => `${note.replace(/\d/g, '')}${notesInterval.value}`)
  // console.log(`components/Player.vue - [Line: 210]| notesWithInterval: `, notesWithInterval)
  const abcNotation = `X:1\nM:4/4\nK:C\n[${notesWithInterval.join("")}] |`;

  // 渲染到 #paper
  ABCJS.renderAbc("paper", abcNotation);
}

function resetScore() {
  ABCJS.renderAbc("paper", ""); // 清空樂譜
}

// 替換輸入框中的和弦
function replaceChordInput(chord: string) {
  if (!lastInputChord.value) {
    lastInputChord.value = chordInput.value // Save the original input chord
  }

  chordInput.value = chord
  lookupChord()
}

function resetChordInput() {
  // No last input chord to reset to
  if (!lastInputChord.value) return

  chordInput.value = lastInputChord.value
  lastInputChord.value = null // Clear the last input chord after reset
  lookupChord()
}

function addToRecentChords(chord: string) {
  if (!recentChords.value.includes(chord)) {
    recentChords.value.unshift(chord); // Add to the beginning
    if (recentChords.value.length > 10) {
      recentChords.value.pop(); // Remove the oldest if more than 10
    }
  }
}
</script>

<style scoped>
.player {
  position: relative;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.chord-lookup {
  margin-bottom: 10px;
}

input[type="text"] {
  width: 240px;
}

.chord-recommendations {
  margin-top: 10px;
}

.chord-recommendations ul {
  list-style: none;
  padding: 0;
}

.chord-recommendations li {
  display: inline-block;
  margin-right: 10px;
  cursor: pointer;
  color: blue;
  text-decoration: underline;
}

.chord-recommendations li:hover {
  color: darkblue;
}

.note-octave-control {
  margin-top: 10px;
}

.octave-options {
  display: flex;

  gap: 14px;
}

.audio-bpm-control {
  margin-top: 10px;
}

.major-key-info {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.tabs {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
  border-bottom: 1px solid #ddd;
}

.tabs li {
  padding: 5px 10px;
  cursor: pointer;
  border: 1px solid #ddd;
  border-bottom: none;
  background-color: #f9f9f9;
  margin-right: 5px;
}

.tabs li.active {
  background-color: #fff;
  font-weight: bold;
  border-bottom: 1px solid #fff;
}

.recent-chords {
  margin-top: 10px;
  width: 80px;
}

.recent-chords ul {
  list-style: none;
  padding: 0;
}

.recent-chords li {
  display: block;
  margin-right: 10px;
  cursor: pointer;
  color: green;
  text-decoration: underline;
}

.recent-chords li:hover {
  color: darkgreen;
}

/* 更新黏附面板樣式 */
.sticky-panel {
  position: absolute;
  top: 0;
  right: 0; /* Adjusted to stick to the right of the .player element */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: rgb(249 249 249 / 85%);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
</style>
