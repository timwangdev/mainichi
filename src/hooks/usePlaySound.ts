import { useContext, useEffect } from "react";
import Dispatch from "../context/Dispatch";

function usePlaySound(audio: HTMLAudioElement, shouldPlay: boolean) {
  let dispatch = useContext(Dispatch);
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
