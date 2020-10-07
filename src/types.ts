export interface AppState {
  isModalOpen: boolean;
  isMenuOpen: boolean;
  word: Word | null;
  notebook: Word[];
  nextNotebookAction: 'none' | 'save' | 'remove';
  notebookTarget?: Word;
  userSettings: UserSettings;
  soundToPlay: string | null;
  fetchingNext: boolean;
}

export interface Action<P = any> {
  type: string;
  payload?: P;
}

export interface Word {
  id: number;
  part: string;
  hiragana: string;
  romaji: string;
  kanji: string;
  chinese: string;
  book: number;
  lesson: number;
  sound: string;
}

export interface UserSettings {
  hideRomaji?: boolean;
  hideHiragana?: boolean;
  hideMeaning?: boolean;
  autoplaySound?: boolean;
  wordLibrary?: number;
}
