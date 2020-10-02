import { getRandomColor } from "./color";
import { getWord } from "./data";
import { getAllUserSettings, setUserSetting, UserSettings } from "./storage";

const MEDIA_URL = 'https://mainichi.cdn.timwang.me/sound/';

let sound = '';

async function main() {
    await renderWord();
    renderSettings();
    document.getElementById('pronunciation').addEventListener('click', () => {
        if (!sound) return;
        new Audio(MEDIA_URL + sound).play();
    });
    document.getElementById('menu-btn').addEventListener('click', () => {
        document.getElementsByTagName('body')[0].classList.toggle('side-show');
    });
    document.getElementById
}

async function renderWord() {
    let word = await getWord();
    let hasKanji = word.kanji !== '/';
    let title = hasKanji ? word.kanji : word.hiragana;
    let footnote = word.book === 1 ? "新标准日本语初级"
        : word.book === 2 ? "新标准日本语中级"
            : word.book === 3 ? "新标准日本语高级" : "";
    footnote += word.lesson ? ` - 第${word.lesson}課` : "";
    sound = word.sound;
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
    document.getElementById('card').style.backgroundColor = getRandomColor();
}

function renderSettings() {
    let userSettings = getAllUserSettings();
    Object.keys(userSettings).forEach((key) => {
        updateUserSetting(key, userSettings[key]);
        if (userSettings[key]) {
            document.getElementById(key).classList.add('active');
            if (key === 'autoplay_sound') {
                new Audio(MEDIA_URL + sound).play();
            }
        }
    });
    document.getElementById('user-settings').addEventListener('click', (ev) => {
        let li = ev.target as HTMLElement
        let isActive = li.classList.contains('active');
        updateUserSetting(li.id, !isActive);
        setUserSetting(li.id as any, !isActive);
        li.classList.toggle('active');
    })
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

main();
