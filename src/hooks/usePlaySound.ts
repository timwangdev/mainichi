import { useEffect } from "react";
import getMediaUrl from "../utils/getMediaUrl";

function usePlaySound(soundToPlay, word, dispatch) {
  useEffect(
    function playSound() {
      if (soundToPlay) {
        let audio = new Audio(getMediaUrl(word, soundToPlay));
        audio.play();
        dispatch({ type: "soundPlayed" });
      }
    },
    [soundToPlay]
  );
}

export default usePlaySound;
