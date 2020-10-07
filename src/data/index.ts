import { UserSettings, Word } from "../types";
import { getItem, setItem } from "./storage";

const USER_SETTINGS = "user_settings";
const NOTEBOOK = "notebook";

interface DataSets {
  book1: Word[];
  book2: Word[];
  book3: Word[];
}

const dataSets = require("../../data/*.json") as DataSets;

export async function getWord(bookNo = 1) {
  let words = [];
  words = bookNo === 0 ? await getAllNoteWords() : dataSets["book" + bookNo];
  let idx = Math.floor(Math.random() * words.length);
  let word = words[idx] as Word;
  return word;
}

export async function getAllUserSettings(): Promise<UserSettings> {
  let settings = await getItem(USER_SETTINGS);
  return settings || {};
}

export async function setUserSettings(settings: UserSettings) {
  await setItem(USER_SETTINGS, settings);
}

export async function getAllNoteWords(): Promise<Word[]> {
  let list = await getItem(NOTEBOOK);
  return list || [];
}

export async function setNoteWord(word: Word) {
  let list = await getAllNoteWords();
  if (list.some((i) => i.id === word.id)) {
    return;
  }
  list.push(word);
  await setItem(NOTEBOOK, list);
  return list;
}

export async function removeNoteWord(word: Word) {
  let list = await getAllNoteWords();
  list = list.filter((i) => i.id !== word.id);
  await setItem(NOTEBOOK, list);
  return list;
}
