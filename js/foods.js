import { RESTAURANT_FOODS } from './restaurants.js';
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

  // More ulam
  ['crispy-pata', 'Crispy pata', '1 serving (150 g)', 560, 30, 2, 48, 'ulam pork fried'],
  ['lechon-manok', 'Lechon manok', '1/4 chicken (200 g)', 420, 44, 2, 26, 'ulam chicken roast'],
  ['pork-chop', 'Fried pork chop', '1 chop (150 g)', 390, 32, 4, 27, 'ulam pork'],
  ['giniling', 'Pork giniling', '1 cup (200 g)', 360, 22, 14, 24, 'ulam pork ground'],
  ['picadillo', 'Beef picadillo', '1 cup (200 g)', 300, 20, 14, 18, 'ulam beef ground'],
  ['mechado', 'Beef mechado', '1 serving (250 g)', 400, 28, 16, 25, 'ulam beef tomato'],
  ['pochero', 'Pochero', '1 bowl (350 g)', 380, 25, 30, 18, 'ulam soup pork'],
  ['dinuguan', 'Dinuguan', '1 cup (200 g)', 340, 24, 6, 24, 'ulam pork'],
  ['tokwat-baboy', "Tokwa't baboy", '1 serving (200 g)', 380, 26, 8, 27, 'ulam pork tofu'],
  ['embutido', 'Embutido', '2 slices (100 g)', 250, 13, 10, 17, 'ulam pork party'],
  ['adobong-pusit', 'Adobong pusit', '1 serving (150 g)', 220, 26, 6, 10, 'ulam squid seafood'],
  ['galunggong', 'Fried galunggong', '2 fish (150 g)', 290, 32, 0, 17, 'ulam fish'],
  ['inihaw-bangus', 'Inihaw na bangus', '1/2 fish (200 g)', 350, 40, 2, 20, 'ulam fish grilled milkfish'],
  ['salmon-grilled', 'Grilled salmon', '100 g', 210, 22, 0, 13, 'fish'],
  ['shrimp-garlic', 'Garlic butter shrimp', '1 serving (150 g)', 260, 28, 3, 15, 'shrimp seafood'],
  ['beef-steak-grilled', 'Grilled beef steak', '150 g', 350, 40, 0, 21, 'beef'],
  ['ground-beef-lean', 'Lean ground beef, cooked', '100 g', 220, 26, 0, 13, 'beef'],
  ['chicken-thigh-skinless', 'Chicken thigh, skinless, cooked', '100 g', 180, 25, 0, 8.5, 'chicken'],
  ['tofu', 'Tofu (tokwa), fried', '100 g', 270, 17, 9, 20, 'tofu'],
  ['tofu-firm', 'Tofu, firm, plain', '100 g', 145, 16, 3, 8, 'tofu'],

  // More gulay & soup
  ['ginataang-kalabasa', 'Ginataang kalabasa at sitaw', '1 cup (200 g)', 230, 5, 18, 16, 'gulay coconut squash'],
  ['adobong-kangkong', 'Adobong kangkong', '1 cup (150 g)', 110, 4, 8, 7, 'gulay'],
  ['ampalaya-egg', 'Ginisang ampalaya with egg', '1 cup (180 g)', 150, 9, 8, 10, 'gulay bitter gourd egg'],
  ['sinigang-isda', 'Sinigang na isda', '1 bowl (350 g)', 200, 25, 10, 6, 'ulam soup fish'],
  ['batchoy', 'La Paz batchoy', '1 bowl (400 g)', 480, 28, 52, 17, 'noodles soup pork'],
  ['mami', 'Chicken mami', '1 bowl (400 g)', 350, 20, 48, 8, 'noodles soup'],
  ['goto', 'Goto', '1 bowl (350 g)', 300, 14, 40, 9, 'porridge lugaw'],
  ['sotanghon', 'Sotanghon guisado', '1 cup (150 g)', 250, 9, 40, 6, 'noodles'],
  ['pancit-malabon', 'Pancit malabon', '1 cup (180 g)', 330, 13, 45, 11, 'noodles'],
  ['broccoli', 'Broccoli, steamed', '1 cup (90 g)', 31, 2.5, 6, 0.3, 'gulay vegetables'],
  ['salad-greens', 'Green salad, no dressing', '2 cups (100 g)', 20, 1.5, 3.5, 0.2, 'gulay salad'],

  // Rice & carbs
  ['rice-1-5', 'White rice (kanin)', '1.5 cups cooked (240 g)', 308, 6.5, 67, 0.6, 'rice kanin staple'],
  ['java-rice', 'Java rice', '1 cup (180 g)', 310, 6, 58, 6, 'rice'],
  ['mais', 'Corn on the cob (mais)', '1 ear (150 g)', 130, 4.5, 29, 1.8, 'corn'],
  ['camote-cue', 'Camote cue', '1 stick (120 g)', 260, 1.5, 48, 7, 'merienda sweet potato'],
  ['maruya', 'Maruya', '1 piece (90 g)', 220, 2.5, 34, 8, 'merienda banana fritter'],
  ['spanish-bread', 'Spanish bread', '1 piece (45 g)', 160, 3.5, 25, 5, 'bread merienda'],
  ['cheese-bread', 'Cheese bread', '1 piece (40 g)', 140, 3.5, 22, 4.5, 'bread'],
  ['monay', 'Monay', '1 piece (60 g)', 170, 5, 32, 2.5, 'bread'],
  ['wheat-bread', 'Whole wheat bread', '1 slice (30 g)', 75, 3.5, 13, 1, 'bread'],
  ['crackers', 'Plain crackers', '1 pack (25 g)', 110, 2.5, 18, 3, 'snack biscuit'],
  ['instant-noodles-soup', 'Instant noodles with soup', '1 pack (55 g)', 250, 5, 34, 10, 'noodles instant mami'],

  // Kakanin & sweets
  ['kutsinta', 'Kutsinta', '2 pieces (60 g)', 140, 1, 33, 0.3, 'kakanin rice cake'],
  ['sapin-sapin', 'Sapin-sapin', '1 slice (80 g)', 210, 2, 40, 5, 'kakanin rice cake'],
  ['biko', 'Biko', '1 slice (80 g)', 250, 2.5, 46, 6, 'kakanin sticky rice'],
  ['maja-blanca', 'Maja blanca', '1 slice (80 g)', 160, 2, 25, 6, 'dessert coconut'],
  ['ube-halaya', 'Ube halaya', '1/4 cup (70 g)', 190, 2.5, 33, 6, 'dessert ube'],
  ['buko-pie', 'Buko pie', '1 slice (100 g)', 290, 4, 40, 13, 'dessert coconut'],
  ['polvoron', 'Polvoron', '1 piece (15 g)', 75, 1, 9, 4, 'sweets'],
  ['hopia', 'Hopia', '1 piece (50 g)', 190, 4, 30, 6, 'merienda bread'],
  ['chicharon', 'Chicharon', '1 cup (30 g)', 160, 18, 0, 9.5, 'snack pork'],
  ['peanuts', 'Roasted peanuts (mani)', '1/4 cup (35 g)', 200, 9, 6, 17, 'snack nuts'],
  ['ice-cream', 'Ice cream', '1/2 cup (65 g)', 140, 2.5, 16, 7, 'dessert'],

  // Gym & healthy staples
  ['greek-yogurt', 'Greek yogurt, plain nonfat', '170 g', 100, 17, 6, 0.7, 'dairy yogurt protein'],
  ['milk-lowfat', 'Low-fat milk', '1 cup (240 ml)', 105, 8, 12, 2.5, 'dairy drink'],
  ['egg-whites', 'Egg whites', '3 large (100 g)', 52, 11, 0.7, 0.2, 'egg protein'],
  ['almonds', 'Almonds', '1/4 cup (35 g)', 200, 7.5, 7.5, 17.5, 'nuts snack'],
  ['avocado', 'Avocado', '1/2 fruit (100 g)', 160, 2, 8.5, 15, 'fruit'],
  ['protein-bar', 'Protein bar', '1 bar (60 g)', 210, 20, 22, 7, 'supplement protein snack'],
  ['mass-gainer', 'Mass gainer shake', '1 serving (165 g powder)', 650, 32, 120, 4, 'supplement'],
  ['watermelon', 'Watermelon (pakwan)', '1 cup (150 g)', 46, 0.9, 11.5, 0.2, 'fruit'],
  ['guava', 'Guava (bayabas)', '1 fruit (55 g)', 37, 1.4, 8, 0.5, 'fruit'],
  ['orange', 'Orange (dalandan)', '1 medium (130 g)', 62, 1.2, 15.5, 0.2, 'fruit'],

  // Drinks
  ['sago-gulaman', "Sago't gulaman", '1 glass (350 ml)', 180, 0.5, 45, 0.2, 'drink sweet'],
  ['calamansi-juice', 'Calamansi juice, sweetened', '1 glass (250 ml)', 110, 0.3, 28, 0, 'drink juice'],
  ['chocolate-milk', 'Chocolate milk', '1 cup (240 ml)', 200, 8, 26, 8, 'dairy drink'],
  ['iced-tea', 'Iced tea, sweetened', '1 glass (350 ml)', 130, 0, 33, 0, 'drink'],
  ['energy-drink', 'Energy drink', '1 can (250 ml)', 110, 0, 28, 0, 'drink'],
  ['beer', 'Beer (pale pilsen)', '1 bottle (330 ml)', 145, 1.5, 12, 0, 'drink alcohol'],

  // Fast food (approximate)
  ['burger-yum', 'Fast-food cheeseburger', '1 burger', 330, 15, 33, 15, 'fast food'],
  ['fries-reg', 'French fries (regular)', '1 regular (115 g)', 340, 4, 44, 16, 'fast food'],
  ['fastfood-chicken-rice', 'Fried chicken with rice (fast food)', '1 piece + rice', 600, 28, 60, 27, 'fast food chicken'],
];

// Silog = sinangag (garlic rice) + itlog (fried egg) + ulam. Built from parts so they stay consistent.
const SILOG_BASE = { kcal: 290 + 90, protein: 5 + 6.3, carbs: 46 + 0.4, fat: 9 + 7 };
const SILOG = [
  // [id, name, ulam serving, kcal, protein, carbs, fat]
  ['tapsilog', 'Tapsilog (tapa)', 'beef tapa 100 g', 260, 24, 8, 14],
  ['longsilog', 'Longsilog (longganisa)', 'longganisa 2 pcs', 300, 12, 10, 24],
  ['tocilog', 'Tocilog (tocino)', 'tocino 100 g', 280, 15, 22, 14],
  ['bangsilog', 'Bangsilog (daing na bangus)', 'bangus 1/2 fish', 330, 30, 0, 23],
  ['hotsilog', 'Hotsilog (hotdog)', 'hotdog 2 pcs', 260, 10, 6, 22],
  ['cornsilog', 'Cornsilog (corned beef)', 'corned beef 1/2 can', 160, 13, 4, 10],
  ['spamsilog', 'Spamsilog (luncheon meat)', 'luncheon meat 2 slices', 180, 7, 2, 16],
  ['chicksilog', 'Chicksilog (fried chicken)', 'fried chicken 1 pc', 340, 25, 9, 22],
  ['dangsilog', 'Dangsilog (danggit)', 'danggit 40 g', 170, 25, 0, 8],
  ['tuyosilog', 'Tuyosilog (tuyo)', 'tuyo 3 pcs', 120, 15, 0, 7],
  ['adobosilog', 'Adobosilog (pork adobo)', 'pork adobo 150 g', 380, 25, 4, 29],
  ['porksilog', 'Porksilog (pork chop)', 'pork chop 1 pc', 390, 32, 4, 27],
  ['liemposilog', 'Liemposilog (liempo)', 'inihaw na liempo 150 g', 600, 27, 4, 52],
  ['sisigsilog', 'Sisigsilog (sisig)', 'sisig 150 g', 450, 22, 5, 38],
  ['bisteksilog', 'Bisteksilog (bistek)', 'bistek 150 g', 300, 28, 7, 17],
  ['embusilog', 'Embusilog (embutido)', 'embutido 2 slices', 250, 13, 10, 17],
];
for (const [id, name, ulam, kcal, protein, carbs, fat] of SILOG) {
  RAW.push([id, name, `1 plate: sinangag, itlog, ${ulam}`, Math.round(SILOG_BASE.kcal + kcal),
    Math.round((SILOG_BASE.protein + protein) * 10) / 10, Math.round((SILOG_BASE.carbs + carbs) * 10) / 10,
    Math.round((SILOG_BASE.fat + fat) * 10) / 10, 'silog breakfast']);
}

export const BUILTIN = RAW.map(([id, name, serving, kcal, protein, carbs, fat, tags]) => ({
  id: 'ph:' + id, name, serving, kcal, protein, carbs, fat, tags, source: 'builtin',
}));

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function searchLocal(query, extra = [], limit = 40) {
  const q = norm(query.trim());
  const all = [...extra, ...BUILTIN, ...(q ? RESTAURANT_FOODS : [])];
  if (!q) return all.slice(0, limit === 40 ? 30 : limit);
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
    .slice(0, limit);
}

// Emoji for a food, from its name/tags. Keeps lists warm and easy to scan.
const EMOJI_RULES = [
  [/halo-halo|leche flan|dessert|ice cream/, '🍨'], [/milk tea|bubble|pearl/, '🧋'], [/coffee|kape/, '☕'],
  [/soft drink|soda|cola|juice|drink/, '🥤'], [/milk|dairy|yogurt/, '🥛'], [/whey|protein shake|supplement/, '🥤'],
  [/frappuccino|latte|macchiato|americano|espresso/, '☕'], [/frosty|mcflurry|sundae/, '🍨'], [/pizza/, '🍕'], [/mojos|potato/, '🥔'],
  [/egg|itlog|kwek/, '🍳'], [/silog/, '🍳'],
  [/sinigang|tinola|bulalo|nilaga|soup|lomi|arroz caldo|lugaw|porridge/, '🍲'],
  [/pancit|noodle|canton|bihon|spaghetti|pasta/, '🍜'],
  [/fish|bangus|tilapia|tuyo|sardine|tuna|isda|paksiw/, '🐟'], [/shrimp|hipon/, '🦐'],
  [/chicken|chickenjoy|manok|inasal|afritada|pecho|paa\b|tenders|nuggets|zinger/, '🍗'], [/beef|baka|tapa|bistek|caldereta|kare-kare|oxtail/, '🥩'],
  [/pork|baboy|lechon|sisig|liempo|longganisa|tocino|menudo|bicol|hotdog|luncheon|spam|bbq/, '🍖'],
  [/burger|whopper|big mac|baconator|dave's|quarter pounder|mcchicken|sandwich|filet/, '🍔'], [/fries/, '🍟'], [/siomai|dumpling|siopao|bun/, '🥟'], [/lumpia|spring roll|turon/, '🌯'],
  [/mango|mangga/, '🥭'], [/banana|saging|lakatan|saba/, '🍌'], [/pineapple/, '🍍'], [/apple/, '🍎'], [/papaya|fruit/, '🍈'],
  [/laing|pinakbet|chopsuey|monggo|gulay/, '🥬'], [/coconut|buko/, '🥥'], [/kamote|camote|sweet potato/, '🍠'], [/taho/, '🍮'],
  [/puto|bibingka|suman|kakanin|rice cake|champorado/, '🍡'], [/bread|pandesal|ensaymada|tasty/, '🍞'], [/oat/, '🥣'],
  [/peanut/, '🥜'], [/rice|kanin|sinangag/, '🍚'],
  [/gulay|vegetable|pinakbet|chopsuey|monggo|laing|talong|eggplant|salad/, '🥬'],
  [/street|fishball/, '🍢'],
];
export function foodEmoji(f) {
  if (f.source === 'recipe') return '🥘';
  const name = (f.name || '').toLowerCase();
  for (const [re, e] of EMOJI_RULES) if (re.test(name)) return e;      // the food's own name decides first
  const tags = (f.tags || '').toLowerCase();
  for (const [re, e] of EMOJI_RULES) if (re.test(tags)) return e;
  return '🍽️';
}
