import { getRandomColor } from "./color";
import { getWord } from "./data";

const MEDIA_URL = 'https://mainichi.cdn.timwang.me/sound/';

async function main() {
    let word = await getWord();
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

    document.getElementById('kanji').innerText = title;
    document.getElementById('romaji').innerText = word.romaji;
    document.getElementById('part').innerText = word.part;
    document.getElementById('chinese').innerText = word.chinese;
    document.getElementById('footnote').innerText = footnote;
    document.getElementById('card').style.backgroundColor = getRandomColor();

    document.getElementById('pronunciation').addEventListener('click', () => {
        let audio = new Audio(MEDIA_URL + word.sound);
        audio.play();
    });


    
}

main();
