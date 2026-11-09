// Parse nutrition facts text (from OCR) into numbers. Pure function, tested in tests/.
const NUM = '(\\d+(?:[.,]\\d+)?)';
const toNum = s => (s == null ? null : parseFloat(String(s).replace(',', '.')));

function fix(text) {
  // Common OCR slips on labels: letter O for zero next to digits, "kcaI"
  return text
    .replace(/(\d)[oO]/g, '$10')
    .replace(/[oO](\d)/g, '0$1')
    .replace(/kca[il1|]/gi, 'kcal')
    .replace(/\r/g, '');
}

function grab(lines, keyRe, { exclude } = {}) {
  for (const line of lines) {
    if (!keyRe.test(line)) continue;
    if (exclude && exclude.test(line)) continue;
    const after = line.slice(line.search(keyRe));
    const m = after.match(new RegExp(NUM + '\\s*(m?g)\\b', 'i')) || after.match(new RegExp(NUM));
    if (m) {
      let v = toNum(m[1]);
      if (m[2] && m[2].toLowerCase() === 'mg') v = v / 1000;
      return v;
    }
  }
  return null;
}

export function parseLabel(raw) {
  const text = fix(raw || '');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const out = { kcal: null, protein: null, carbs: null, fat: null, serving: null };

  const kcalM = text.match(new RegExp(NUM + '\\s*kcal', 'i'));
  if (kcalM) out.kcal = toNum(kcalM[1]);
  if (out.kcal == null) {
    const c = text.match(new RegExp('calories?\\s*[:\\-]?\\s*' + NUM, 'i'));
    if (c) out.kcal = toNum(c[1]);
  }
  if (out.kcal == null) {
    const kj = text.match(new RegExp(NUM + '\\s*kj', 'i'));
    if (kj) out.kcal = Math.round(toNum(kj[1]) / 4.184);
  }

  out.protein = grab(lines, /protein/i);
  out.carbs = grab(lines, /(total\s+)?carbo?hydrates?|carbs/i, { exclude: /fib(er|re)/i });
  out.fat = grab(lines, /total\s+fat/i) ?? grab(lines, /\bfat\b/i, { exclude: /saturated|trans|poly|mono/i });

  const s = text.match(/serving\s*size\s*[:\-]?\s*([^\n]+)/i);
  if (s) out.serving = s[1].trim().slice(0, 40);

  return out;
}
