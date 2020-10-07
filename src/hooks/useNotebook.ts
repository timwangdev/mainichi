import { Dispatch, useEffect } from "react";
import { getAllNoteWords, removeNoteWord, setNoteWord } from "../data";
import { Action, Word } from "../types";

function useNotebook(
  nextAction: string,
  word: Word,
  dispatch: Dispatch<Action>
) {
  useEffect(function getNotebook() {
    (async () => {
      let list = await getAllNoteWords();
      dispatch({ type: "setNotebook", payload: list });
    })();
  }, []);

  useEffect(
    function notebookAction() {
      if (nextAction === "none") {
        return;
      }
      (async () => {
        let list;
        if (nextAction === "save") {
          list = await setNoteWord(word);
        } else if (nextAction === "remove") {
          list = await removeNoteWord(word);
        }
        dispatch({ type: "setNotebook", payload: list });
      })();
    },
    [nextAction]
  );
}

export default useNotebook;
