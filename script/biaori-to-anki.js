/**
 * @author breeswish
 * @url https://gist.github.com/breeswish/807218232c3b8f3dd012bd3205692139
 */

const assert = require("assert").strict;
const child_process = require("child_process");
const path = require("path");
const crypto = require("crypto");
const glob = require("glob");
const fs = require("fs-extra");
const _ = require("lodash");
const sort = require("alphanum-sort");
const Kuroshiro = require("kuroshiro");
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");
const log = require("signale");
const chalk = require("chalk");
const xml2js = require("xml2js");

const kuroshiro = new Kuroshiro();

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

let extractAudio = false;

// Word counter is global to share the same note type
let counter = 0;

/**
 * Decrypt the resource data provided by the book app.
 */
function decryptDataV1(path, key) {
  const encData = fs.readFileSync(path);
  const iv = Buffer.alloc(128 / 8);
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  const data = [];
  data.push(decipher.update(encData));
  data.push(decipher.final());
  return Buffer.concat(data).toString("utf8");
}

/**
 * Pad by filling leading zeros. Default pad to 2 digits.
 */
function pad(str, n = 2) {
  return _.padStart(str, n, "0");
}

/**
 * Normalize symbols in the word.
 */
function normalizeWord(word) {
  return word
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/／/g, "/")
    .replace(/~/g, "～")
    .replace(/　/g, "")
    .replace(/\s+\(\s+/g, "(")
    .replace(/\s+\)\s+/g, ")")
    .replace(/\s+\/\s+/g, "/")
    .replace(/\s+~\s+/g, "～")
    .trim();
}

/**
 * Build an Anki style Furigana by giving `{ prefix, kana, kanji, suffix }`.
 */
function buildAnkiFurigana(r) {
  const p = [];
  if (r.prefix.length > 0) {
    p.push(r.prefix);
  }
  if (r.kana || r.kanji) {
    assert.ok(r.kana.length > 0);
    assert.ok(r.kanji.length > 0);
    p.push(` ${r.kanji}[${r.kana}] `);
  }
  if (r.suffix.length > 0) {
    p.push(r.suffix);
  }
  return p.join("");
}

/**
 * Find common prefix and suffix for the kana and kanji.
 *
 * Kana: こし, Kanji: 少し => Kana: こ, Kanji: 少, Suffix: し
 * @param {*} kana
 * @param {*} kanji
 */
function findKanaKanjiCommonString(kana, kanji) {
  let kanaChars = Array.from(kana);
  let kanjiChars = Array.from(kanji);

  const prefix = _.takeWhile(kanaChars, (ch, idx) => kanjiChars[idx] === ch);
  kanaChars = _.drop(kanaChars, prefix.length);
  kanjiChars = _.drop(kanjiChars, prefix.length);

  const suffix = _.takeRightWhile(kanaChars, (ch, idx) => {
    const rIdx = kanaChars.length - idx;
    return _.nth(kanjiChars, -rIdx) === ch;
  });
  kanaChars = _.dropRight(kanaChars, suffix.length);
  kanjiChars = _.dropRight(kanjiChars, suffix.length);

  return {
    prefix: prefix.join(""),
    kana: kanaChars.join(""),
    kanji: kanjiChars.join(""),
    suffix: suffix.join(""),
  };
}

(function __testFindKanaKanjiCommonString() {
  for (const [
    inputKana,
    inputKanji,
    expectPrefix,
    expectKana,
    expectKanji,
    expectSuffix,
  ] of [
    ["うち", "うち", "うち", "", "", ""],
    ["こし", "少し", "", "こ", "少", "し"],
    ["おねがいします", "お願いします", "お", "ねが", "願", "いします"],
    [
      "お/ご～もうしあげる",
      "お/ご～申し上げる",
      "お/ご～",
      "もうしあ",
      "申し上",
      "げる",
    ],
  ]) {
    const result = findKanaKanjiCommonString(inputKana, inputKanji);
    assert.equal(result.prefix, expectPrefix);
    assert.equal(result.kana, expectKana);
    assert.equal(result.kanji, expectKanji);
    assert.equal(result.suffix, expectSuffix);
  }
})();

/**
 * Transform a single furigana item in bracket format into Anki format.
 * Example: こし(少し) => 少[こ] し
 * See test cases below for all supported formats.
 */
async function transformFuriganaAsync(normalizedSingleWord) {
  // If there is no bracket, return as it is.
  // Sample: うち
  if (normalizedSingleWord.indexOf("(") === -1) {
    return normalizedSingleWord;
  }

  // Sample: こし(少し) => kana: こし, kanji: 少し
  const kana = normalizedSingleWord.replace(/\([^\)]+\)/g, "").trim();
  const kanji = normalizedSingleWord.match(/\(([^\)]+)\)/)[1].trim();

  // Always call `inferMissingKanaSimple` since it will extract common prefix / suffix even if there is no `~`.
  const r1 = inferMissingKanaSimple(kana, kanji);

  if (r1.indexOf("～") !== -1) {
    const r2 = await inferMissingKanaAdvancedAsync(kana, kanji);
    if (r2 !== false) {
      return r2;
    }
  }

  return r1;
}

async function __testTransformFuriganaAsync() {
  for (const [input, expect] of [
    ["うち", "うち"],
    ["こし(少し)", "少[こ] し"],
    [
      "お／ご～もうしあげる（お／ご～申し上げる）",
      "お/ご～ 申し上[もうしあ] げる",
    ],
    ["れんしゅうします(練習～)", "練習[れんしゅう] します"],
    ["さいようする（採用～）", "採用[さいよう] する"],
    ["イギリスじん（～人）", "イギリス 人[じん]"],
    ["じどうドア(自動～)", "自動[じどう] ドア"],
    ["おじゃまします(お邪魔～)", "お 邪魔[じゃま] します"],
    ["シャンハイパール（上海～）", "上海[シャンハイ] パール"],
    [
      "よろしくおつたえください(～お伝えください)",
      "よろしくお 伝[つた] えください",
    ],
    [
      "さどトキほごセンター（佐渡～保護～）",
      "佐渡[さど] トキ 保護[ほご] センター",
    ],
  ]) {
    const result = await transformFuriganaAsync(normalizeWord(input));
    assert.equal(result, expect);
  }
}

function inferMissingKanaSimple(kana, kanji) {
  let prefix = "";
  let suffix = "";

  // If there is a `~` in the Kanji, try to fold it.

  // 1. trailing ~ may represent する or します
  // Sample: れんしゅうします(練習～) => 練習[れんしゅう] します
  if (kanji.endsWith("～")) {
    ["する", "ずる", "します"].forEach((kanaSuffix) => {
      if (kana.endsWith(kanaSuffix)) {
        suffix += kanaSuffix;
        kanji = _.dropRight(kanji.split(""), 1).join("");
        kana = _.dropRight(kana.split(""), kanaSuffix.length).join("");
        return false;
      }
    });
  }

  // 2. leading ~ or trailing ~ may represent Katakana
  // Sample: イギリスじん（～人） => イギリス 人[じん]
  {
    const kanaChars = Array.from(kana);
    if (kanji.endsWith("～")) {
      const kSuffix = _.takeRightWhile(kanaChars, Kuroshiro.Util.isKatakana);
      if (kSuffix.length > 0 && kSuffix.length < kanaChars.length) {
        const v = kSuffix.join("");
        suffix += v;
        kanji = _.dropRight(kanji.split(""), 1).join("");
        kana = _.dropRight(kana.split(""), v.length).join("");
      }
    } else if (kanji.startsWith("～")) {
      const kPrefix = _.takeWhile(kanaChars, Kuroshiro.Util.isKatakana);
      if (kPrefix.length > 0 && kPrefix.length < kanaChars.length) {
        const v = kPrefix.join("");
        prefix += v;
        kanji = _.trimStart(kanji, "～");
        kana = _.trimStart(kana, v);
      }
    }
  }

  assert.ok(kana.length > 0);
  assert.ok(kanji.length > 0);

  // Fold common prefix / suffix
  const r = findKanaKanjiCommonString(kana, kanji);
  prefix += r.prefix;
  suffix = r.suffix + suffix;
  kana = r.kana;
  kanji = r.kanji;

  return buildAnkiFurigana({ prefix, suffix, kana, kanji }).trim();
}

async function inferMissingKanaAdvancedAsync(kana, kanji) {
  if (kanji.indexOf("～") === -1) {
    return false;
  }

  // FIXME: Sometimes this doesn't work, like だんボールばこ（段～箱）

  // transform kanji to hiragana / katakana, then match
  // Sample: さどトキほごセンター（佐渡～保護～）
  // 1. Split Kanji by ~: [佐渡, 保護, ]
  // 2. Transform Kanji: [さど/サド, ほご/ホゴ, ]
  // 3. Build regex: ^(さど|サド)(.*?)(ほご|ホゴ)(.*?)$
  // 4. Match result: [さど, トキ, ほご, センター]
  // 5. Build final result: 佐渡[さど] トキ 保護[ほご] センター

  const kanjiSegments = await Promise.all(
    kanji.split("～").map(async (kanji) => {
      if (kanji.length === 0) {
        return {
          isEmpty: true,
        };
      }
      const hiragana = await kuroshiro.convert(kanji, { to: "hiragana" });
      const katakana = Kuroshiro.Util.kanaToKatakana(hiragana);
      return {
        isEmpty: false,
        kanji,
        hiragana,
        katakana,
      };
    })
  );

  const rBody = kanjiSegments
    .map((s) => {
      if (s.isEmpty) {
        return "";
      }
      return `(${_.escapeRegExp(s.hiragana)}|${_.escapeRegExp(s.katakana)})`;
    })
    .join("(.*?)");
  const r = new RegExp(`^${rBody}$`);
  const m = kana.match(r);
  if (!m) {
    return false;
  }

  const result = [];
  let iMatch = 1;
  for (let iKanji = 0; iKanji < kanjiSegments.length; iKanji++) {
    if (!kanjiSegments[iKanji].isEmpty) {
      const kana = m[iMatch];
      const kanji = kanjiSegments[iKanji].kanji;
      const r = findKanaKanjiCommonString(kana, kanji);
      result.push(buildAnkiFurigana(r));
      iMatch++;
    }
    if (iKanji !== kanjiSegments.length - 1) {
      result.push(m[iMatch]);
      iMatch++;
    }
  }
  assert.ok(iMatch, m.length);
  return result.join("").trim();
}

async function _transformPlainFuriganaWordAsync(normalizedWord) {
  if (normalizedWord.match(/\([^\)\/]+\//)) {
    // If there is a `/` inside `(`, do not split the word by /.
    // Sample word: お／ご～もうしあげる（お／ご～申し上げる）

    // Only support <= 2 `/` in the word (1 in bracket, 0/1 outside bracket).
    assert.ok(normalizedWord.replace(/[^\/]/g, "").length <= 2, normalizedWord);

    return await transformFuriganaAsync(normalizedWord);
  } else {
    // If there is a `/` and it is not in the bracket, separate the word by `/`.
    // Samples:
    // うち
    // こし(少し)／ちょっと
    const subWords = normalizedWord.split("/");
    const transformedSubWords = await Promise.all(
      subWords.map(transformFuriganaAsync)
    );
    return transformedSubWords.join(" / ");
  }
}

/**
 * Transform a plain word contains furigana in the book format into Anki format.
 * See test cases below for all supported formats.
 */
async function transformPlainFuriganaWordAsync(normalizedWord) {
  let result = await _transformPlainFuriganaWordAsync(normalizedWord);
  result = await optimizeAnkiFuriganaAsync(result.trim());
  // Additionally verifies that Kana from `normalizedWord` equals to Kana from result.
  assert.equal(
    extractKanaFromBookFormat(normalizedWord),
    extractKanaFromAnkiFormat(result)
  );
  return result;
}

async function __testTransformPlainFuriganaWordAsync() {
  for (const [input, expect] of [
    ["うち", "うち"],
    ["こし(少し)", "少[こ] し"],
    ["かならず(必ず)", "必[かなら] ず"],
    ["すこし(少し)／ちょっと", "少[すこ] し / ちょっと"],
    ["ごぜん(午前)/エーエム(am)", "午前[ごぜん] / am[エーエム]"],
    [
      "チェコきょうわこく（～共和国）／チェコ",
      "チェコ 共和[きょうわ] 国[こく] / チェコ", // FIXME: missing space?
    ],
    [
      "～時／～分／～半／～月/～日／～年／～ごろ",
      "～時 / ～分 / ～半 / ～月 / ～日 / ～年 / ～ごろ",
    ],
    [
      "お／ご～もうしあげる（お／ご～申し上げる）",
      "お/ご～ 申し上[もうしあ] げる",
    ],
  ]) {
    const result = await transformPlainFuriganaWordAsync(normalizeWord(input));
    assert.equal(result, expect);
  }
}

/**
 * Optimize a Furigana in Anki format by using kuroshiro to transform again.
 * If the kanas in transformed result is the same as the original one, use
 * the transformed result.
 * Sample: `中華大学[ちゅうかだいがく]` => `中華[ちゅうか]大学[だいがく]`
 */
async function optimizeAnkiFuriganaAsync(r) {
  // Strip all `[...]` from the Anki format.
  const kanji = r.replace(/\[[^\]]+\]/g, "").trim();
  let r2 = await kuroshiro.convert(kanji, {
    mode: "furigana", // in order to preserve space between segments, use furigana
    to: "hiragana",
  });
  r2 = r2
    .replaceAll("<ruby>", " ")
    .replaceAll("<rp>(</rp><rt>", "[")
    .replaceAll("</rt><rp>)</rp></ruby>", "] ")
    .replace(/\s+/g, " ")
    .trim();
  if (extractKanaFromAnkiFormat(r2) === extractKanaFromAnkiFormat(r)) {
    if (r2 !== r) {
      log.note("Optimized %s → %s", r, chalk.blue(r2));
    }
    return r2;
  }
  return r;
}

/**
 * Extract Kana sequence from the book format by removing all brackets and non Kana characters.
 * Sample: `チェコきょうわこく（～共和国）／チェコ` => `チェコきょうわこくチェコ`
 */
function extractKanaFromBookFormat(w) {
  return w
    .replace(/\([^\)]+\)/g, "")
    .trim()
    .split("")
    .filter((ch) => Kuroshiro.Util.isKana(ch))
    .join("");
}

/**
 * Extract Kana sequence from the Anki format by preserving the bracket part and remove non Kana characters.
 * Sample: `午前[ごぜん] / am[エーエム]` => `ごぜんエーエム`
 */
function extractKanaFromAnkiFormat(w) {
  return w
    .split(" ")
    .map((seg) => {
      if (seg.indexOf("[") > -1) {
        return [...seg.matchAll(/\[([^\]]+)\]/g)]
          .map((v) => v[1].trim())
          .join("");
      } else {
        // If there is no `[`, use content directly
        return seg;
      }
    })
    .join("")
    .split("")
    .filter((ch) => Kuroshiro.Util.isKana(ch))
    .join("");
}

/**
 * Transform a word contains furigana in the book format in XML into Anki format.
 */
async function transformXmlFuriganaWordAsync(xml) {
  const r = [];
  const nodes = await xml2js.parseStringPromise(xml);
  nodes.xml.tag.forEach((tag) => {
    if (!tag._) {
      return;
    }
    if (tag.$.superscript) {
      r.push(`${tag._.trim()}[${tag.$.superscript.trim()}]`);
    } else {
      r.push(tag._.trim());
    }
  });
  return r.join(" ").trim();
}

async function __testTransformXmlFuriganaWordAsync() {
  for (const [input, expect] of [
    [
      "<xml><tag name='common' superscript='だい'>第</tag><tag name='common'>～  </tag></xml>",
      "第[だい] ～",
    ],
    [
      "<xml><tag name='common'>～</tag><tag name='common' superscript='き'>気</tag><tag name='common' superscript='ど'>取</tag><tag name='common'>り</tag></xml>",
      "～ 気[き] 取[ど] り",
    ],
  ]) {
    const result = await transformXmlFuriganaWordAsync(normalizeWord(input));
    assert.equal(result, expect);
  }
}

/**
 * Transform a word from the book into Anki format.
 */
async function transformWordAsync(word) {
  let w = normalizeWord(word);
  if (w.indexOf("<xml>") === -1) {
    // Sample:
    // かならず(必ず) => 必ず[かならず]
    return await transformPlainFuriganaWordAsync(w);
  } else if (w.indexOf("superscript") === -1) {
    // Samples:
    // <xml><tag name='common'>へいせい（平成）</tag></xml>
    const plainWord = w.replace(/\<[^\>]+\>/g, "");
    return await transformPlainFuriganaWordAsync(plainWord);
  } else {
    // Sample:
    // <xml><tag name='common' superscript='だい'>第</tag><tag name='common'>～  </tag></xml>
    // Just follow the tag
    return await transformXmlFuriganaWordAsync(w);
  }
}

async function __testTransformWordAsync() {
  for (const [input, expect] of [
    ["かならず(必ず)", "必[かなら] ず"],
    ["<xml><tag name='common'>へいせい（平成）</tag></xml>", "平成[へいせい]"],
  ]) {
    const result = await transformWordAsync(normalizeWord(input));
    assert.equal(result, expect);
  }
}

function fixBrokenWord(word) {
  // There are two broken words in the original data
  const m = {
    "そば　　　[名]": "そば",
    "このごろ　　[名]": "このごろ",
  };
  for (let key in m) {
    if (word === key) {
      return m[key];
    }
  }
  return word;
}

async function processBook(bookName, bookId, cipherKey, basePath) {
  log.start(
    "Process book %s in %s",
    chalk.green(bookName),
    chalk.green(basePath)
  );

  const lessonPaths = sort(glob.sync(path.join(basePath, "*/lesson*")));
  const outputDir = `./output/${bookName}/mp3`;
  const notes = [];

  fs.ensureDirSync(outputDir);

  for (const lessonPath of lessonPaths) {
    const m = lessonPath.match(/unit(\d+)\/lesson(\d+)/);
    if (!m) {
      throw new Error("Path not matching");
    }

    const wordDataPath = path.join(lessonPath, "words.dat");
    const wordData = JSON.parse(decryptDataV1(wordDataPath, cipherKey));
    const words = wordData.content.filter((word) => word.linetype === "1");

    const [unitIdx, lessonIdx] = m.slice(1);

    log.start(
      "Process book %s, unit %s, lesson %s",
      chalk.green(bookName),
      chalk.green(unitIdx),
      chalk.green(lessonIdx)
    );

    for (let wordIdx = 0; wordIdx < words.length; wordIdx++) {
      const wordItem = words[wordIdx];
      const audioName = [
        `book${pad(bookId)}`,
        `lesson${pad(lessonIdx)}`,
        `${pad(wordIdx)}.mp3`,
      ].join("-");
      const audioPath = path.join(outputDir, audioName);

      const ankiWord = await transformWordAsync(fixBrokenWord(wordItem.word));

      if (wordItem.word.indexOf("～") > -1) {
        if (ankiWord.indexOf("～") === -1) {
          log.note(
            "Infer success: %s → %s",
            wordItem.word,
            chalk.yellow(ankiWord)
          );
        } else {
          log.warn("Infer failed: %s → %s", wordItem.word, chalk.red(ankiWord));
        }
      }

      const data = {
        id: pad(counter++, 4),
        jp: ankiWord,
        type: wordItem.wordtype.trim(),
        trans: wordItem.trans.trim() || "/",
        lesson: pad(lessonIdx),
        audio: audioName,
        tag: `${bookName}第${lessonIdx}课 ${bookName}第${unitIdx}单元`,
      };

      notes.push(data);

      if (extractAudio) {
        child_process.spawnSync(
          "ffmpeg",
          [
            "-i",
            path.join(lessonPath, "lesson_words.pepm"),
            "-codec:a",
            "libmp3lame",
            "-qscale:a", // reduce file size by setting a lower quality
            "6",
            "-ss",
            wordItem.starttime.trim(),
            "-to",
            wordItem.endtime.trim(),
            "-metadata",
            `title="${wordItem.word.trim()}"`,
            "-id3v2_version",
            "3",
            "-write_id3v1",
            "1",
            "-y",
            audioPath,
          ],
          { shell: true }
        );
      }
    }
  }

  log.info("Writing data to %s", chalk.green(`./output/${bookName}/data.txt`));
  fs.writeFileSync(
    `./output/${bookName}/data.txt`,
    notes
      .map((data) =>
        [
          data.id,
          data.jp,
          data.type,
          data.trans,
          data.lesson,
          `[sound:${data.audio}]`,
          data.tag,
        ].join("\t")
      )
      .join("\n")
  );
}

async function main() {
  // If you want to extract audio (it takes some time!):
  // extractAudio = true;

  await kuroshiro.init(new KuromojiAnalyzer());

  log.start("Run pre-check test cases");
  await __testTransformFuriganaAsync();
  await __testTransformPlainFuriganaWordAsync();
  await __testTransformXmlFuriganaWordAsync();
  await __testTransformWordAsync();

  await processBook("初级", 1, "@@www.pep.com.cn", "./resources/book1");
  await processBook("中级", 2, "@@pepmres.com.cn", "./resources/book2");
  await processBook("高级", 3, "@@pepmres.com.cn", "./resources/book3");
}

main().catch((e) => console.error(e));