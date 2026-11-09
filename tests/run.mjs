// Run: node tests/run.mjs   (no dependencies)
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

globalThis.localStorage = { _d: { 'hubog:v1': JSON.stringify({ log: {}, profile: { goal: 'gain', sex: 'male', age: 20, heightCm: 170, weightKg: 70, activity: 'light' } }) }, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; } };
globalThis.window = { dispatchEvent() {} };
globalThis.Event = class { constructor(n) { this.type = n; } };

const calc = await import('../js/calc.js');
const { parseLabel } = await import('../js/label.js');
const W = await import('../js/workouts.js');
const { DICTS } = await import('../js/i18n.js');
const { searchLocal, BUILTIN } = await import('../js/foods.js');
const { fromOFF } = await import('../js/off.js');
const store = await import('../js/store.js');

let passed = 0;
assert.equal(store.get().profile?.goal, 'lean_bulk', 'saved data from an older version must load and upgrade at startup');
const test = (name, fn) => { fn(); passed++; console.log('✓', name); };

test('BMR male (Mifflin-St Jeor)', () => {
  assert.equal(calc.bmr({ sex: 'male', age: 25, heightCm: 175, weightKg: 70 }), 1673.75);
});
test('targets add up and respect floor', () => {
  const t = calc.targets({ sex: 'male', age: 18, heightCm: 168, weightKg: 60, activity: 'light', goal: 'maintain' });
  const kcalFromMacros = t.protein * 4 + t.carbs * 4 + t.fat * 9;
  assert.ok(Math.abs(kcalFromMacros - t.kcal) < 15, `macros ${kcalFromMacros} vs ${t.kcal}`);
  const low = calc.targets({ sex: 'female', age: 40, heightCm: 145, weightKg: 40, activity: 'sedentary', goal: 'cut' });
  assert.equal(low.kcal, 1200);
});
test('sumEntries uses qty', () => {
  const s = calc.sumEntries([{ kcal: 100, protein: 5, carbs: 10, fat: 2, qty: 2 }, { kcal: 50, protein: 1, carbs: 1, fat: 1, qty: 1 }]);
  assert.deepEqual(s, { kcal: 250, protein: 11, carbs: 21, fat: 5 });
});
test('streak counts back from today or yesterday', () => {
  const log = { '2026-11-10': [{}], '2026-11-09': [{}], '2026-11-08': [{}], '2026-11-06': [{}] };
  assert.equal(calc.streak(log, '2026-11-10', store.shiftDay), 3);
  assert.equal(calc.streak({ '2026-11-09': [{}] }, '2026-11-10', store.shiftDay), 1);
  assert.equal(calc.streak({}, '2026-11-10', store.shiftDay), 0);
});
test('shiftDay crosses months', () => {
  assert.equal(store.shiftDay('2026-03-01', -1), '2026-02-28');
  assert.equal(store.shiftDay('2026-12-31', 1), '2027-01-01');
});

test('label: US style', () => {
  const v = parseLabel(`Nutrition Facts\nServing Size 1 pack (55g)\nCalories 250\nTotal Fat 12g 15%\nSaturated Fat 5g\nTotal Carbohydrate 31g 11%\nDietary Fiber 1g\nProtein 5g`);
  assert.deepEqual(v, { kcal: 250, protein: 5, carbs: 31, fat: 12, serving: '1 pack (55g)' });
});
test('label: kJ/kcal energy, comma decimals, OCR slips', () => {
  const v = parseLabel(`Energy 1046 kJ / 25O kcaI\nFat 9,5 g\nof which saturates 3g\nCarbohydrate 36 g\nProtein 4.2 g`);
  assert.equal(v.kcal, 250); assert.equal(v.fat, 9.5); assert.equal(v.carbs, 36); assert.equal(v.protein, 4.2);
});
test('label: kJ only', () => {
  assert.equal(parseLabel('Energy 840 kJ').kcal, 201);
});
test('label: garbage returns nulls', () => {
  const v = parseLabel('hello world');
  assert.equal(v.kcal, null); assert.equal(v.protein, null);
});

test('workouts: nextDay rotates', () => {
  const plan = W.planById('beginner-full');
  assert.equal(W.nextDay(plan, []).id, 'A');
  assert.equal(W.nextDay(plan, [{ planId: plan.id, dayId: 'A', finishedAt: 1 }]).id, 'B');
  assert.equal(W.nextDay(plan, [{ planId: plan.id, dayId: 'B', finishedAt: 1 }]).id, 'A');
});
test('workouts: progression adds weight when all reps hit', () => {
  const ex = W.planById('beginner-full').days[0].exercises[0]; // squat 3x8-10
  const last = { sets: [1, 2, 3].map(() => ({ kg: 40, reps: 10, done: true })) };
  const s = W.suggest(ex, last);
  assert.equal(s.kg, 42.5); assert.equal(s.reps, 8); assert.equal(s.message.key, 'prog_add_weight');
  const partial = { sets: [{ kg: 40, reps: 10, done: true }, { kg: 40, reps: 8, done: true }, { kg: 40, reps: 7, done: true }] };
  assert.equal(W.suggest(ex, partial).kg, 40);
});
test('workouts: every exercise defined', () => {
  for (const p of W.PLANS) for (const d of p.days) for (const e of d.exercises) {
    assert.ok(e.name && e.type && e.tip, `${p.id}/${d.id}/${e.id} missing data`);
  }
});

test('foods: search finds Filipino dishes', () => {
  assert.equal(searchLocal('adobo')[0].name.toLowerCase().includes('adobo'), true);
  assert.ok(searchLocal('kanin').length >= 2);
  assert.ok(searchLocal('silog').length >= 4);
  const ids = new Set(BUILTIN.map(f => f.id));
  assert.equal(ids.size, BUILTIN.length, 'duplicate food ids');
  for (const f of BUILTIN) {
    const est = f.protein * 4 + f.carbs * 4 + f.fat * 9;
    assert.ok(Math.abs(est - f.kcal) / f.kcal < 0.25 || f.kcal < 20, `${f.name}: kcal ${f.kcal} vs macros ${Math.round(est)}`);
  }
});
test('OFF product mapping uses serving size', () => {
  const f = fromOFF({ code: '123', product_name: 'Pancit', brands: 'Lucky Me, X', serving_quantity: 60, serving_size: '1 pack (60 g)',
    nutriments: { 'energy-kcal_100g': 480, proteins_100g: 10, carbohydrates_100g: 65, fat_100g: 20 } });
  assert.equal(f.kcal, 288); assert.equal(f.name, 'Pancit — Lucky Me'); assert.equal(f.per100.kcal, 480);
  assert.equal(fromOFF({ code: '1', nutriments: {} }), null);
});

test('i18n: every used key exists in en and tl', () => {
  const files = [];
  const walk = d => readdirSync(d).forEach(f => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') && files.push(p); });
  walk(new URL('../js', import.meta.url).pathname);
  const used = new Set();
  for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(/\bt\('([a-z0-9_]+)'/g)) used.add(m[1]);
  ['breakfast', 'lunch', 'dinner', 'snacks', 'male', 'female', 'protein', 'carbs', 'fat',
   ...['sedentary', 'light', 'moderate', 'active', 'very'].flatMap(a => ['act_' + a, 'act_' + a + '_d']),
   ...['cut', 'recomp', 'maintain', 'lean_bulk'].flatMap(g => ['goal_' + g, 'goal_' + g + '_d']),
   ...['auto', 'light', 'dark'].map(x => 'theme_' + x), ...['search', 'favorites', 'mine'].map(x => 'tab_' + x),
   'prog_add_weight', 'prog_same_weight', 'prog_add_rep', 'prog_harder', 'switch_1', 'switch_2', 'switch_3', 'switch_4'].forEach(k => used.add(k));
  ['act_', 'goal_', 'theme_', 'tab_', 'switch_'].forEach(k => used.delete(k));
  const missing = [...used].filter(k => !DICTS.en[k] || !DICTS.tl[k]);
  assert.deepEqual(missing, []);
  const extra = Object.keys(DICTS.en).filter(k => !DICTS.tl[k]);
  assert.deepEqual(extra, [], 'en keys missing from tl');
});

test('backup: export then restore on a "new device" brings everything back', () => {
  store.update(s => {
    s.profile = { sex: 'male', age: 19, heightCm: 170, weightKg: 68, activity: 'light', goal: 'maintain', targets: { kcal: 2400, protein: 109, carbs: 300, fat: 72 } };
    s.log['2026-11-10'] = [{ id: 'a', name: 'Pork adobo', kcal: 380, protein: 25, carbs: 4, fat: 29, qty: 1, meal: 'lunch' }];
    s.sessions.push({ id: 'w1', planId: 'ppl', dayId: 'push', finishedAt: 1, exercises: [] });
    s.recipes.push({ id: 'r1', name: 'Sinigang ni Lola', servings: 4, ingredients: [] });
    s.settings.lang = 'tl';
  });
  const file = store.exportJSON();
  store.resetAll();                      // new phone: empty
  assert.equal(store.get().profile, null);
  store.importJSON(file);
  const st = store.get();
  assert.equal(st.profile.weightKg, 68);
  assert.equal(st.log['2026-11-10'][0].name, 'Pork adobo');
  assert.equal(st.sessions.length, 1);
  assert.equal(st.recipes[0].name, 'Sinigang ni Lola');
  assert.equal(st.settings.lang, 'tl');
  assert.ok(st.settings.lastBackupAt > 0);
  assert.throws(() => store.importJSON('{"hello":1}'));
  assert.throws(() => store.importJSON('not json'));
  assert.equal(store.get().profile.weightKg, 68, 'bad file must not wipe data');
});

test('goals: deficits/surpluses and protein per goal', () => {
  const base = { sex: 'male', age: 20, heightCm: 170, weightKg: 70, activity: 'moderate' };
  const k = g => calc.targets({ ...base, goal: g });
  assert.ok(k('cut').kcal < k('recomp').kcal && k('recomp').kcal < k('maintain').kcal && k('maintain').kcal < k('lean_bulk').kcal);
  assert.equal(k('recomp').protein, 154); assert.equal(k('cut').protein, 140); assert.equal(k('maintain').protein, 112);
});
test('goals: old saved goals are upgraded', () => {
  for (const [old, now] of [['lose', 'cut'], ['mild_lose', 'cut'], ['gain', 'lean_bulk'], ['maintain', 'maintain']]) {
    assert.equal(store.migrate({ profile: { goal: old } }).profile.goal, now);
  }
});

console.log(`\n${passed} tests passed`);
