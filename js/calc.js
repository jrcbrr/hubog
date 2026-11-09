// Calorie / macro math. Pure functions (tested in tests/calc.test.mjs).

export const ACTIVITY = {
  sedentary: 1.2,   // desk job, little exercise
  light: 1.375,     // 1-3 workouts/week
  moderate: 1.55,   // 3-5 workouts/week
  active: 1.725,    // 6-7 workouts/week
  very: 1.9,        // physical job + training
};

// cut: ~0.5 kg/week loss · recomp: small deficit + high protein · lean_bulk: small surplus to limit fat gain
export const GOAL_DELTA = { cut: -500, recomp: -200, maintain: 0, lean_bulk: 250 };
export const PROTEIN_PER_KG = { cut: 2.0, recomp: 2.2, maintain: 1.6, lean_bulk: 1.8 };
export const GOALS = ['cut', 'recomp', 'maintain', 'lean_bulk'];
// goals used by earlier versions of Hubog
export const LEGACY_GOAL = { lose: 'cut', mild_lose: 'cut', gain: 'lean_bulk' };

// Mifflin-St Jeor BMR
export function bmr({ sex, age, heightCm, weightKg }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'female' ? base - 161 : base + 5;
}

export function tdee(p) { return bmr(p) * (ACTIVITY[p.activity] || 1.2); }

export function targets(p) {
  const floor = p.sex === 'female' ? 1200 : 1500;
  const kcal = Math.max(floor, Math.round((tdee(p) + (GOAL_DELTA[p.goal] ?? 0)) / 10) * 10);
  const proteinPerKg = PROTEIN_PER_KG[p.goal] ?? 1.6;
  const protein = Math.round(p.weightKg * proteinPerKg);
  const fat = Math.round((kcal * 0.27) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carbs, fat };
}

export function sumEntries(entries = []) {
  return entries.reduce((t, e) => {
    const q = e.qty ?? 1;
    t.kcal += (e.kcal || 0) * q;
    t.protein += (e.protein || 0) * q;
    t.carbs += (e.carbs || 0) * q;
    t.fat += (e.fat || 0) * q;
    return t;
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

export function bmi(weightKg, heightCm) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

// Consecutive days (ending today or yesterday) that have at least one food entry
export function streak(log, today, shiftDay) {
  let day = log[today]?.length ? today : shiftDay(today, -1);
  let n = 0;
  while (log[day]?.length) { n++; day = shiftDay(day, -1); }
  return n;
}

// Scale nutrition given per 100 g to a gram amount
export function per100ToServing(n, grams) {
  const f = grams / 100;
  return {
    kcal: Math.round((n.kcal || 0) * f),
    protein: round1((n.protein || 0) * f),
    carbs: round1((n.carbs || 0) * f),
    fat: round1((n.fat || 0) * f),
  };
}
export const round1 = x => Math.round(x * 10) / 10;
