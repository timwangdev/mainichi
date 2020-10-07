import * as React from "react";
import { Action, AppState } from "./types";

const reducer: React.Reducer<AppState, Action> = (
  prevState: AppState,
  action: Action
) => {
  console.log(prevState, action);
  switch (action.type) {
    case "initSettings":
      return { ...prevState, fetchingNext: true, userSettings: action.payload };
    case "initWord":
      return {
        ...prevState,
        fetchingNext: false,
        word: action.payload,
        nextNotebookAction: "none",
      };
    case "setNotebook":
      return {
        ...prevState,
        notebook: action.payload,
        nextNotebookAction: "none",
        notebookTarget: undefined,
      };
    case "toggleMenu":
      return { ...prevState, isMenuOpen: !prevState.isMenuOpen };
    case "openNotebook":
      return { ...prevState, isModalOpen: true, isMenuOpen: false };
    case "closeModal":
      return { ...prevState, isModalOpen: false };
    case "closeAll":
      return { ...prevState, isModalOpen: false, isMenuOpen: false };
    case "playSound":
      return { ...prevState, soundToPlay: action.payload };
    case "soundPlayed":
      return { ...prevState, soundToPlay: null };
    case "saveWord":
      return {
        ...prevState,
        nextNotebookAction: "save",
        notebookTarget: action.payload,
      };
    case "removeWord":
      return {
        ...prevState,
        nextNotebookAction: "remove",
        notebookTarget: action.payload,
      };
    case "switchNext":
      return { ...prevState, fetchingNext: true };
    case "changeUserSetting":
      return {
        ...prevState,
        userSettings: { ...prevState.userSettings, ...action.payload },
        fetchingNext:
          action.payload.wordLibrary != null &&
          prevState.userSettings.wordLibrary !== action.payload.wordLibrary,
      };
    default:
      return prevState;
  }
};

export default reducer;
