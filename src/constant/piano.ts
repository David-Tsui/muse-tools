export enum KeyLabelDisplayMode {
  NONE = 'none',
  NAME = 'name',
  NAME_WITH_OCTAVE = 'name_with_octave',
  SINGING_NAME = 'singing_name',
  // NUMERIC = 'numeric',
}

export const keyLabelDisplayModes = new Map<KeyLabelDisplayMode, string>([
  [KeyLabelDisplayMode.NONE, 'None'],
  [KeyLabelDisplayMode.NAME, 'Name'],
  [KeyLabelDisplayMode.NAME_WITH_OCTAVE, 'Name with Octave'],
  [KeyLabelDisplayMode.SINGING_NAME, 'Singing Name'],
])

// from A0 to B7
export const keysAll: PianoKey[] = [
  { note: 'C1', type: 'white', label: 'C' },
  { note: 'C#1', type: 'black', label: 'C#', enharmonic: 'Db1' },
  { note: 'D1', type: 'white', label: 'D' },
  { note: 'D#1', type: 'black', label: 'D#', enharmonic: 'Eb1' },
  { note: 'E1', type: 'white', label: 'E' },
  { note: 'F1', type: 'white', label: 'F' },
  { note: 'F#1', type: 'black', label: 'F#', enharmonic: 'Gb1' },
  { note: 'G1', type: 'white', label: 'G' },
  { note: 'G#1', type: 'black', label: 'G#', enharmonic: 'Ab1' },
  { note: 'A1', type: 'white', label: 'A' },
  { note: 'A#1', type: 'black', label: 'A#', enharmonic: 'Bb1' },
  { note: 'B1', type: 'white', label: 'B' },
  { note: 'C2', type: 'white', label: 'C' },
  { note: 'C#2', type: 'black', label: 'C#', enharmonic: 'Db2' },
  { note: 'D2', type: 'white', label: 'D' },
  { note: 'D#2', type: 'black', label: 'D#', enharmonic: 'Eb2' },
  { note: 'E2', type: 'white', label: 'E' },
  { note: 'F2', type: 'white', label: 'F' },
  { note: 'F#2', type: 'black', label: 'F#', enharmonic: 'Gb2' },
  { note: 'G2', type: 'white', label: 'G' },
  { note: 'G#2', type: 'black', label: 'G#', enharmonic: 'Ab2' },
  { note: 'A2', type: 'white', label: 'A' },
  { note: 'A#2', type: 'black', label: 'A#', enharmonic: 'Bb2' },
  { note: 'B2', type: 'white', label: 'B' },
  { note: 'C3', type: 'white', label: 'C' },
  { note: 'C#3', type: 'black', label: 'C#', enharmonic: 'Db3' },
  { note: 'D3', type: 'white', label: 'D' },
  { note: 'D#3', type: 'black', label: 'D#', enharmonic: 'Eb3' },
  { note: 'E3', type: 'white', label: 'E' },
  { note: 'F3', type: 'white', label: 'F' },
  { note: 'F#3', type: 'black', label: 'F#', enharmonic: 'Gb3' },
  { note: 'G3', type: 'white', label: 'G' },
  { note: 'G#3', type: 'black', label: 'G#', enharmonic: 'Ab3' },
  { note: 'A3', type: 'white', label: 'A' },
  { note: 'A#3', type: 'black', label: 'A#', enharmonic: 'Bb3' },
  { note: 'B3', type: 'white', label: 'B' },
  { note: 'C4', type: 'white', label: 'C' },
  { note: 'C#4', type: 'black', label: 'C#', enharmonic: 'Db4' },
  { note: 'D4', type: 'white', label: 'D' },
  { note: 'D#4', type: 'black', label: 'D#', enharmonic: 'Eb4' },
  { note: 'E4', type: 'white', label: 'E' },
  { note: 'F4', type: 'white', label: 'F' },
  { note: 'F#4', type: 'black', label: 'F#', enharmonic: 'Gb4' },
  { note: 'G4', type: 'white', label: 'G' },
  { note: 'G#4', type: 'black', label: 'G#', enharmonic: 'Ab4' },
  { note: 'A4', type: 'white', label: 'A' },
  { note: 'A#4', type: 'black', label: 'A#', enharmonic: 'Bb4' },
  { note: 'B4', type: 'white', label: 'B' },
  { note: 'C5', type: 'white', label: 'C' },
  { note: 'C#5', type: 'black', label: 'C#', enharmonic: 'Db5' },
  { note: 'D5', type: 'white', label: 'D' },
  { note: 'D#5', type: 'black', label: 'D#', enharmonic: 'Eb5' },
  { note: 'E5', type: 'white', label: 'E' },
  { note: 'F5', type: 'white', label: 'F' },
  { note: 'F#5', type: 'black', label: 'F#', enharmonic: 'Gb5' },
  { note: 'G5', type: 'white', label: 'G' },
  { note: 'G#5', type: 'black', label: 'G#', enharmonic: 'Ab5' },
  { note: 'A5', type: 'white', label: 'A' },
  { note: 'A#5', type: 'black', label: 'A#', enharmonic: 'Bb5' },
  { note: 'B5', type: 'white', label: 'B' },
  { note: 'C6', type: 'white', label: 'C' },
  { note: 'C#6', type: 'black', label: 'C#', enharmonic: 'Db6' },
  { note: 'D6', type: 'white', label: 'D' },
  { note: 'D#6', type: 'black', label: 'D#', enharmonic: 'Eb6' },
  { note: 'E6', type: 'white', label: 'E' },
  { note: 'F6', type: 'white', label: 'F' },
  { note: 'F#6', type: 'black', label: 'F#', enharmonic: 'Gb6' },
  { note: 'G6', type: 'white', label: 'G' },
  { note: 'G#6', type: 'black', label: 'G#', enharmonic: 'Ab6' },
  { note: 'A6', type: 'white', label: 'A' },
  { note: 'A#6', type: 'black', label: 'A#', enharmonic: 'Bb6' },
  { note: 'B6', type: 'white', label: 'B' },
  { note: 'C7', type: 'white', label: 'C' },
  { note: 'C#7', type: 'black', label: 'C#', enharmonic: 'Db7' },
  { note: 'D7', type: 'white', label: 'D' },
  { note: 'D#7', type: 'black', label: 'D#', enharmonic: 'Eb7' },
  { note: 'E7', type: 'white', label: 'E' },
  { note: 'F7', type: 'white', label: 'F' },
  { note: 'F#7', type: 'black', label: 'F#', enharmonic: 'Gb7' },
  { note: 'G7', type: 'white', label: 'G' },
  { note: 'G#7', type: 'black', label: 'G#', enharmonic: 'Ab7' },
  { note: 'A7', type: 'white', label: 'A' },
  { note: 'A#7', type: 'black', label: 'A#', enharmonic: 'Bb7' },
  { note: 'B7', type: 'white', label: 'B' },
] satisfies PianoKey[];

export const noteMapToSingingName: Record<string, string> = {
  'C': 'Do',
  'D': 'Re',
  'E': 'Mi',
  'F': 'Fa',
  'G': 'Sol',
  'A': 'La',
  'B': 'Si',
}

export const scalePairs: Array<{ [key in Tonality]: PianoScale }> = [
  {
    major: { key: 'C', name: 'C Major', type: 'major', start: 'C3', end: 'C7' },
    minor: { key: 'A', name: 'A Harmonic Minor', type: 'minor', start: 'A2', end: 'A6' },
  },
  {
    major: { key: 'F', name: 'F Major', type: 'major', start: 'F3', end: 'F7' },
    minor: { key: 'D', name: 'D Harmonic Minor', type: 'minor', start: 'D3', end: 'D7' },
  },
  {
    major: { key: 'Bb', name: 'Bb Major', type: 'major', start: 'Bb3', end: 'Bb7' },
    minor: { key: 'G', name: 'G Harmonic Minor', type: 'minor', start: 'G3', end: 'G7' },
  },
  {
    major: { key: 'Eb', name: 'Eb Major', type: 'major', start: 'Eb3', end: 'Eb7' },
    minor: { key: 'C', name: 'C Harmonic Minor', type: 'minor', start: 'C3', end: 'C7' },
  },
  {
    major: { key: 'Ab', name: 'Ab Major', type: 'major', start: 'Ab3', end: 'Ab7' },
    minor: { key: 'F', name: 'F Harmonic Minor', type: 'minor', start: 'F3', end: 'F7' },
  },
  {
    major: { key: 'Db', name: 'Db Major', type: 'major', start: 'Db3', end: 'Db7' },
    minor: { key: 'Bb', name: 'Bb Harmonic Minor', type: 'minor', start: 'Bb3', end: 'Bb7' },
  },
  {
    major: { key: 'Gb', name: 'Gb Major', type: 'major', start: 'Gb3', end: 'Gb7' },
    minor: { key: 'Eb', name: 'Eb Harmonic Minor', type: 'minor', start: 'Eb3', end: 'Eb7' },
  },
  {
    major: { key: 'B', name: 'B Major', type: 'major', start: 'B3', end: 'B7' },
    minor: { key: 'G#', name: 'G# Harmonic Minor', type: 'minor', start: 'G#3', end: 'G#7' }
  },
  {
    major: { key: 'E', name: 'E Major', type: 'major', start: 'E3', end: 'E7' },
    minor: { key: 'C#', name: 'C# Harmonic Minor', type: 'minor', start: 'C#3', end: 'C#7' }
  },
  {
    major: { key: 'A#', name: 'A# Major', type: 'major', start: 'A#3', end: 'A#7' },
    minor: { key: 'F#', name: 'F# Harmonic Minor', type: 'minor', start: 'F#3', end: 'F#7' }
  },
  {
    major: { key: 'D', name: 'D Major', type: 'major', start: 'D3', end: 'D7' },
    minor: { key: 'B', name: 'B Harmonic Minor', type: 'minor', start: 'B3', end: 'B7' }
  },
  {
    major: { key: 'G', name: 'G Major', type: 'major', start: 'G3', end: 'G7' },
    minor: { key: 'E', name: 'E Harmonic Minor', type: 'minor', start: 'E3', end: 'E7' }
  },
]
