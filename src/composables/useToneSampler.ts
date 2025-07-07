import * as Tone from 'tone'
import { PIANO_AUDIO_SOURCES } from '../constant/piano'

export function useToneSampler() {
  const isAudioLoaded = ref(false)

  const audioMap = Object.fromEntries(
    Object.entries(PIANO_AUDIO_SOURCES).map(([note, file]) => [
      note,
      `/sound/${file}`
    ])
  )

  const sampler = new Tone.Sampler(
    audioMap,
    () => {
      console.log('Sampler loaded with audio files:', Object.keys(audioMap))
      isAudioLoaded.value = true
    }
  ).toDestination()

  const play = (note: string) => {
    sampler.triggerAttack(note)
  }

  const stop = (note: string) => {
    sampler.triggerRelease(note)
  }

  return {
    isAudioLoaded,
    sampler,
    play,
    stop,
  }
}
