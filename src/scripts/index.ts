import { getRandomColor } from "./color";
import { getWord, Word } from "./data";
import { getAllNoteWords, getAllUserSettings, getWordLib, removeNoteWord, setNoteWord, setUserSetting, setWordLib, UserSettings } from "./storage";

const MEDIA_URL = 'https://mainichi.cdn.timwang.me/sound/';

let $saveWord = document.getElementById('save-word');
let $removeWord = document.getElementById('remove-word');
let $nextWord = document.getElementById('next-word');
let $librarySelect = document.forms['library-select'];

let word: Word;

async function main() {
    await renderWord();
    await renderSettings();
    document.getElementById('pronunciation').addEventListener('click', playSound);
    document.getElementById('menu-btn').addEventListener('click', () => {
        document.getElementsByTagName('body')[0].classList.toggle('side-show');
    });

    $librarySelect['library'].value = getWordLib();
    $librarySelect.addEventListener('change', () => {
        setWordLib($librarySelect['library'].value || 1);
        renderWord();
    });

    document.getElementById('user-settings').addEventListener('click', (ev) => {
        let li = ev.target as HTMLElement
        let isActive = li.classList.contains('active');
        updateUserSetting(li.id, !isActive);
        setUserSetting(li.id as any, !isActive);
        li.classList.toggle('active');
    });
    
    $saveWord.addEventListener('click', () => {
        showRemoveWordBtn();
        setNoteWord(word);
    });
    $removeWord.addEventListener('click', () => {
        showSaveWordBtn();
        removeNoteWord(word);
    });
    $nextWord.addEventListener('click', renderWord);
}

async function renderWord() {
    let lib = await getWordLib();
    word = await getWord(lib);
    if (!word) {
        return restoreWordLib();
    }
    let hasKanji = word.kanji !== '/';
    let title = hasKanji ? word.kanji : word.hiragana;
    let footnote = word.book === 1 ? "新标准日本语初级"
        : word.book === 2 ? "新标准日本语中级"
            : word.book === 3 ? "新标准日本语高级" : "";
    footnote += word.lesson ? ` - 第${word.lesson}課` : "";
    if (hasKanji) {
        document.getElementById('hiragana').innerText = word.hiragana;
    } else {
        document.getElementById('hiragana').style.display = 'none';
    }
    document.title = `${title} - ${document.title}`;
    document.getElementById('kanji').innerText = title;
    document.getElementById('romaji').innerText = word.romaji;
    document.getElementById('part').innerText = word.part;
    document.getElementById('chinese').innerText = word.chinese;
    document.getElementById('footnote').innerText = footnote;
    (document.getElementsByClassName('text-box')[0] as HTMLElement).style.backgroundColor = getRandomColor();

    await renderAction();

    let userSettings = await getAllUserSettings();
    if (userSettings.autoplay_sound) {
        playSound();
    }
}

async function renderSettings() {
    let userSettings = await getAllUserSettings();
    Object.keys(userSettings).forEach((key) => {
        updateUserSetting(key, userSettings[key]);
        if (userSettings[key]) {
            document.getElementById(key).classList.add('active');
        }
    });
}

async function renderAction() {
    const notedWords = await getAllNoteWords();
    if (notedWords.findIndex((i) => i.sound === word.sound) !== -1) {
        showRemoveWordBtn();
    } else {
        showSaveWordBtn();
    }
}

function updateUserSetting(key: string, value: boolean) {
    switch (key) {
        case 'hide_pronunciation':
            document.getElementById('romaji').classList.toggle('hide', value);
            return;
        case 'hide_hiragana':
            document.getElementById('hiragana').classList.toggle('hide', value);
            return;
        case 'hide_part':
            document.getElementById('part').classList.toggle('hide', value);
            return;
        case 'hide_meaning':
            document.getElementById('chinese').classList.toggle('hide', value);
            return;
        case 'autoplay_sound':
        default:
            return;
    }
}

async function restoreWordLib() {
    $librarySelect['library'].value = 1;
    setWordLib($librarySelect['library'].value || 1);
    await renderWord();
}

function playSound() {
    if (!word || !word.sound) return;
    return new Audio(MEDIA_URL + word.sound).play();
}

function showRemoveWordBtn() {
    $saveWord.style.display = 'none';
    $removeWord.style.display = 'flex';
}

function showSaveWordBtn() {
    $saveWord.style.display = 'flex';
    $removeWord.style.display = 'none';
}

main();
