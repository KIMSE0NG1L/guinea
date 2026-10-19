// Search for ingredient and dish lists. Ignores spaces and case, and also matches by
// Korean initial consonants (초성), so "ㄸㅂㅇ" finds 떡볶이 and "ㄱㄷㅇ" finds 고등어.

const CHOSEONG = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

function normalize(text: string) {
  return text.replace(/\s+/g, "").toLowerCase();
}

// "떡볶이" -> "ㄸㅂㅇ"; anything that isn't a Hangul syllable stays as it is.
function toChoseong(text: string) {
  return Array.from(text)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code < HANGUL_START || code > HANGUL_END) return char;
      return CHOSEONG[Math.floor((code - HANGUL_START) / 588)];
    })
    .join("");
}

const isAllChoseong = (text: string) => text.length > 0 && Array.from(text).every((char) => CHOSEONG.includes(char));

// True when the query is empty or any of the texts contains it (as typed, or by 초성).
export function matchesSearch(query: string, ...texts: string[]) {
  const q = normalize(query);
  if (!q) return true;
  return texts.some((text) => {
    const t = normalize(text);
    if (t.includes(q)) return true;
    return isAllChoseong(q) && toChoseong(t).includes(q);
  });
}
