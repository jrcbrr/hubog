// Built-in food list focused on Filipino dishes and everyday staples.
// Values are APPROXIMATE per serving (home-style recipes vary). Users can edit or add custom foods.
// [id, name, serving, kcal, protein, carbs, fat, tags]
const RAW = [
  // Rice & staples
  ['rice-cup', 'White rice (kanin)', '1 cup cooked (160 g)', 205, 4.3, 44.5, 0.4, 'rice kanin staple'],
  ['rice-half', 'White rice (kanin)', '1/2 cup cooked (80 g)', 103, 2.1, 22.3, 0.2, 'rice kanin staple'],
  ['brown-rice', 'Brown rice', '1 cup cooked (195 g)', 216, 5, 45, 1.8, 'rice staple'],
  ['sinangag', 'Sinangag (garlic fried rice)', '1 cup (170 g)', 290, 5, 46, 9, 'rice fried garlic'],
  ['pandesal', 'Pandesal', '1 piece (35 g)', 105, 3, 19, 1.8, 'bread breakfast'],
  ['tasty-bread', 'Loaf bread (tasty)', '1 slice (30 g)', 80, 2.5, 15, 1, 'bread'],
  ['kamote', 'Kamote (sweet potato), boiled', '1 medium (130 g)', 112, 2, 26, 0.1, 'root camote'],
  ['saging-saba', 'Saging na saba, boiled', '1 piece (100 g)', 120, 1.3, 31, 0.3, 'banana'],
  ['oatmeal', 'Oatmeal, cooked with water', '1 cup (234 g)', 158, 6, 27, 3.2, 'breakfast oats'],
  ['pancit-canton', 'Pancit canton (instant)', '1 pack (60 g)', 290, 6, 39, 12, 'noodles instant'],
  ['pancit-bihon', 'Pancit bihon', '1 cup (150 g)', 230, 9, 38, 5, 'noodles'],
  ['spaghetti-pinoy', 'Filipino-style spaghetti', '1 plate (250 g)', 430, 15, 60, 14, 'pasta party'],
  ['lomi', 'Lomi', '1 bowl (400 g)', 420, 20, 55, 13, 'noodles soup'],

  // Breakfast / silog
  ['tapsilog', 'Tapsilog (tapa, sinangag, itlog)', '1 plate', 720, 35, 70, 32, 'silog breakfast beef'],
  ['longsilog', 'Longsilog (longganisa, sinangag, itlog)', '1 plate', 780, 26, 78, 40, 'silog breakfast pork'],
  ['tocilog', 'Tocilog (tocino, sinangag, itlog)', '1 plate', 760, 28, 85, 33, 'silog breakfast pork'],
  ['bangsilog', 'Bangsilog (daing na bangus, sinangag, itlog)', '1 plate', 690, 38, 60, 32, 'silog breakfast fish'],
  ['egg-fried', 'Fried egg (pritong itlog)', '1 egg', 90, 6.3, 0.4, 7, 'egg itlog'],
  ['egg-boiled', 'Boiled egg (nilagang itlog)', '1 large egg (50 g)', 78, 6.3, 0.6, 5.3, 'egg itlog'],
  ['longganisa', 'Longganisa', '2 pieces (80 g)', 300, 12, 10, 24, 'pork sausage'],
  ['tocino', 'Tocino', '100 g', 280, 15, 22, 14, 'pork sweet'],
  ['hotdog', 'Hotdog (red)', '1 piece (45 g)', 130, 5, 3, 11, 'processed'],
  ['corned-beef', 'Corned beef, sautéed', '1/2 can (75 g)', 160, 13, 4, 10, 'canned beef'],
  ['spam', 'Luncheon meat, fried', '2 slices (56 g)', 180, 7, 2, 16, 'canned pork'],
  ['champorado', 'Champorado', '1 bowl (250 g)', 290, 6, 55, 6, 'breakfast chocolate rice'],
  ['arroz-caldo', 'Arroz caldo', '1 bowl (350 g)', 320, 16, 45, 8, 'lugaw porridge chicken'],
  ['lugaw', 'Lugaw (plain)', '1 bowl (300 g)', 180, 4, 38, 1, 'porridge'],

  // Ulam — pork
  ['adobo-pork', 'Pork adobo', '1 serving (150 g)', 380, 25, 4, 29, 'ulam pork'],
  ['sinigang-pork', 'Sinigang na baboy', '1 bowl (350 g)', 300, 22, 10, 19, 'ulam soup pork'],
  ['lechon-kawali', 'Lechon kawali', '100 g', 480, 18, 0, 45, 'ulam pork fried'],
  ['sisig', 'Pork sisig', '1 serving (150 g)', 450, 22, 5, 38, 'ulam pork pulutan'],
  ['menudo', 'Menudo', '1 serving (200 g)', 320, 20, 14, 20, 'ulam pork party'],
  ['kare-kare', 'Kare-kare', '1 serving (250 g)', 470, 26, 14, 35, 'ulam oxtail peanut'],
  ['bicol-express', 'Bicol express', '1 serving (150 g)', 430, 17, 6, 38, 'ulam pork coconut spicy'],
  ['binagoongan', 'Binagoongang baboy', '1 serving (150 g)', 420, 20, 6, 35, 'ulam pork'],
  ['inihaw-liempo', 'Inihaw na liempo', '100 g', 400, 18, 3, 35, 'ulam pork grilled'],
  ['bbq-stick', 'Pork BBQ', '1 stick (60 g)', 160, 11, 6, 10, 'ulam pork grilled street'],

  // Ulam — chicken / beef
  ['adobo-chicken', 'Chicken adobo', '1 serving (150 g)', 290, 27, 3, 18, 'ulam chicken'],
  ['tinola', 'Tinolang manok', '1 bowl (350 g)', 230, 25, 8, 10, 'ulam soup chicken'],
  ['fried-chicken', 'Fried chicken (with skin)', '1 thigh/leg (130 g)', 340, 25, 9, 22, 'ulam chicken'],
  ['chicken-inasal', 'Chicken inasal', '1 leg quarter (200 g)', 400, 38, 3, 26, 'ulam chicken grilled'],
  ['chicken-breast', 'Chicken breast, grilled (no skin)', '100 g', 165, 31, 0, 3.6, 'chicken lean'],
  ['afritada', 'Chicken afritada', '1 serving (250 g)', 330, 25, 15, 18, 'ulam chicken tomato'],
  ['bulalo', 'Bulalo', '1 bowl (400 g)', 450, 35, 8, 31, 'ulam soup beef'],
  ['nilagang-baka', 'Nilagang baka', '1 bowl (400 g)', 350, 30, 15, 18, 'ulam soup beef'],
  ['beef-tapa', 'Beef tapa', '100 g', 260, 24, 8, 14, 'beef breakfast'],
  ['caldereta', 'Beef caldereta', '1 serving (250 g)', 420, 28, 14, 28, 'ulam beef party'],
  ['bistek', 'Bistek tagalog', '1 serving (150 g)', 300, 28, 7, 17, 'ulam beef'],

  // Ulam — fish / seafood
  ['bangus-fried', 'Daing na bangus, fried', '1/2 fish (150 g)', 330, 30, 0, 23, 'ulam fish milkfish'],
  ['tilapia-fried', 'Fried tilapia', '1 medium (150 g)', 250, 30, 2, 13, 'ulam fish'],
  ['sinigang-hipon', 'Sinigang na hipon', '1 bowl (350 g)', 180, 22, 10, 5, 'ulam soup shrimp'],
  ['paksiw', 'Paksiw na isda', '1 serving (200 g)', 220, 30, 3, 9, 'ulam fish'],
  ['tuyo', 'Tuyo, fried', '3 pieces (30 g)', 120, 15, 0, 7, 'dried fish breakfast'],
  ['sardines', 'Sardines in tomato sauce', '1/2 can (77 g)', 140, 13, 3, 8, 'canned fish'],
  ['tuna-can', 'Tuna in water (canned)', '1 can drained (130 g)', 150, 33, 0, 1.5, 'canned fish lean'],

  // Gulay
  ['pinakbet', 'Pinakbet', '1 cup (200 g)', 160, 7, 14, 9, 'gulay vegetables'],
  ['ginisang-monggo', 'Ginisang monggo', '1 cup (240 g)', 230, 14, 30, 6, 'gulay mung beans'],
  ['laing', 'Laing', '1 cup (200 g)', 340, 6, 14, 30, 'gulay coconut taro'],
  ['chopsuey', 'Chopsuey', '1 cup (200 g)', 170, 10, 12, 9, 'gulay vegetables'],
  ['tortang-talong', 'Tortang talong', '1 piece (150 g)', 200, 9, 10, 14, 'gulay eggplant egg'],
  ['ensaladang-mangga', 'Ensaladang mangga', '1 cup (150 g)', 80, 2, 18, 0.5, 'salad mango'],
  ['lumpiang-sariwa', 'Lumpiang sariwa', '1 roll', 210, 6, 30, 8, 'gulay spring roll'],
  ['lumpiang-shanghai', 'Lumpiang shanghai', '5 small pieces', 280, 12, 18, 18, 'fried party pork'],

  // Merienda & sweets
  ['turon', 'Turon', '1 piece (80 g)', 220, 2, 38, 7, 'merienda banana sweet'],
  ['banana-cue', 'Banana cue', '1 stick (2 bananas)', 280, 2, 60, 5, 'merienda banana sweet'],
  ['kwek-kwek', 'Kwek-kwek', '5 pieces', 250, 10, 18, 15, 'street egg fried'],
  ['fishball', 'Fishballs', '10 pieces (100 g)', 200, 7, 22, 9, 'street'],
  ['siopao', 'Siopao asado', '1 piece (130 g)', 320, 12, 48, 9, 'merienda bun'],
  ['siomai', 'Siomai (pork)', '4 pieces', 200, 11, 12, 12, 'merienda dumpling'],
  ['puto', 'Puto', '2 pieces (60 g)', 160, 3, 33, 1.5, 'kakanin rice cake'],
  ['bibingka', 'Bibingka', '1 piece (120 g)', 320, 6, 48, 12, 'kakanin rice cake'],
  ['suman', 'Suman', '1 piece (90 g)', 180, 3, 37, 3, 'kakanin sticky rice'],
  ['halo-halo', 'Halo-halo', '1 glass (400 g)', 450, 7, 85, 10, 'dessert'],
  ['leche-flan', 'Leche flan', '1 slice (80 g)', 230, 6, 32, 8, 'dessert'],
  ['taho', 'Taho', '1 cup (250 g)', 200, 7, 38, 2.5, 'merienda tofu'],
  ['ensaymada', 'Ensaymada', '1 piece (70 g)', 300, 6, 36, 15, 'bread sweet'],

  // Fruit
  ['mango', 'Mango (hinog)', '1 cup sliced (165 g)', 100, 1.4, 25, 0.6, 'fruit'],
  ['banana-lakatan', 'Lakatan banana', '1 medium (100 g)', 90, 1.1, 23, 0.3, 'fruit'],
  ['papaya', 'Papaya', '1 cup (145 g)', 62, 0.7, 16, 0.4, 'fruit'],
  ['pineapple', 'Pineapple', '1 cup (165 g)', 82, 0.9, 22, 0.2, 'fruit'],
  ['apple', 'Apple', '1 medium (180 g)', 95, 0.5, 25, 0.3, 'fruit'],

  // Drinks & dairy
  ['coffee-3in1', '3-in-1 coffee', '1 sachet', 100, 1, 18, 3, 'drink kape'],
  ['coffee-black', 'Black coffee', '1 cup', 2, 0.3, 0, 0, 'drink kape'],
  ['milk-fresh', 'Fresh milk (full cream)', '1 cup (240 ml)', 150, 8, 12, 8, 'dairy drink'],
  ['soft-drink', 'Soft drink (cola)', '1 can (330 ml)', 140, 0, 37, 0, 'drink soda'],
  ['milk-tea', 'Milk tea with pearls', '1 large (700 ml)', 450, 4, 85, 10, 'drink'],
  ['buko-juice', 'Buko juice', '1 glass (240 ml)', 45, 1.7, 9, 0.5, 'drink coconut'],
  ['whey', 'Whey protein', '1 scoop (30 g)', 120, 24, 3, 1.5, 'supplement protein'],
  ['peanut-butter', 'Peanut butter', '1 tbsp (16 g)', 95, 4, 3, 8, 'spread'],

  // Fast food (approximate)
  ['burger-yum', 'Fast-food cheeseburger', '1 burger', 330, 15, 33, 15, 'fast food'],
  ['fries-reg', 'French fries (regular)', '1 regular (115 g)', 340, 4, 44, 16, 'fast food'],
  ['fastfood-chicken-rice', 'Fried chicken with rice (fast food)', '1 piece + rice', 600, 28, 60, 27, 'fast food chicken'],
];

export const BUILTIN = RAW.map(([id, name, serving, kcal, protein, carbs, fat, tags]) => ({
  id: 'ph:' + id, name, serving, kcal, protein, carbs, fat, tags, source: 'builtin',
}));

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function searchLocal(query, extra = []) {
  const q = norm(query.trim());
  const all = [...extra, ...BUILTIN];
  if (!q) return all.slice(0, 30);
  const words = q.split(/\s+/);
  return all
    .map(f => {
      const hay = norm(`${f.name} ${f.tags || ''}`);
      if (!words.every(w => hay.includes(w))) return null;
      const score = norm(f.name).startsWith(q) ? 0 : norm(f.name).includes(q) ? 1 : 2;
      return { f, score };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .map(x => x.f)
    .slice(0, 40);
}

// Emoji for a food, from its name/tags. Keeps lists warm and easy to scan.
const EMOJI_RULES = [
  [/halo-halo|leche flan|dessert|ice cream/, '🍨'], [/milk tea|bubble|pearl/, '🧋'], [/coffee|kape/, '☕'],
  [/soft drink|soda|cola|juice|drink/, '🥤'], [/milk|dairy|yogurt/, '🥛'], [/whey|protein shake|supplement/, '🥤'],
  [/egg|itlog|kwek/, '🍳'], [/silog/, '🍳'],
  [/sinigang|tinola|bulalo|nilaga|soup|lomi|arroz caldo|lugaw|porridge/, '🍲'],
  [/pancit|noodle|canton|bihon|spaghetti|pasta/, '🍜'],
  [/fish|bangus|tilapia|tuyo|sardine|tuna|isda|paksiw/, '🐟'], [/shrimp|hipon/, '🦐'],
  [/chicken|manok|inasal|afritada/, '🍗'], [/beef|baka|tapa|bistek|caldereta|kare-kare|oxtail/, '🥩'],
  [/pork|baboy|lechon|sisig|liempo|longganisa|tocino|menudo|bicol|hotdog|luncheon|spam|bbq/, '🍖'],
  [/burger/, '🍔'], [/fries/, '🍟'], [/siomai|dumpling|siopao|bun/, '🥟'], [/lumpia|spring roll|turon/, '🌯'],
  [/mango|mangga/, '🥭'], [/banana|saging|lakatan|saba/, '🍌'], [/pineapple/, '🍍'], [/apple/, '🍎'], [/papaya|fruit/, '🍈'],
  [/laing|pinakbet|chopsuey|monggo|gulay/, '🥬'], [/coconut|buko/, '🥥'], [/kamote|camote|sweet potato/, '🍠'], [/taho/, '🍮'],
  [/puto|bibingka|suman|kakanin|rice cake|champorado/, '🍡'], [/bread|pandesal|ensaymada|tasty/, '🍞'], [/oat/, '🥣'],
  [/peanut/, '🥜'], [/rice|kanin|sinangag/, '🍚'],
  [/gulay|vegetable|pinakbet|chopsuey|monggo|laing|talong|eggplant|salad/, '🥬'],
  [/street|fishball/, '🍢'],
];
export function foodEmoji(f) {
  const hay = `${f.name || ''} ${f.tags || ''}`.toLowerCase();
  if (f.source === 'recipe') return '🥘';
  for (const [re, e] of EMOJI_RULES) if (re.test(hay)) return e;
  return '🍽️';
}
