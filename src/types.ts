export interface AppState {
  isModalOpen: boolean;
  isMenuOpen: boolean;
  word: Word | null;
  notebook: Word[];
  nextNotebookAction: "none" | "save" | "remove";
  notebookTarget?: Word;
  userSettings: UserSettings;
  soundToPlay: string | null;
  fetchingNext: boolean;
  fetchSettings: boolean;
}

export interface Action<P = any> {
  type: string;
  payload?: P;
}

export interface Word {
  uuid: string;
  part: string;
  kana: string;
  romaji: string;
  furigana: string;
  chinese: string;
  bookId: string;
  lessonId: string;
  wordId: string;
  sound: string;
  tags?: string[];
}

export interface UserSettings {
  hideRomaji?: boolean;
  hideHiragana?: boolean;
  hideMeaning?: boolean;
  autoplaySound?: boolean;
  wordLibrary?: string;
}
