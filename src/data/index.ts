import { UserSettings, Word } from "../types";
import { getItem, setItem } from "./storage";

const USER_SETTINGS = "user_settings";
const NOTEBOOK = "notebook";
const DB_VERSION = "db_version";

const CURRENT_VERSION = 2;

interface DataSets {
  [k: string]: { name: string; list: Word[] };
}

const dataSets = require("../../data/*.json") as DataSets;

export async function getDbVersion(defaultVersion = 1) {
  return Number.parseInt(await getItem(DB_VERSION), 10) || defaultVersion;
}

export async function setDbVersion() {
  await setItem(DB_VERSION, CURRENT_VERSION);
}

export async function migrateDb() {
  let dbVer = await getDbVersion();
  if (dbVer === CURRENT_VERSION) {
    return;
  }
  if (dbVer === 1) {
    await setItem(NOTEBOOK, []);
  }
  await setDbVersion();
}

export async function getWord(bookNo = "01") {
  let words = [];
  words = bookNo === "00" ? await getAllNoteWords() : dataSets[bookNo].list;
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
  if (list.some((i) => i.uuid === word.uuid)) {
    return;
  }
  list.push(word);
  await setItem(NOTEBOOK, list);
  return list;
}

export async function removeNoteWord(word: Word) {
  let list = await getAllNoteWords();
  list = list.filter((i) => i.uuid !== word.uuid);
  await setItem(NOTEBOOK, list);
  return list;
}
