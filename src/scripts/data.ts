// @ts-ignore
import dataSet from '../../data/*.json';

interface Word {
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

export async function getWord() {
    const words = dataSet.book1;
    let idx = Math.floor(Math.random() * words.length);
    return words[idx] as Word;
}