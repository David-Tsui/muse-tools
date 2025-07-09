import { describe, it, expect } from 'vitest'
import { useTonal } from './useTonal'

describe('useTonal', () => {
  const { getScaleNotes, getSimplifiedNote } = useTonal()

  it('should get C major scale notes in C4~C5', () => {
    const notes = getScaleNotes('C major', { start: 'C4', end: 'C5' })
    expect(notes).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'])
  })

  it('should get A harmonic minor scale notes in A3~A4', () => {
    const notes = getScaleNotes('A harmonic minor', { start: 'A3', end: 'A4' })
    expect(notes).toEqual(['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G#4', 'A4'])
  })

  it('should simplify double sharps and flats', () => {
    expect(getSimplifiedNote('F##4')).toBe('G4')
    expect(getSimplifiedNote('E##')).toBe('F#')
    expect(getSimplifiedNote('Abb')).toBe('G')
    expect(getSimplifiedNote('C#')).toBe('C#')
  })

  it('should return empty array for invalid scale', () => {
    expect(getScaleNotes('NotAScale', { start: 'C4', end: 'C5' })).toEqual([])
  })
})
