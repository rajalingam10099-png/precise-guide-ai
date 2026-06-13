// Pure pronunciation scoring (Module 4).
// Independent of which STT provider produced the transcript.

export type ScoreResult = {
  accuracy: number;       // 0-100
  pronunciation: number;  // 0-100
  mispronounced: string;
  ok: boolean;
};

export function scorePronunciation(target: string, spoken: string): ScoreResult {
  const t = target.trim();
  const s = spoken.trim();
  if (!s) return { accuracy: 0, pronunciation: 0, mispronounced: t, ok: false };
  const distance = levenshtein(t, s);
  const maxLen = Math.max(t.length, s.length, 1);
  const accuracy = Math.max(0, Math.round(((maxLen - distance) / maxLen) * 100));
  const pronunciation = Math.min(100, Math.round(accuracy * 0.9 + (s === t ? 10 : 0)));
  const mispronounced = diffSegment(t, s);
  return { accuracy, pronunciation, mispronounced, ok: accuracy >= 70 };
}

function levenshtein(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}

function diffSegment(target: string, spoken: string) {
  let i = 0;
  while (i < target.length && i < spoken.length && target[i] === spoken[i]) i++;
  return target.slice(i) || "—";
}
