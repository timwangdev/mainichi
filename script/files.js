const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const Kuroshiro = require("kuroshiro");
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");

const tempDir = path.resolve(__dirname, '../tmp');
const dataDir = path.resolve(__dirname, '../data');

const kuroshiro = new Kuroshiro();

function getBookId(fileName) {
  switch (fileName) {
    case '1939635284.json':
      return '01';
    case '1892756252.json':
      return '02';
    case '1899668880.json':
      return '03';
    default:
      return '';
  }
}

async function main() {
  await kuroshiro.init(new KuromojiAnalyzer());

  for (const file of fs.readdirSync(tempDir)) {
    let content = fs.readFileSync(path.resolve(tempDir, file));
    let json = JSON.parse(content);
    let wordList = [];
    let bookId = getBookId(file);
    for (const note of json.notes) {
      let [wordId, kana, part, chinese, lessonId, sound] = note.fields;
      let word = kana.replace(/\s/g, '').replace(/\[[^\]]+\]/g, '').trim();
      let furigana = await kuroshiro.convert(word, { mode: "furigana", to: "hiragana" });
      let romaji = await kuroshiro.convert(word, { to: "romaji" });
      wordList.push({
        uuid: uuid.v4(),
        wordId,
        kana,
        furigana,
        romaji,
        part,
        chinese,
        bookId,
        lessonId,
        sound: sound.slice(7, -1),
        tags: note.tags,
      });    
    }

    fs.writeFileSync(path.resolve(dataDir, bookId + '.json'), JSON.stringify({
      name: json.name.slice(0, -7), list: wordList
    }, null, 2));
  }
  
}

main().catch((e) => console.error(e));
