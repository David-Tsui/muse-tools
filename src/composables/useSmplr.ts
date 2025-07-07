import { SplendidGrandPiano, Reverb } from "smplr";

export function useSmplr() {
  const isAudioLoaded = ref(false);
  const context = new AudioContext();
  const piano = new SplendidGrandPiano(context);
  piano.output.addEffect("reverb", new Reverb(context), 0.2);

  piano.load.then(() => {
    isAudioLoaded.value = true;
  }).catch((error) => {
    console.error("Error loading piano samples:", error);
  });

  const play = (note: string) => {
    piano.start({ note });
  }

  const stop = () => {
    piano.stop();
  }

  return {
    play,
    stop,
    isAudioLoaded,
  }
}
