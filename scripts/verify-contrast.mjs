/**
 * WCAG contrast check for the brand palette.
 *
 * The brand guide's hard rule: #66C0C9 fails AA as small text on light and must
 * only ever be a fill or large display type. #1E6A74 is the text-safe teal.
 * This asserts the numbers rather than trusting the comment.
 */
const C = {
  teal: '#66C0C9', tealDeep: '#1E6A74', mist: '#B5DDDF', ink: '#060606',
  gold: '#E1CF7E', indigo: '#525BA2', paper: '#F4FAFA', muted: '#5C6B6D',
  danger: '#B3251F', white: '#FFFFFF',
};

const lum = (hex) => {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const pairs = [
  ['ink on paper', C.ink, C.paper, 4.5, true],
  ['tealDeep on paper', C.tealDeep, C.paper, 4.5, true],
  ['muted on paper', C.muted, C.paper, 4.5, true],
  ['danger on paper', C.danger, C.paper, 4.5, true],
  ['ink on teal (button fill)', C.ink, C.teal, 4.5, true],
  ['ink on mist', C.ink, C.mist, 4.5, true],
  ['ink on gold (badge)', C.ink, C.gold, 4.5, true],
  ['paper on ink (footer)', C.paper, C.ink, 4.5, true],
  ['mist on ink', C.mist, C.ink, 4.5, true],
  ['teal on ink', C.teal, C.ink, 4.5, true],
  // Must FAIL — this is the rule the guide warns about.
  ['teal on paper (must fail AA)', C.teal, C.paper, 4.5, false],
];

let bad = 0;
for (const [name, fg, bg, min, shouldPass] of pairs) {
  const r = ratio(fg, bg);
  const passes = r >= min;
  const ok = passes === shouldPass;
  if (!ok) bad++;
  console.log(
    `${ok ? 'OK  ' : 'BAD '} ${name.padEnd(30)} ${r.toFixed(2)}:1  ${passes ? 'passes' : 'fails'} AA${shouldPass ? '' : '  (expected to fail — fills/large-type only)'}`,
  );
}
console.log(bad === 0 ? '\nContrast contract holds.' : `\n${bad} unexpected result(s)`);
process.exit(bad ? 1 : 0);
