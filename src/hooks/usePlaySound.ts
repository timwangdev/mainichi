import { useEffect } from "react";

function usePlaySound(audio: HTMLAudioElement, shouldPlay: boolean, dispatch) {
  useEffect(
    function playSound() {
      if (shouldPlay) {
        audio.play();
        dispatch({ type: "soundPlayed" });
      }
    },
    [audio, shouldPlay]
  );
}

export default usePlaySound;
