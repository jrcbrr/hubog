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
