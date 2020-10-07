import { Dispatch, useEffect } from "react";
import { getWord } from "../data";
import { Action } from "../types";

function useFetchWord(
  fetchingNext: boolean,
  wordLibrary: number,
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
              payload: { wordLibrary: 1 },
            });
            return;
          }
          dispatch({ type: "initWord", payload: word });
          if (autoplaySound) {
            dispatch({ type: "playSound", payload: word.sound });
          }
        })();
      }
    },
    [wordLibrary, fetchingNext, autoplaySound]
  );
}

export default useFetchWord;
