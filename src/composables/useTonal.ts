import { Scale } from 'tonal'

export function useTonal() {
  /**
   * 取得指定範圍內的音階音符
   * @param scaleName 例如 'C major'
   * @param options { start: 'C2', end: 'C7' }
   */
  const getPerfectScaleNotes = (
    scaleName: string = 'C major', // major or harmonic muse in lower case
    options: { start?: string; end?: string } = {}
  ): string[] => {
    const { start = 'C2', end = 'C7' } = options
    const range = Scale.rangeOf(scaleName)
    const notes = (range(start, end) || []) as string[]

    return notes
  }

  return {
    getPerfectScaleNotes,
  }
}
