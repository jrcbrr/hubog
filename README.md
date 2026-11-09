# Hubog

**Hubog** (Tagalog: *"to shape"*) is a free calorie, macro and workout tracker made with Filipino food in mind.
It's plain HTML, CSS and JavaScript. There's no backend, no build step and no account. Your data stays on your device.

## Features

**Food**
- Daily calorie and macro targets from your age, height, weight, activity and goal (Mifflin-St Jeor)
- Meal logging (breakfast, lunch, dinner, merienda) with a ring for calories left and bars for macros
- ~90 built-in Filipino dishes and staples (adobo, sinigang, silog meals, kanin by the cup, kakanin, street food)
- Packaged food search through [Open Food Facts](https://world.openfoodfacts.org)
- **Barcode scanning** with the phone camera (native `BarcodeDetector`, with `html5-qrcode` as the fallback on iPhone)
- **Nutrition label scanning**: on-device OCR with Tesseract.js, then you confirm the numbers
- **Nutrition filters**: High protein, Low carb, High carb, Low fat, High fat, Under 200 kcal, Fits my day (what's left of today's calories); sort by most protein, protein per calorie, fewest calories or carbs. Rules in `js/filters.js`
- Quick add, custom foods, favorites, recent foods, and recipes (e.g. "Sinigang ni Lola" split into servings)
- Water tracker

**Workouts**
- 4 preset plans: Beginner Full Body, Home (no equipment), Push/Pull/Legs, Dumbbells Only
- Set/rep/weight logging, automatic rest timer, exercise tips
- Progression hints: add weight once you hit the top of the rep range
- Workout history

**Progress and app**
- Streaks, days on target, 7/30-day calorie chart, average macros, weight trend chart, BMI
- English and Tagalog, light and dark theme
- Installable PWA that works offline
- **Move to a new phone**: "Save backup" shares a file (Drive, Messenger, email) or downloads it; "Restore from backup" is on the welcome screen and in Me. Weekly backup reminder; asks the browser for persistent storage so data isn't auto-cleared

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Camera scanning needs HTTPS (or `localhost`).

## Deploy (GitHub Pages)

Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
The app will be at `https://<user>.github.io/hubog/`.

## Tests

```bash
node tests/run.mjs
```

## Project layout

```
index.html, manifest.webmanifest, sw.js
css/style.css
js/app.js          router
js/store.js        localStorage data
js/calc.js         calorie/macro math
js/foods.js        built-in Filipino food list
js/off.js          Open Food Facts API
js/scan.js         camera barcode + OCR
js/label.js        nutrition label text parser
js/workouts.js     plans + progression
js/i18n.js         English / Tagalog
js/views/*.js      screens
```

## Notes

- Built-in food values are approximate home-style estimates.
- Hubog gives estimates, not medical advice.
- Packaged food data © Open Food Facts contributors, ODbL.
- Poppins font © The Poppins Project Authors, SIL Open Font License 1.1 (see `fonts/OFL.txt`).

## Restaurants

Jollibee, McDonald's, KFC, Wendy's, Burger King, Chowking, Mang Inasal, Greenwich, Shakey's and Starbucks, in `js/restaurants.js`.
Items marked `us` use the chain's published **US** nutrition facts (Philippine portions can differ). Items marked `est` are estimates,
because those chains (or those PH-only items) have no published nutrition data. The app shows estimates with "≈".

## How label scanning works (and how well)

1. The photo is shrunk to 1600 px and read with Tesseract.js (on the phone, nothing is uploaded).
2. If the result is incomplete or the numbers don't add up (kcal ≈ 4·protein + 4·carbs + 9·fat), the photo is cleaned up
   (grain removal + local thresholding, `js/imageprep.js`) and read again. The more believable result wins.
3. Common OCR slips are repaired with the same calorie check: a lost decimal point (6.6 g read as 66) and "g" read as "9".
4. Numbers that still look doubtful are highlighted in yellow next to your photo so you can check them before saving.

Measured on test labels (US, Philippine FDA and EU layouts) with the same OCR engine: clean labels 100%,
normal phone photos 90%, very blurry/grainy/tilted photos about 15%. See `tests/fixtures/label-ocr.json`.
