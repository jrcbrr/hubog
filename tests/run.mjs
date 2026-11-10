// Run: node tests/run.mjs   (no dependencies)
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

globalThis.localStorage = { _d: { 'hubog:v1': JSON.stringify({ log: {}, profile: { goal: 'gain', sex: 'male', age: 20, heightCm: 170, weightKg: 70, activity: 'light' } }) }, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; } };
globalThis.window = { dispatchEvent() {} };
globalThis.Event = class { constructor(n) { this.type = n; } };

const calc = await import('../js/calc.js');
const { parseLabel, labelQuality } = await import('../js/label.js');
const R = await import('../js/restaurants.js');
const CR = await import('../js/creatine.js');
const IP = await import('../js/imageprep.js');
const FL = await import('../js/filters.js');
const AC = await import('../js/activities.js');
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
  assert.deepEqual({ ...v, uncertain: undefined }, { kcal: 250, protein: 5, carbs: 31, fat: 12, serving: '1 pack (55g)', uncertain: undefined });
  assert.deepEqual(v.uncertain, []);
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
    if (/alcohol/.test(f.tags)) continue;
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
   ...['auto', 'light', 'dark'].map(x => 'theme_' + x), ...['search', 'restaurants', 'favorites', 'mine'].map(x => 'tab_' + x),
   'prog_add_weight', 'prog_same_weight', 'prog_add_rep', 'prog_harder', 'switch_1', 'switch_2', 'switch_3', 'switch_4', 'label_tip_1', 'label_tip_2', 'label_tip_3', 'label_tip_4'].forEach(k => used.add(k));
  ['act_', 'goal_', 'theme_', 'tab_', 'switch_', 'label_tip_', 'tab_restaurants', 'f_', 's_', 'act_t_'].forEach(k => used.delete(k));
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

test('label: PH FDA layout, "Og" for 0g, lost decimals fixed by the calorie check', () => {
  const ph = parseLabel('NUTRITION FACTS\nServing Size: 1 pack (60g)\nEnergy, kcal 290\nTotal Fat, g 12\nSaturated Fat,g 6\nTotal Carbohydrate,g 39\nProtein, g 6');
  assert.deepEqual([ph.kcal, ph.protein, ph.carbs, ph.fat], [290, 6, 39, 12]);
  const o = parseLabel('Calories 110\nTotal FatOg\nTotal Carbohydrate 27g\nProtein Og');
  assert.deepEqual([o.kcal, o.protein, o.carbs, o.fat], [110, 0, 27, 0]);
  const eu = parseLabel('Energy 628kJ 2093kJ\n150 kcal 500 kcal\nProtein 2.1g 7.0g\nFat 66g 22g\nCarbohydrate 20.4g 68g');
  assert.equal(eu.fat, 6.6); assert.deepEqual(eu.uncertain, ['fat']);
  const g9 = parseLabel('Calories 210\nTotal Fat 7g\nTotal Carbohydrate 22g\nProtein 209');   // "20g" read as "209"
  assert.equal(g9.protein, 20);
});
test('label: OCR of test photos (regression) — clean + normal photos ≥ 95% right', () => {
  const fx = JSON.parse(readFileSync(new URL('./fixtures/label-ocr.json', import.meta.url)));
  let right = 0, total = 0;
  for (const [name, { truth, plain, cleaned }] of Object.entries(fx)) {
    if (name.includes('_L2')) continue;                       // very bad photos: no accuracy promise
    const a = parseLabel(plain), b = parseLabel(cleaned);
    const v = labelQuality(a) >= 6 ? a : (labelQuality(b) > labelQuality(a) ? b : a);   // same logic as scan.js
    for (const k of ['kcal', 'protein', 'carbs', 'fat']) { total++; if (v[k] != null && Math.abs(v[k] - truth[k]) <= Math.max(0.05, truth[k] * 0.02)) right++; }
  }
  assert.ok(right / total >= 0.95, `${right}/${total}`);
});
test('label: garbage never produces impossible numbers', () => {
  const fx = JSON.parse(readFileSync(new URL('./fixtures/label-ocr.json', import.meta.url)));
  for (const { plain, cleaned } of Object.values(fx)) for (const txt of [plain, cleaned]) {
    const v = parseLabel(txt);
    for (const k of ['protein', 'carbs', 'fat']) assert.ok(v[k] == null || v[k] <= 200, `${k}=${v[k]}`);
    assert.ok(v.kcal == null || v.kcal <= 2500);
  }
});
test('image cleanup: threshold keeps dark text dark under uneven light', () => {
  const w = 60, h = 20, g = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g[y * w + x] = 120 + x * 2;   // light gradient
  for (let y = 8; y < 12; y++) for (let x = 40; x < 44; x++) g[y * w + x] = 90;           // dark "letter" in bright area
  const bw = IP.bradley(IP.median3(g, w, h), w, h);
  assert.equal(bw[10 * w + 42], 0); assert.equal(bw[2 * w + 42], 255); assert.equal(bw[2 * w + 5], 255);
});
test('restaurants: data is complete and believable', () => {
  const ids = new Set(R.RESTAURANT_FOODS.map(f => f.id));
  assert.equal(ids.size, R.RESTAURANT_FOODS.length, 'duplicate ids');
  for (const name of ['Jollibee', "McDonald's", 'KFC', "Wendy's", 'Burger King', 'Chowking', 'Mang Inasal']) assert.ok(R.RESTAURANTS.some(r => r.name === name), name);
  for (const f of R.RESTAURANT_FOODS) {
    if (f.kcal < 50) continue;
    const est = f.protein * 4 + f.carbs * 4 + f.fat * 9;
    assert.ok(Math.abs(est - f.kcal) / f.kcal < 0.2, `${f.serving} ${f.name}: ${f.kcal} vs macros ${Math.round(est)}`);
  }
  assert.ok(R.foodsOf('jollibee').length >= 15);
  assert.ok(searchLocal('chickenjoy').length >= 4, 'restaurant items are searchable');
});
test('silog meals: full set, all = sinangag + itlog + ulam', () => {
  const silog = BUILTIN.filter(f => /silog/.test(f.tags));
  assert.ok(silog.length >= 15);
  for (const n of ['Tapsilog', 'Longsilog', 'Tocilog', 'Bangsilog', 'Hotsilog', 'Cornsilog', 'Spamsilog', 'Chicksilog']) assert.ok(silog.some(f => f.name.startsWith(n)), n);
  for (const f of silog) assert.ok(f.kcal > 380 && f.serving.includes('sinangag'), f.name);
});
const ICS = await CR.calendarFile({ doseG: 5, time: '21:45' }, { title: 'Creatine time', body: g => `Take ${g} g` }).text();
test('creatine: streak, due time, calendar file', () => {
  const log = { '2026-11-10': 1, '2026-11-09': 1, '2026-11-08': 1 };
  assert.equal(CR.creatineStreak(log, '2026-11-10', store.shiftDay), 3);
  assert.equal(CR.creatineStreak({ '2026-11-09': 1 }, '2026-11-10', store.shiftDay), 1);
  store.update(s => { s.settings.creatine = { on: true, doseG: 5, time: '08:00' }; s.creatineLog = {}; });
  assert.equal(CR.isDue(new Date(2026, 10, 10, 7, 59)), false);
  assert.equal(CR.isDue(new Date(2026, 10, 10, 8, 1)), true);
  store.update(s => { s.creatineLog[store.todayKey(new Date(2026, 10, 10))] = 1; });
  assert.equal(CR.isDue(new Date(2026, 10, 10, 9, 0)), false);
  const ics = ICS;
  assert.match(ics, /DTSTART:\d{8}T214500/); assert.match(ics, /RRULE:FREQ=DAILY/); assert.match(ics, /BEGIN:VALARM/);
});

test('filters: foods are classified sensibly', () => {
  const by = n => [...BUILTIN, ...R.RESTAURANT_FOODS].find(f => f.name === n);
  const has = (n, k) => FL.FILTERS[k](by(n), { remaining: 500 });
  assert.ok(has('Chicken breast, grilled (no skin)', 'high_protein') && has('Chicken breast, grilled (no skin)', 'low_carb') && has('Chicken breast, grilled (no skin)', 'low_fat'));
  assert.ok(has('White rice (kanin)', 'high_carb') && has('White rice (kanin)', 'low_fat') && !has('White rice (kanin)', 'high_protein'));
  assert.ok(has('Pork adobo', 'high_fat') && has('Pork adobo', 'low_carb'));
  assert.ok(has('Whey protein', 'high_protein'));
  assert.ok(!has('Black coffee', 'high_protein'), 'tiny items are not "high protein"');
  assert.ok(!has('Jolly Spaghetti', 'high_protein') && has('2-pc Chickenjoy with rice', 'high_protein'), 'big plates need a real protein share');
  assert.ok(has('Black coffee', 'fits_day') && !has('Double Whopper', 'fits_day'));
  assert.ok(!FL.FILTERS.fits_day(by('Black coffee'), { remaining: -50 }), 'nothing fits when over budget');
});
test('filters: combine, opposites, sorting', () => {
  const all = [...BUILTIN, ...R.RESTAURANT_FOODS];
  const hp = FL.applyFilters(all, ['high_protein', 'low_carb'], 'protein');
  assert.ok(hp.length > 10);
  assert.ok(hp.every(f => FL.FILTERS.high_protein(f) && FL.FILTERS.low_carb(f)));
  for (let i = 1; i < hp.length; i++) assert.ok(hp[i - 1].protein >= hp[i].protein);
  assert.deepEqual(FL.toggleFilter(['low_carb', 'low_cal'], 'high_carb'), ['low_cal', 'high_carb']);
  assert.deepEqual(FL.toggleFilter(['high_carb'], 'high_carb'), []);
  const ppk = FL.applyFilters(all, [], 'protein_per_kcal');
  assert.ok(ppk[0].protein / ppk[0].kcal >= ppk[5].protein / ppk[5].kcal);
  assert.ok(FL.applyFilters(all, ['high_carb', 'high_protein']).length >= 0);
});

test('exercise: calorie estimates are sensible', () => {
  const e = (type, minutes, km, weightKg = 70) => AC.estimateBurn({ type, minutes, km, weightKg });
  // 1 h cycling at 20 km/h, 70 kg: (8-1)*70*1 = 490
  assert.equal(e('cycling', 60, 20), 490);
  assert.ok(e('cycling', 60, 30) > e('cycling', 60, 20), 'faster ride burns more');
  assert.ok(e('cycling', 60, 0) > 0, 'works without distance');
  // 30 min run at 10 km/h, 70 kg: MET 10.2 -> (9.2)*70*0.5 = 322
  assert.equal(e('running', 30, 5), 322);
  assert.ok(e('walking', 60, 5) < e('running', 60, 10));
  assert.ok(e('running', 60, 10, 90) > e('running', 60, 10, 60), 'heavier person burns more');
  assert.equal(e('yoga', 0, 0), 0);
  assert.equal(AC.pace(30, 5), '6:00'); assert.equal(AC.pace(25, 4), '6:15');
  assert.equal(Math.round(AC.speedKmh(90, 30)), 20);
});
test('exercise: burned calories add to the goal only when enabled', () => {
  const st = { activities: { '2026-11-10': [{ kcal: 300 }, { kcal: 150 }] } };
  assert.equal(AC.burnedOn(st, '2026-11-10'), 450);
  assert.equal(AC.burnedOn(st, '2026-11-09'), 0);
  assert.equal(AC.effectiveGoal(2000, 450, true), 2450);
  assert.equal(AC.effectiveGoal(2000, 450, false), 2000);
});

console.log(`\n${passed} tests passed`);
