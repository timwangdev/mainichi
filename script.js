window.COLORLIST = [
    '#ffa2a5',
    '#fda46f',
    '#ffff79',
    '#9af996',
    '#a3ffed',
    '#84c6f4',
    '#beb4ff',
    '#d89bde'
];

let contents = Object.values(window.WORDLIST);
let idx = Math.floor(Math.random() * contents.length);
let card = contents[idx];

let colorIdx = Math.floor(Math.random() * window.COLORLIST.length);

let image = card.img;
let hiragana = card.jp.wd;
let kanji = card.jp.kj;
let romaji = card.jp.rmj;
let chinese = card.cn;
let english = card.en;

document.getElementById('hiragana').innerText = hiragana;
document.getElementById('kanji').innerText = kanji;
document.getElementById('romaji').innerText = romaji;
document.getElementById('chinese').innerText = chinese;
document.getElementById('english').innerText = english;

document.getElementById('card').style.backgroundColor = window.COLORLIST[colorIdx];
document.getElementById('card-img').style.backgroundImage = `url('images/${image}.png')`;

document.getElementById('pronunciation').addEventListener('click', () => {
    if (!window.speechSynthesis) {
        console.warn('Web Speech API is not available in your browser.')
        return;
    }
    let speech = new SpeechSynthesisUtterance(hiragana);
    speech.lang = "ja-JP";
    window.speechSynthesis.speak(speech);
});