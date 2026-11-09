// Parse nutrition facts text (from OCR) into numbers. Pure function, tested in tests/.
// Handles US, Philippine FDA and EU/Asian label layouts, plus common OCR slips.
const NUM = '(\\d+(?:[.,]\\d+)?)';
const toNum = s => (s == null ? null : parseFloat(String(s).replace(',', '.')));

function fix(text) {
  return (text || '')
    .replace(/\r/g, '')
    .replace(/kca[il1|!]/gi, 'kcal')
    .replace(/([A-Za-z,])[oO](m?g)\b/g, '$1 0$2')    // "FatOg" -> "Fat 0g"
    .replace(/\b[oO](m?g)\b/g, '0$1')                // "Og" / "Omg" -> "0g" / "0mg"
    .replace(/(\d)[oO]/g, '$10')                     // "1O" -> "10"
    .replace(/[oO](\d)/g, '0$1')                     // "O5" -> "05"
    .replace(/(\d)[lI|](?=\d|\s*g\b)/g, '$11')       // "1l" -> "11"
    .replace(/\b[lI|](\d)/g, '1$1');                 // "l2g" -> "12g"
}

function grab(lines, keyRe, { exclude } = {}) {
  for (const line of lines) {
    if (!keyRe.test(line)) continue;
    if (exclude && exclude.test(line)) continue;
    const after = line.slice(line.search(keyRe)).replace(keyRe, ' ');
    const m = after.match(new RegExp(NUM + '\\s*(m?g)\\b', 'i')) || after.match(new RegExp(NUM));
    if (m) {
      let v = toNum(m[1]);
      if (m[2] && m[2].toLowerCase() === 'mg') v = v / 1000;
      return v;
    }
  }
  return null;
}

function findKcal(text) {
  const tries = [
    new RegExp(NUM + '\\s*kcal', 'i'),                      // "250 kcal"
    new RegExp('kcal\\W{0,4}' + NUM, 'i'),                  // "Energy, kcal 290"
    new RegExp('calories\\s*[:\\-]?\\s*' + NUM, 'i'),       // "Calories 250"
    new RegExp('energy\\s*(?:\\(kcal\\))?\\s*[:\\-]?\\s*' + NUM + '(?![\\d.,])(?!\\s*k?j)', 'i'),
  ];
  for (const re of tries) { const m = text.match(re); if (m) return toNum(m[1]); }
  const kj = text.match(new RegExp(NUM + '\\s*kj', 'i'));
  return kj ? Math.round(toNum(kj[1]) / 4.184) : null;
}

// Common OCR misreads of one number: lost decimal point ("6.6g" -> 66) and "g" read as "9" ("5g" -> 59)
function variants(v) {
  if (v == null) return [null];
  const out = [v];
  if (Number.isInteger(v) && v >= 10) out.push(v / 10);
  if (/\d9$/.test(String(v))) out.push(Math.floor(v / 10));
  return out;
}

/**
 * Real labels satisfy kcal ≈ 4·protein + 4·carbs + 9·fat (within rounding / fibre / alcohol).
 * If the read numbers don't, try the usual OCR slips and keep the combination that fits.
 */
function repair(out) {
  const keys = ['protein', 'carbs', 'fat'];
  const known = keys.filter(k => out[k] != null);
  if (out.kcal == null || out.kcal < 20 || known.length < 3) return out;
  const err = o => Math.abs(4 * o.protein + 4 * o.carbs + 9 * o.fat - out.kcal) / out.kcal;
  const startErr = err(out);
  if (startErr <= 0.2) return out;
  let best = null;
  for (const p of variants(out.protein)) for (const c of variants(out.carbs)) for (const f of variants(out.fat)) {
    const cand = { protein: p, carbs: c, fat: f };
    const e = err(cand);
    if (!best || e < best.e) best = { cand, e };
  }
  if (best && best.e < 0.15) {
    const changed = keys.filter(k => best.cand[k] !== out[k]);
    Object.assign(out, best.cand);
    out.uncertain = [...new Set([...(out.uncertain || []), ...changed])];
  } else {
    out.uncertain = [...new Set([...(out.uncertain || []), 'kcal', ...known])];
  }
  return out;
}

export function parseLabel(raw) {
  const text = fix(raw);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const out = { kcal: null, protein: null, carbs: null, fat: null, serving: null, uncertain: [] };

  out.kcal = findKcal(text);
  out.protein = grab(lines, /protein[as]?\b|protina/i);
  out.carbs = grab(lines, /(total\s+)?carbo?hydrates?|carbs/i, { exclude: /fib(er|re)|sugar/i });
  out.fat = grab(lines, /total\s+fat/i) ?? grab(lines, /\bfat\b|\btaba\b/i, { exclude: /saturated|saturates|trans|poly|mono/i });

  const s = text.match(/serving\s*size\s*[:\-]?\s*([^\n]+)/i);
  if (s) out.serving = s[1].replace(/[^\w\s().,/-]/g, '').trim().slice(0, 40);

  repair(out);
  // Impossible values for one serving are OCR noise: drop them so the field stays empty to fill in
  if (out.kcal != null && (out.kcal > 2500 || out.kcal < 0)) out.kcal = null;
  for (const k of ['protein', 'carbs', 'fat']) {
    if (out[k] != null && (out[k] > 200 || (out.kcal != null && out[k] * (k === 'fat' ? 9 : 4) > out.kcal * 1.3 + 5))) {
      out.uncertain.push(k);
      if (out[k] > 200) out[k] = null;
    }
  }
  return out;
}

/** How many of the 4 main numbers were found. */
export const labelScore = v => ['kcal', 'protein', 'carbs', 'fat'].filter(k => v[k] != null).length;

/** Higher = more believable read: numbers found, macros that add up to the calories, few doubts. */
export function labelQuality(v) {
  let q = labelScore(v);
  if (v.kcal && v.protein != null && v.carbs != null && v.fat != null) {
    const e = Math.abs(4 * v.protein + 4 * v.carbs + 9 * v.fat - v.kcal) / v.kcal;
    if (e <= 0.2) q += 2;
  }
  return q - 0.5 * (v.uncertain?.length || 0);
}
