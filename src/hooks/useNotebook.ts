import { useContext, useEffect } from "react";
import Dispatch from "../context/Dispatch";
import { getAllNoteWords, removeNoteWord, setNoteWord } from "../data";
import { Word } from "../types";

function useNotebook(nextAction: string, word: Word) {
  let dispatch = useContext(Dispatch);
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
