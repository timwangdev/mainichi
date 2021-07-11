import { Dispatch, useEffect } from "react";
import { getWord } from "../data";
import getMediaUrl from "../utils/getMediaUrl";
import { Action } from "../types";

function useFetchWord(
  fetchingNext: boolean,
  wordLibrary: string,
  autoplaySound: boolean,
  dispatch: Dispatch<Action>
) {
  useEffect(
    function fetchNext() {
      if (fetchingNext) {
        (async () => {
          let word = await getWord(wordLibrary);
          if (word == null) {
            dispatch({
              type: "changeUserSetting",
              payload: { wordLibrary: "01" },
            });
            return;
          }
          dispatch({ type: "initWord", payload: word });
          let audio = new Audio(getMediaUrl(word, word.sound));
          dispatch({ type: "playSound", payload: { audio, shouldPlay: autoplaySound } });
        })();
      }
    },
    [wordLibrary, fetchingNext, autoplaySound]
  );
}

export default useFetchWord;
