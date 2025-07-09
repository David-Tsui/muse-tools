import { Note, Scale } from 'tonal'

export function useTonal() {
  /**
   * 取得指定範圍內的音階音符
   * @param scaleName 例如 'C major'
   * @param options { start: 'C2', end: 'C7' }
   */
  const getScaleNotes = (
    scaleName: string = 'C major', // major or harmonic muse in lower case
    options: { start?: string; end?: string } = {}
  ): string[] => {
    const { start = 'C2', end = 'C7' } = options
    const range = Scale.rangeOf(scaleName)
    const notes = (range(start, end) || []) as string[]
    const formattedNotes = notes.map(note => getSimplifiedNote(note))
    return formattedNotes
  }

  /**
   * 解決音符重升或重降的問題
   * 例如 'F##' => 'G'
   * @param note 音符名稱，例如 'C#', 'D', 'B#', 'F#', 'G#', 'A#'
   */
  const getSimplifiedNote = (note: string): string => {
    return note.match(/^[A-G][b#]{2}?/)
      ? Note.simplify(note)
      : note
  }

  return {
    getScaleNotes,
    getSimplifiedNote,
  }
}
