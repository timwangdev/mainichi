import { Word } from "../types";

function getDeckId(bookId) {
  switch (bookId) {
    case "01":
      return "1939635284";
    case "02":
      return "1892756252";
    case "03":
      return "1899668880";
    default:
      throw new Error("No media files matched.");
  }
}

function getMediaUrl(word: Word, sound: string) {
  return `https://timwang.me/biaori/decks/${getDeckId(
    word.bookId
  )}/media/${sound}`;
}

export default getMediaUrl;
