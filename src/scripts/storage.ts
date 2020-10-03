import { Word } from "./data";

const storage = localStorage;

const USER_SETTINGS = 'user_settings';
const NOTEBOOK = 'notebook';
const WORD_LIB = 'word_lib';

export interface UserSettings {
    hide_pronunciation?: boolean;
    hide_hiragana?: boolean;
    hide_part?: boolean;
    hide_meaning?: boolean;
    autoplay_sound?: boolean;
}

const default_settings: UserSettings = {
    hide_pronunciation: false,
    hide_hiragana: false,
    hide_part: false,
    hide_meaning: false,
    autoplay_sound: false
}

export function getAllUserSettings(): UserSettings {
    let objStr = storage.getItem(USER_SETTINGS);
    if (!objStr) return default_settings;
    return JSON.parse(objStr);
}

export function setUserSetting(key: keyof UserSettings, value: boolean) {
    let settings = { ...getAllUserSettings(), ...{ [key]: value } };
    storage.setItem(USER_SETTINGS, JSON.stringify(settings));
}

export function getAllNoteWords(): Word[] {
    let listStr = storage.getItem(NOTEBOOK);
    if (!listStr) return [];
    return JSON.parse(listStr);
}

export function setNoteWord(word: Word) {
    let list = getAllNoteWords();
    if (list.some((i) => i.sound === word.sound)) {
        return;
    }
    list.push(word);
    storage.setItem(NOTEBOOK, JSON.stringify(list));
}

export function removeNoteWord(word: Word) {
    let list = getAllNoteWords();
    list = list.filter((i) => i.sound !== word.sound);
    storage.setItem(NOTEBOOK, JSON.stringify(list));
}

export function getWordLib(): number {
    let num = storage.getItem(WORD_LIB);
    return num != null ? Number.parseInt(num, 10) : 1;
}

export function setWordLib(num: number) {
    storage.setItem(WORD_LIB, String(num));
}