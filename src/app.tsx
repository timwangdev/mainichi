import * as React from "react";
import { useMemo, useReducer } from "react";
import { ThemeProvider } from "styled-components";
import CardStack from "./compoents/CardStack";
import Container from "./compoents/Container";
import Footer from "./compoents/Footer";
import GlobalStyle from "./compoents/GlobalStyle";
import MenuToggle from "./compoents/MenuToggle";
import Notebook from "./compoents/Notebook";
import Overlay from "./compoents/Overlay";
import SidePanel from "./compoents/SidePanel";
import Dispatch from "./context/Dispatch";
import useFetchWord from "./hooks/useFetchWord";
import useInitDb from "./hooks/useInitDb";
import useNotebook from "./hooks/useNotebook";
import usePlaySound from "./hooks/usePlaySound";
import useUserSettings from "./hooks/useUserSettings";
import reducer from "./reducer";
import { AppState } from "./types";
import theme from "./utils/theme";

const initialState: AppState = {
  isModalOpen: false,
  isMenuOpen: false,
  word: null,
  notebook: [],
  nextNotebookAction: "none",
  userSettings: {},
  audio: null,
  shouldPlay: false,
  fetchingNext: false,
  fetchSettings: false,
};

const App = () => {
  let [store, dispatch] = useReducer(reducer, initialState);

  useInitDb();
  useUserSettings(store.userSettings, store.fetchSettings);
  useFetchWord(
    store.fetchingNext,
    store.userSettings.wordLibrary,
    store.userSettings.autoplaySound
  );
  useNotebook(store.nextNotebookAction, store.notebookTarget || store.word);
  usePlaySound(store.audio, store.shouldPlay);

  let isWordSaved = useMemo(
    () =>
      store.word &&
      store.notebook.findIndex((i) => store.word.uuid === i.uuid) !== -1,
    [store.word, store.notebook]
  );

  return (
    <Dispatch.Provider value={dispatch}>
      <Container>
        {store.word && (
          <CardStack
            word={store.word}
            wordSaved={isWordSaved}
            hideHiragana={store.userSettings.hideHiragana}
            hideRomaji={store.userSettings.hideRomaji}
            hideMeaning={store.userSettings.hideMeaning}
          />
        )}
      </Container>
      <Overlay
        isShown={store.isMenuOpen || store.isModalOpen}
        onClick={() => dispatch({ type: "closeAll" })}
      />
      <MenuToggle isActive={store.isMenuOpen} />
      <SidePanel
        isOpened={store.isMenuOpen}
        isNotebookEnabled={store.notebook.length !== 0}
        userSettings={store.userSettings}
      />
      <Footer />
      <Notebook notebook={store.notebook} isModalOpen={store.isModalOpen} />
    </Dispatch.Provider>
  );
};

export default () => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <App />
  </ThemeProvider>
);
