// Nutrition filters & sorting for food lists. Pure functions (tested in tests/).
// Rules use the share of a serving's calories that comes from each macro, plus a minimum amount,
// so a single small item (e.g. a 15 kcal coffee) isn't called "high protein" for 1 g.

const share = (g, perG, kcal) => (kcal > 0 ? (g * perG) / kcal : 0);

export const FILTERS = {
  // ≥30% of calories from protein (and ≥10 g), or a big portion: ≥25 g with ≥20% of calories
  high_protein: f => ((f.protein || 0) >= 10 && share(f.protein, 4, f.kcal) >= 0.3) || ((f.protein || 0) >= 25 && share(f.protein, 4, f.kcal) >= 0.2),
  low_carb: f => f.kcal > 0 && ((f.carbs || 0) <= 10 || share(f.carbs, 4, f.kcal) <= 0.15),
  high_carb: f => (f.carbs || 0) >= 20 && share(f.carbs, 4, f.kcal) >= 0.55,
  low_fat: f => f.kcal > 0 && ((f.fat || 0) <= 3 || share(f.fat, 9, f.kcal) <= 0.2),
  high_fat: f => (f.fat || 0) >= 10 && share(f.fat, 9, f.kcal) >= 0.45,
  low_cal: f => f.kcal > 0 && f.kcal <= 200,
  fits_day: (f, ctx) => ctx.remaining > 0 && f.kcal <= ctx.remaining,
};

// Picking one of these turns off its opposite
export const OPPOSITE = { high_carb: 'low_carb', low_carb: 'high_carb', high_fat: 'low_fat', low_fat: 'high_fat' };

export const SORTS = {
  match: null,
  protein: (a, b) => (b.protein || 0) - (a.protein || 0),
  protein_per_kcal: (a, b) => ratio(b) - ratio(a),
  kcal_low: (a, b) => a.kcal - b.kcal,
  carbs_low: (a, b) => (a.carbs || 0) - (b.carbs || 0),
};
const ratio = f => (f.kcal > 0 ? (f.protein || 0) / f.kcal : 0);   // grams of protein per kcal

export function applyFilters(items, active = [], sort = 'match', ctx = {}) {
  const tests = active.map(k => FILTERS[k]).filter(Boolean);
  const out = items.filter(f => tests.every(fn => fn(f, ctx)));
  const cmp = SORTS[sort];
  return cmp ? [...out].sort(cmp) : out;
}

export function toggleFilter(active, key) {
  if (active.includes(key)) return active.filter(k => k !== key);
  return [...active.filter(k => k !== OPPOSITE[key]), key];
}

/** Short labels that describe a food, e.g. ['high_protein', 'low_carb'] (for row badges). */
export function describe(f) {
  return ['high_protein', 'low_carb', 'high_carb', 'low_fat', 'high_fat'].filter(k => FILTERS[k](f, {}));
}
