import { useContext, useEffect } from "react";
import Dispatch from "../context/Dispatch";
import { getWord } from "../data";
import getMediaUrl from "../utils/getMediaUrl";

function useFetchWord(
  fetchingNext: boolean,
  wordLibrary: string,
  autoplaySound: boolean
) {
  let dispatch = useContext(Dispatch);
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
          let audio = new Audio(getMediaUrl(word));
          dispatch({
            type: "playSound",
            payload: { audio, shouldPlay: autoplaySound },
          });
        })();
      }
    },
    [wordLibrary, fetchingNext, autoplaySound]
  );
}

export default useFetchWord;
