<template>
  <div class="chord-lookup-player">
    <h2>♬ Chord lookup player</h2>

    <div class="container md:w-1/2 lg:w-1/3 mx-auto">
      <!-- 新增 Chord 查詢輸入框 -->
      <div class="chord-lookup flex flex-col">
        <input
          v-model="chordInput"
          type="text"
          placeholder="Enter chord (e.g., Cmaj7)"
          @input="lookupChord"
          class="w-[-webkit-fill-available]"
        />
        <p v-show="chordNotes">Notes: {{ chordNotesForDisplay }}</p>
        <!-- 新增 rootOctave 控制項 -->
        <div class="note-octave-control flex items-center">
          <p>Tonic position:</p>
          <div class="octave-options">
            <label
              v-for="option in rootOctaveOptions"
              :key="option.value"
              :disabled="chordNotes && chordNotes.length === 0"
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
        <div
          v-show="chordNotes && chordNotes.length !== 0" id="paper"
        />
      </div>

      <!-- 新增 audioBpm 控制項 -->
      <div
        v-show="chordInput && chordNotes && chordNotes.length > 0"
        class="audio-bpm-control flex gap-6"
      >
        <button @click="togglePlay" class="mr-10">
          {{ isAudioPlaying ? "Stop" : "Play" }}
        </button>
        <div class="flex items-center gap-2">
          <label for="range">Bpm: {{ audioBpm }}</label>
          <input
            type="range"
            v-model="audioBpm"
            min="40"
            max="400"
            step="5"
            name="range"
          />
        </div>
      </div>

      <!-- 新增進階和弦推薦 -->
      <div
        v-if="chordInput && chordNotes && chordNotes.length > 0"
        class="chord-recommendations"
      >
        <div
          v-if="lastInputChord"
          class="flex items-center gap-3"
        >
          <button

            @click="resetChordInput"
          >
            Back to {{ lastInputChord }}
          </button>
        </div>

        <div v-if="advancedChords.length">
          <p>Advanced Chords (based on <mark>{{ chordInput }}</mark>):</p>
          <ul class="chord-list">
            <li
              v-for="chord in advancedChords"
              :key="chord"
              @click="replaceChordInput(chord)"
              class="chord chord--clickable"
            >
              {{ chord }}
            </li>
          </ul>
        </div>
        <div v-else>
          <p>No advanced chords found for <mark>{{ chordInput }}</mark>.</p>
        </div>
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
        <ul class="chord-list flex flex-col items-start">
          <li
            v-for="(chord, index) in recentChords"
            :key="index"
            @click="replaceChordInput(chord)"
            class="chord chord--clickable"
          >
            {{ chord }}
          </li>
        </ul>
      </div>
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

<style lang="scss" scoped>
.chord-lookup-player {
  background: linear-gradient(135deg, #32dacb 0%, #06b384 100%);
  @apply backdrop-blur-2xl shadow-lg;
  @apply relative rounded-5 py-8;
  @apply border-1 border-solid border-[rgba(255,255,255,0.2)];
}

h2 {
  text-align: center;
  color: white;
  font-size: 2.2em;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.chord-lookup,
.audio-bpm-control,
.major-key-info,
.minor-key-info,
.chord-recommendations,
.recent-chords {
  @apply bg-[rgba(255,255,255,0.2)];
  @apply rounded-4 border-1 border-solid border-[rgba(255,255,255,0.15)];
  @apply py-4.5 px-3 mb-4.5;
  @apply shadow-lg;
}

input[type="text"], input[type="range"] {
  background: rgba(255,255,255,0.7);
  border-radius: 8px;
  border: none;
  padding: 8px 12px;
  font-size: 1em;
  margin-bottom: 8px;
}

.chord-list {
  @apply list-none p-0 m-0;
  @apply flex flex-wrap gap-2;
}

.chord {
  @apply inline-block;
  @apply bg-[rgba(255,255,255,0.2)] backdrop-blur-md;
  @apply px-4 py-2 rounded-4;
  @apply font-bold text-white;
  @apply border border-solid border-[rgba(255,255,255,0.3)];

  &:is(.sticky-panel *) {
    @apply bg-#636363 text-#eee;
  }
}

.chord.chord--clickable {
  @apply cursor-pointer no-underline transition-colors transition duration-200;
  @apply hover:(bg-[rgba(255,255,255,0.3)] text-[#048373]);

  &:is(.sticky-panel *) {
    @apply hover:text-#444;
  }
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
  border-radius: 8px 8px 0 0;
}

.tabs li.active {
  background-color: #fff;
  font-weight: bold;
  border-bottom: 1px solid #fff;
}

.sticky-panel {
  @apply absolute top-0 right-0 z-1000;
  @apply min-w-30 w-fit p-2.5 border border-solid border-[#ccc] rounded-4;
  @apply bg-[rgba(255,255,255,0.65)] shadow-lg;
}

.major-key-info,
.minor-key-info {
  background: rgba(102,126,234,0.25);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.2);
}

button {
  @apply bg-[#006555] text-white border-none rounded-3;
  @apply px-5 py-2 text-base font-bold;
  @apply my-2 cursor-pointer shadow-md;
  @apply transition-colors transition duration-200;
  @apply hover:bg-[#00dfbc]
}

mark {
  @apply bg-[#ffd700] text-[#222] rounded-6 px-1;
}
</style>
