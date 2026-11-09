// English + Tagalog strings
import * as store from './store.js';

const en = {
  tagline: 'Track your food and workouts. Shape your body, one day at a time.',
  about_you: 'About you', edit_profile: 'Edit profile', sex: 'Sex', male: 'Male', female: 'Female',
  sex_note: 'Used only to estimate your calorie needs.',
  age: 'Age', height_cm: 'Height (cm)', weight_kg: 'Weight (kg)', activity: 'Activity level', yrs: 'yrs',
  act_sedentary: 'Sedentary', act_sedentary_d: 'Mostly sitting, little exercise',
  act_light: 'Lightly active', act_light_d: 'Exercise 1–3 days a week',
  act_moderate: 'Moderately active', act_moderate_d: 'Exercise 3–5 days a week',
  act_active: 'Very active', act_active_d: 'Hard exercise 6–7 days a week',
  act_very: 'Athlete', act_very_d: 'Physical job plus training',
  goal: 'Goal', goal_lose: 'Lose weight', goal_mild_lose: 'Lose slowly', goal_maintain: 'Maintain', goal_gain: 'Build muscle',
  maintenance: 'Maintenance', day: 'day', start: "Let's start", save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', back: 'Back',
  disclaimer: 'Hubog gives estimates, not medical advice. If you are under 18, pregnant, or have a health condition, check with a doctor before changing your diet.',
  today: 'Today', prev_day: 'Previous day', next_day: 'Next day', day_streak: 'day streak',
  kcal_left: 'kcal left', kcal_over: 'kcal over', eaten: 'Eaten', protein: 'Protein', carbs: 'Carbs', fat: 'Fat',
  water: 'Water', water_done: '💧 Water goal reached!', breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks',
  add_food: 'Add food', add_to: 'Add to', add_to_log: 'Add to log', added: 'Added', saved: 'Saved', deleted: 'Deleted',
  favorite: 'Favorite', approx: 'approximate', servings: 'Servings', or_grams: 'or grams', meal: 'Meal', serving: 'serving',
  scan_barcode: 'Scan barcode', scan_label: 'Scan label', quick_add: 'Quick add', create_food: 'Create food', edit_food: 'Edit food',
  search_ph: 'Search food (e.g. adobo, rice, Lucky Me)', tab_search: 'Search', tab_favorites: 'Favorites', tab_mine: 'My foods & recipes',
  recent: 'Recent', filipino_foods: 'Filipino favorites', packaged_foods: 'Packaged foods (Open Food Facts)',
  no_favorites: 'No favorites yet. Tap ★ on any food to save it here.', no_my_foods: 'No custom foods yet.',
  no_local: 'Nothing in the built-in list.', no_results: 'No results.', searching: 'Searching',
  search_failed: 'Could not reach the food database. Check your internet.', offline_search: 'You are offline — showing built-in foods only.',
  camera_starting: 'Starting camera…', type_barcode: 'Or type the barcode number', find: 'Find', looking_up: 'Looking up',
  barcode_not_found: "Product not found. Enter it once and Hubog will remember this barcode.",
  no_camera: 'Camera is not available on this device. Type the barcode instead.',
  camera_denied: 'Camera blocked. Allow camera access in your browser settings, or type the barcode.',
  label_help: 'Take a clear, flat photo of the Nutrition Facts panel in good light. You can fix any numbers after.',
  take_photo: 'Take or choose photo', reading_label: 'Reading label…',
  label_check: 'Check these numbers against the label before saving.', label_none: "Couldn't read the numbers. Please type them in.",
  label_failed: 'Could not read the photo. Try again or create the food manually.',
  food_name: 'Food name', food_name_ph: "e.g. Mama's adobo", serving_size: 'Serving size', barcode_opt: 'Barcode (optional)',
  food_saved: 'Food saved', label_opt: 'Name (optional)', quick_ph: 'e.g. Merienda',
  new_recipe: 'New recipe', edit_recipe: 'Edit recipe', recipe_name: 'Recipe name', recipe_ph: 'e.g. Sinigang ni Lola',
  servings_makes: 'Number of servings it makes', ingredients: 'Ingredients', no_ingredients: 'Add at least one ingredient.',
  add_ingredient: 'Search to add an ingredient…', per_serving: 'Per serving', save_recipe: 'Save recipe',
  recipe_need_name: 'Give your recipe a name.', delete_recipe_q: 'Delete this recipe?', recipes: 'Recipes',
  workouts: 'Workouts', your_plan: 'Your plan', this_week: 'workouts in the last 7 days', next_up: 'Next up',
  start_workout: 'Start workout', do_instead: 'Do', pick_plan: 'Pick a workout plan below to get started.',
  change_plan: 'Change plan', plans: 'Workout plans', week: 'week', workout_days: 'workout days', current: 'Current',
  use_plan: 'Use this plan', plan_set: 'Plan selected', history: 'History', no_workouts: 'No workouts yet.',
  sets: 'sets', set: 'Set', reps: 'Reps', seconds: 'Secs', done: 'Done', finish: 'Finish', rest: 'Rest', skip: 'Skip',
  how_to: 'How to do it', target: 'Target', last_time: 'Last time', discard_workout: 'Discard workout',
  discard_q: 'Discard this workout? Nothing will be saved.', discard: 'Discard', mark_a_set: 'Check off at least one set first.',
  workout_saved: 'Workout saved!', delete_workout_q: 'Delete this workout from history?',
  prog_add_weight: 'You hit every rep last time. Add {kg} kg today!', prog_same_weight: 'Same weight — try to beat last time\'s reps.',
  prog_add_rep: 'Try 1 more rep per set than last time.', prog_harder: 'You maxed this out! Slow down each rep or try a harder version.',
  progress: 'Progress', d: 'd', days_logged: 'days logged', days_on_target: 'days on target', water_goal_days: 'water goal days',
  calories: 'Calories', avg: 'avg', dashed_goal: 'Dashed line = your daily goal', avg_macros: 'Average macros (logged days)',
  weight: 'Weight', log_weight: 'Log weight', weigh_more: 'Log your weight a few times to see a trend.', all_entries: 'All entries', date: 'Date',
  me: 'Me', profile: 'Profile', daily_targets: 'Daily targets', auto_targets: 'Recommended', use_auto: 'Use recommended',
  save_targets: 'Save targets', settings: 'Settings', language: 'Language', theme: 'Theme',
  theme_auto: 'Match device', theme_light: 'Light', theme_dark: 'Dark', water_goal: 'Daily water goal', my_foods: 'My foods',
  backup: 'Backup', backup_help: 'Your data is stored only on this device. Save a backup regularly so you can restore it on a new phone.',
  export: 'Save backup', import: 'Restore backup', import_q: 'Restoring replaces all data on this device with the backup. Continue?',
  import_done: 'Backup restored', import_failed: 'That file is not a valid Hubog backup.',
  about: 'About Hubog', about_text: 'Hubog (Tagalog: "to shape") is a free calorie, macro and workout tracker made with Filipino food in mind.',
  off_credit: 'Packaged food data from', reset_all: 'Delete all my data', reset_q: 'Delete ALL data on this device? This cannot be undone.',
  have_backup: 'Switching from another phone?', have_backup_d: 'Restore your Hubog backup file to bring back all your food logs, workouts and settings.',
  restore_backup: 'Restore from backup', last_backup: 'Last backup', never: 'Never', backup_saved: 'Backup saved',
  backup_nudge: "You haven't backed up in a while. Save a backup so you don't lose your progress.", backup_now: 'Back up now', later: 'Later',
  switch_title: 'How to move Hubog to a new phone', switch_1: 'On your old phone, tap "Save backup" and send the file to yourself (Google Drive, Messenger, email).',
  switch_2: 'On the new phone, open Hubog.', switch_3: 'Tap "Restore from backup" on the welcome screen (or Me → Restore backup).',
  switch_4: 'Choose the backup file. Everything comes back: logs, workouts, foods, recipes and settings.',
  error: 'Something went wrong',
};

const tl = {
  tagline: 'I-track ang kinakain at workout mo. Hubugin ang katawan, araw-araw.',
  about_you: 'Tungkol sa iyo', edit_profile: 'I-edit ang profile', sex: 'Kasarian', male: 'Lalaki', female: 'Babae',
  sex_note: 'Gagamitin lang para tantiyahin ang kailangan mong calories.',
  age: 'Edad', height_cm: 'Taas (cm)', weight_kg: 'Timbang (kg)', activity: 'Gaano ka ka-aktibo', yrs: 'taon',
  act_sedentary: 'Laging nakaupo', act_sedentary_d: 'Halos walang ehersisyo',
  act_light: 'Medyo aktibo', act_light_d: 'Ehersisyo 1–3 araw kada linggo',
  act_moderate: 'Aktibo', act_moderate_d: 'Ehersisyo 3–5 araw kada linggo',
  act_active: 'Sobrang aktibo', act_active_d: 'Mabigat na ehersisyo 6–7 araw kada linggo',
  act_very: 'Atleta', act_very_d: 'Pisikal na trabaho at training',
  goal: 'Layunin', goal_lose: 'Magbawas ng timbang', goal_mild_lose: 'Dahan-dahang magbawas', goal_maintain: 'Panatilihin', goal_gain: 'Magpalaki ng muscle',
  maintenance: 'Pang-maintain', day: 'araw', start: 'Simulan na', save: 'I-save', cancel: 'Kanselahin', edit: 'I-edit', delete: 'Burahin', back: 'Bumalik',
  disclaimer: 'Tantiya lang ang ibinibigay ng Hubog, hindi payong medikal. Kung wala ka pang 18, buntis, o may sakit, kumonsulta muna sa doktor bago baguhin ang diet mo.',
  today: 'Ngayon', prev_day: 'Nakaraang araw', next_day: 'Susunod na araw', day_streak: 'araw na sunod-sunod',
  kcal_left: 'kcal pa', kcal_over: 'kcal sobra', eaten: 'Nakain', protein: 'Protina', carbs: 'Carbs', fat: 'Taba',
  water: 'Tubig', water_done: '💧 Naabot mo ang water goal!', breakfast: 'Almusal', lunch: 'Tanghalian', dinner: 'Hapunan', snacks: 'Merienda',
  add_food: 'Magdagdag ng pagkain', add_to: 'Idagdag sa', add_to_log: 'Idagdag', added: 'Naidagdag', saved: 'Na-save', deleted: 'Nabura',
  favorite: 'Paborito', approx: 'tantiya', servings: 'Serving', or_grams: 'o gramo', meal: 'Kainan', serving: 'serving',
  scan_barcode: 'I-scan ang barcode', scan_label: 'I-scan ang label', quick_add: 'Mabilisang dagdag', create_food: 'Gumawa ng pagkain', edit_food: 'I-edit ang pagkain',
  search_ph: 'Maghanap (hal. adobo, kanin, Lucky Me)', tab_search: 'Hanap', tab_favorites: 'Paborito', tab_mine: 'Sariling pagkain at recipe',
  recent: 'Kamakailan', filipino_foods: 'Paboritong Pinoy', packaged_foods: 'Nakabalot na pagkain (Open Food Facts)',
  no_favorites: 'Wala pang paborito. I-tap ang ★ sa kahit anong pagkain.', no_my_foods: 'Wala ka pang sariling pagkain.',
  no_local: 'Wala sa listahan.', no_results: 'Walang resulta.', searching: 'Naghahanap',
  search_failed: 'Hindi makakonekta sa food database. Tingnan ang internet mo.', offline_search: 'Offline ka — listahan lang ng Hubog ang makikita.',
  camera_starting: 'Binubuksan ang camera…', type_barcode: 'O i-type ang barcode number', find: 'Hanapin', looking_up: 'Hinahanap ang',
  barcode_not_found: 'Hindi nahanap ang produkto. Ilagay ito minsan at tatandaan ng Hubog ang barcode.',
  no_camera: 'Walang camera sa device na ito. I-type na lang ang barcode.',
  camera_denied: 'Naka-block ang camera. Payagan ito sa browser settings, o i-type ang barcode.',
  label_help: 'Kumuha ng malinaw at patag na litrato ng Nutrition Facts sa maliwanag na lugar. Puwede mong ayusin ang mga numero pagkatapos.',
  take_photo: 'Kumuha o pumili ng litrato', reading_label: 'Binabasa ang label…',
  label_check: 'Ikumpara muna ang mga numero sa label bago i-save.', label_none: 'Hindi mabasa ang mga numero. Paki-type na lang.',
  label_failed: 'Hindi mabasa ang litrato. Subukan ulit o gumawa ng pagkain nang mano-mano.',
  food_name: 'Pangalan ng pagkain', food_name_ph: 'hal. Adobo ni Nanay', serving_size: 'Laki ng serving', barcode_opt: 'Barcode (opsyonal)',
  food_saved: 'Na-save ang pagkain', label_opt: 'Pangalan (opsyonal)', quick_ph: 'hal. Merienda',
  new_recipe: 'Bagong recipe', edit_recipe: 'I-edit ang recipe', recipe_name: 'Pangalan ng recipe', recipe_ph: 'hal. Sinigang ni Lola',
  servings_makes: 'Ilang serving ang magagawa', ingredients: 'Mga sangkap', no_ingredients: 'Magdagdag ng kahit isang sangkap.',
  add_ingredient: 'Maghanap ng sangkap…', per_serving: 'Bawat serving', save_recipe: 'I-save ang recipe',
  recipe_need_name: 'Bigyan ng pangalan ang recipe.', delete_recipe_q: 'Burahin ang recipe na ito?', recipes: 'Mga recipe',
  workouts: 'Workout', your_plan: 'Ang plano mo', this_week: 'workout sa nakaraang 7 araw', next_up: 'Susunod',
  start_workout: 'Simulan ang workout', do_instead: 'Gawin ang', pick_plan: 'Pumili ng workout plan sa ibaba para makapagsimula.',
  change_plan: 'Palitan ang plano', plans: 'Mga workout plan', week: 'linggo', workout_days: 'workout days', current: 'Kasalukuyan',
  use_plan: 'Gamitin ang planong ito', plan_set: 'Napili ang plano', history: 'Kasaysayan', no_workouts: 'Wala pang workout.',
  sets: 'set', set: 'Set', reps: 'Reps', seconds: 'Segundo', done: 'Tapos', finish: 'Tapusin', rest: 'Pahinga', skip: 'Laktawan',
  how_to: 'Paano gawin', target: 'Target', last_time: 'Huling beses', discard_workout: 'Itapon ang workout',
  discard_q: 'Itapon ang workout na ito? Walang mase-save.', discard: 'Itapon', mark_a_set: 'Mag-check muna ng kahit isang set.',
  workout_saved: 'Na-save ang workout!', delete_workout_q: 'Burahin ang workout na ito sa kasaysayan?',
  prog_add_weight: 'Nakuha mo lahat ng reps noong huli. Dagdagan ng {kg} kg ngayon!', prog_same_weight: 'Parehong bigat — subukang lampasan ang reps mo noong huli.',
  prog_add_rep: 'Subukang magdagdag ng 1 rep kada set.', prog_harder: 'Na-max mo na ito! Bagalan ang bawat rep o subukan ang mas mahirap na bersyon.',
  progress: 'Progreso', d: 'a', days_logged: 'araw na may log', days_on_target: 'araw na pasok sa target', water_goal_days: 'araw na naabot ang tubig',
  calories: 'Calories', avg: 'avg', dashed_goal: 'Putol-putol na linya = goal mo kada araw', avg_macros: 'Average na macros (mga araw na may log)',
  weight: 'Timbang', log_weight: 'I-log ang timbang', weigh_more: 'I-log ang timbang mo nang ilang beses para makita ang trend.', all_entries: 'Lahat ng entry', date: 'Petsa',
  me: 'Ako', profile: 'Profile', daily_targets: 'Target kada araw', auto_targets: 'Rekomendado', use_auto: 'Gamitin ang rekomendado',
  save_targets: 'I-save ang target', settings: 'Settings', language: 'Wika', theme: 'Tema',
  theme_auto: 'Sundan ang device', theme_light: 'Maliwanag', theme_dark: 'Madilim', water_goal: 'Water goal kada araw', my_foods: 'Sariling pagkain',
  backup: 'Backup', backup_help: 'Sa device na ito lang naka-save ang data mo. Mag-save ng backup palagi para ma-restore mo ito sa bagong phone.',
  export: 'I-save ang backup', import: 'I-restore ang backup', import_q: 'Papalitan ng backup ang lahat ng data sa device na ito. Ituloy?',
  import_done: 'Naibalik ang backup', import_failed: 'Hindi valid na Hubog backup ang file na iyan.',
  about: 'Tungkol sa Hubog', about_text: 'Ang Hubog ay libreng calorie, macro at workout tracker na ginawa para sa pagkaing Pinoy.',
  off_credit: 'Data ng nakabalot na pagkain mula sa', reset_all: 'Burahin lahat ng data ko', reset_q: 'Burahin LAHAT ng data sa device na ito? Hindi na ito maibabalik.',
  have_backup: 'Galing sa ibang phone?', have_backup_d: 'I-restore ang Hubog backup file mo para maibalik lahat ng food log, workout at settings.',
  restore_backup: 'I-restore mula sa backup', last_backup: 'Huling backup', never: 'Hindi pa', backup_saved: 'Na-save ang backup',
  backup_nudge: 'Matagal ka nang hindi nagba-backup. Mag-save ng backup para hindi mawala ang progreso mo.', backup_now: 'Mag-backup na', later: 'Mamaya',
  switch_title: 'Paano ilipat ang Hubog sa bagong phone', switch_1: 'Sa lumang phone, i-tap ang "I-save ang backup" at ipadala ang file sa sarili mo (Google Drive, Messenger, email).',
  switch_2: 'Sa bagong phone, buksan ang Hubog.', switch_3: 'I-tap ang "I-restore mula sa backup" sa welcome screen (o Ako → I-restore ang backup).',
  switch_4: 'Piliin ang backup file. Babalik lahat: log, workout, pagkain, recipe at settings.',
  error: 'May nagkaproblema',
};

export const DICTS = { en, tl };
let lang = 'en';

export function initLang() { lang = store.get().settings.lang || 'en'; }
export const getLang = () => lang;
export function setLang(l) {
  lang = l;
  store.update(s => { s.settings.lang = l; });
  window.dispatchEvent(new Event('hubog:lang'));
}

export function t(key, vars = {}) {
  let s = (DICTS[lang] && DICTS[lang][key]) ?? en[key] ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

const locale = () => (lang === 'tl' ? 'fil-PH' : 'en-PH');
export function dateLabel(key, short = false) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale(), short ? { month: 'short', day: 'numeric' } : { weekday: 'short', month: 'short', day: 'numeric' });
}
export function shortDay(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale(), { weekday: 'narrow' });
}
