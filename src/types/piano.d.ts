type PianoKey = {
  note: string // 'C3', 'C#3', 'D3', etc.
  type: 'white' | 'black',
  label: string
}

type Tonality = 'major' | 'minor'

type PianoScale = {
  key: string
  name: string
  type: Tonality
  start: string
  end: string
}
