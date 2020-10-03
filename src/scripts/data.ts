// @ts-ignore
import dataSet from '../../data/*.json';
import { getAllNoteWords } from './storage';

export interface Word {
    id: number,
    part: string,
    hiragana: string,
    romaji: string,
    kanji: string,
    chinese: string,
    book: number,
    lesson: number,
    sound: string
}

export async function getWord(bookNo: number) {
    let words = [];
    if (bookNo === 0) {
        words = getAllNoteWords();
    } else {
        words = dataSet['book' + bookNo];
    }
    let idx = Math.floor(Math.random() * words.length);
    return words[idx] as Word;
}