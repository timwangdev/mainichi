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

let errorMsg = '';
let speechInited = false;

if (!window.speechSynthesis) {
    errorMsg = 'Web Speech API is not available in your browser.';
} else {
    setupSpeechSynthesis();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = setupSpeechSynthesis;
    }
}

function setupSpeechSynthesis() {
    if (speechInited) {
        return;
    }
    if (!window.speechSynthesis.getVoices().some((voice) => voice.lang === 'ja-JP')) {
        errorMsg = 'Japanses speech voice is currently not available in your browser.';
        return;
    }
    errorMsg = '';
    document.getElementById('speaker').style.backgroundImage = `url('images/volume.png')`;
    document.getElementById('pronunciation').addEventListener('click', () => {
        if (errorMsg !== '') {
            return showSnackbar(errorMsg);
        }
        let speech = new SpeechSynthesisUtterance(kanji === '-' ? hiragana : kanji);
        speech.lang = "ja-JP";
        window.speechSynthesis.speak(speech);
    });
    speechInited = true;
}

let $snackbar = document.getElementById('snackbar');

function showSnackbar(message) {
    if ($snackbar.classList.contains('show')) return;
    $snackbar.innerText = message;
    $snackbar.classList.add('show')
    setTimeout(() => $snackbar.classList.remove('show'), 5000);
}