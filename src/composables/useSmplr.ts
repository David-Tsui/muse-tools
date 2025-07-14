import { SplendidGrandPiano, Reverb } from "smplr"

export function useSmplr() {
  const isAudioLoaded = ref(false)
  const context = new AudioContext()
  const piano = new SplendidGrandPiano(context)
  piano.output.addEffect("reverb", new Reverb(context), 0.2)

  piano.load.then(() => {
    isAudioLoaded.value = true
  }).catch((error) => {
    console.error("Error loading piano samples:", error)
  })

  const play = (note: string) => {
    const stopFn = piano.start({ note })
    return stopFn as (time?: number) => void
  }

  const stop = (note: string | number) => {
    piano.stop(note)
  }

  const stopAll = () => {
    piano.stop()
  }

  return {
    play,
    stop,
    stopAll,
    isAudioLoaded,
  }
}
