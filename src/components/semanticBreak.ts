import { estimateTextWidth } from "./BalancedLines";

// Where centred copy should wrap: lines of about the same length, but only between words,
// and preferably where the sentence itself pauses. Each gap between words gets a cost for
// breaking there — free after a sentence end, cheap after a comma or a connective ending
// (…고 / …면 / …서 / …지만 …), a bit more after a particle (…은 / …에서), dear in the
// middle of a phrase — and the split with the lowest
// total of those costs plus how uneven the lines are wins. So an even split that cuts a
// phrase loses to a slightly uneven one at a pause, but a lopsided split at a pause still
// loses to a balanced one at a clause boundary.
const SENTENCE_END = /[.!?…~)」』]$|요$|다$/;
const CLAUSE_END = /[,·:;—]$|(고|며|면|서|게|지만|는데|은데|니까|으니|어서|아서|해서|도록|려고|거나|든지|자면|라도|이고|이라|다가)$/;
// After a topic/subject/adverbial particle: a phrase boundary, weaker than a clause end.
const PHRASE_END = /(은|는|이|가|에서|에게|으로|로|에|와|과|도|만)$/;

function gapCost(word: string) {
  if (SENTENCE_END.test(word)) return 0;
  if (CLAUSE_END.test(word)) return 0.35;
  if (PHRASE_END.test(word)) return 0.7;
  return 1;
}

// Returns `text` with "\n" inserted at the chosen breaks, or unchanged when it already fits
// on one line, already has hand-placed line breaks, or can't be split into fitting lines.
export function semanticBreak(text: string, available: number, fontSize: number): string {
  if (text.includes("\n") || available <= 0) return text;
  const words = text.split(" ").filter((word) => word.length > 0);
  if (words.length < 2) return text;
  const widths = words.map((word) => estimateTextWidth(word, fontSize));
  const space = estimateTextWidth(" ", fontSize);
  const lineWidth = (from: number, to: number) => widths.slice(from, to).reduce((sum, w) => sum + w, 0) + space * (to - from - 1);
  const total = lineWidth(0, words.length);
  // A little slack: the width estimate is rough, and a line that overflows would wrap again.
  const limit = available * 0.94;
  if (total <= limit) return text;

  const minLines = Math.ceil(total / limit);
  let best: { cost: number; breaks: number[] } | null = null;
  // One extra line is allowed when it lets every break land on a pause.
  for (let lines = minLines; lines <= Math.min(minLines + 1, words.length); lines += 1) {
    const mean = total / lines;
    // dp[k][i]: cheapest way to put the first i words on k lines (each within `limit`).
    const dp: number[][] = Array.from({ length: lines + 1 }, () => Array(words.length + 1).fill(Infinity));
    const from: number[][] = Array.from({ length: lines + 1 }, () => Array(words.length + 1).fill(0));
    dp[0][0] = 0;
    for (let k = 1; k <= lines; k += 1) {
      for (let i = k; i <= words.length; i += 1) {
        for (let j = k - 1; j < i; j += 1) {
          if (dp[k - 1][j] === Infinity) continue;
          const width = lineWidth(j, i);
          if (width > limit) continue;
          const uneven = ((width - mean) / mean) ** 2 * 3;
          const pause = i < words.length ? gapCost(words[i - 1]) : 0;
          const cost = dp[k - 1][j] + uneven + pause;
          if (cost < dp[k][i]) {
            dp[k][i] = cost;
            from[k][i] = j;
          }
        }
      }
    }
    // An extra line costs a little on its own, so it's only taken when it buys real pauses.
    const cost = dp[lines][words.length] + (lines - minLines) * 0.8;
    if (cost === Infinity) continue;
    if (!best || cost < best.cost) {
      const breaks: number[] = [];
      for (let k = lines, i = words.length; k > 0; k -= 1) {
        breaks.unshift(i);
        i = from[k][i];
      }
      best = { cost, breaks };
    }
  }
  if (!best) return text;
  let start = 0;
  return best.breaks
    .map((end) => {
      const line = words.slice(start, end).join(" ");
      start = end;
      return line;
    })
    .join("\n");
}
