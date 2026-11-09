// Preset workout plans + progression logic.
// Exercise: { id, name, sets, reps: [min,max], rest (sec), type: 'weight' | 'bodyweight' | 'time', tip }

const EX = {
  squat: { name: 'Barbell squat', type: 'weight', tip: 'Chest up, knees track over toes, hips below knees if comfortable.' },
  goblet: { name: 'Goblet squat', type: 'weight', tip: 'Hold a dumbbell at your chest. Sit between your heels.' },
  bench: { name: 'Bench press', type: 'weight', tip: 'Shoulder blades squeezed, bar touches mid-chest.' },
  dbpress: { name: 'Dumbbell bench press', type: 'weight', tip: 'Lower slowly until elbows are just below the bench.' },
  ohp: { name: 'Overhead press', type: 'weight', tip: 'Squeeze glutes, press straight up, head through at the top.' },
  row: { name: 'Barbell row', type: 'weight', tip: 'Flat back, pull to your lower ribs.' },
  dbrow: { name: 'One-arm dumbbell row', type: 'weight', tip: 'Knee and hand on bench, pull elbow toward hip.' },
  rdl: { name: 'Romanian deadlift', type: 'weight', tip: 'Push hips back, slight knee bend, bar close to legs.' },
  deadlift: { name: 'Deadlift', type: 'weight', tip: 'Bar over mid-foot, brace hard, stand up tall.' },
  latpull: { name: 'Lat pulldown', type: 'weight', tip: 'Pull to upper chest, elbows down and back.' },
  pullup: { name: 'Pull-up (or assisted)', type: 'bodyweight', tip: 'Full hang to chin over bar. Use a band if needed.' },
  curl: { name: 'Dumbbell curl', type: 'weight', tip: 'Elbows still, no swinging.' },
  triext: { name: 'Triceps pushdown / extension', type: 'weight', tip: 'Elbows tucked, full lockout.' },
  latraise: { name: 'Lateral raise', type: 'weight', tip: 'Light weight, raise to shoulder height.' },
  legpress: { name: 'Leg press', type: 'weight', tip: 'Feet shoulder-width, don\'t lock knees hard.' },
  lunge: { name: 'Walking lunge', type: 'bodyweight', tip: 'Long step, back knee near the floor. Reps per leg.' },
  calf: { name: 'Calf raise', type: 'weight', tip: 'Pause at the top and bottom.' },
  legcurl: { name: 'Leg curl', type: 'weight', tip: 'Slow on the way down.' },
  pushup: { name: 'Push-up', type: 'bodyweight', tip: 'Body straight like a plank. Use knees if needed.' },
  bwsquat: { name: 'Bodyweight squat', type: 'bodyweight', tip: 'Sit back like into a chair, heels down.' },
  glutebridge: { name: 'Glute bridge', type: 'bodyweight', tip: 'Squeeze glutes at the top for 1 second.' },
  pike: { name: 'Pike push-up', type: 'bodyweight', tip: 'Hips high, lower head toward the floor.' },
  chairdip: { name: 'Chair dip', type: 'bodyweight', tip: 'Use a sturdy chair. Elbows point back.' },
  towelrow: { name: 'Door/towel row', type: 'bodyweight', tip: 'Wrap a towel around a sturdy door handle, lean back and pull.' },
  plank: { name: 'Plank', type: 'time', tip: 'Seconds held. Squeeze glutes and abs.' },
  mountain: { name: 'Mountain climbers', type: 'time', tip: 'Seconds. Keep hips level.' },
  burpee: { name: 'Burpees', type: 'bodyweight', tip: 'Go at a steady pace you can keep.' },
  splitsquat: { name: 'Bulgarian split squat', type: 'bodyweight', tip: 'Back foot on a chair. Reps per leg.' },
  superman: { name: 'Superman hold', type: 'time', tip: 'Seconds. Lift arms and legs off the floor.' },
};

const ex = (id, sets, reps, rest = 90) => ({ id, ...EX[id], sets, reps, rest });

export const PLANS = [
  {
    id: 'beginner-full',
    name: 'Beginner Full Body',
    level: 'Beginner', perWeek: 3, equipment: 'Gym',
    desc: 'Two alternating full-body days (A/B), 3 times a week. Best start if you are new to lifting.',
    days: [
      { id: 'A', name: 'Day A', exercises: [ex('squat', 3, [8, 10], 120), ex('bench', 3, [8, 10], 120), ex('row', 3, [8, 10]), ex('plank', 3, [30, 45], 60)] },
      { id: 'B', name: 'Day B', exercises: [ex('rdl', 3, [8, 10], 120), ex('ohp', 3, [8, 10], 120), ex('latpull', 3, [10, 12]), ex('lunge', 2, [10, 12], 60)] },
    ],
  },
  {
    id: 'home-noequip',
    name: 'Home Workout (No Equipment)',
    level: 'Beginner', perWeek: 3, equipment: 'None',
    desc: 'Bodyweight only. Do it in your room. Add reps each week.',
    days: [
      { id: 'A', name: 'Upper + Core', exercises: [ex('pushup', 3, [8, 15], 60), ex('towelrow', 3, [10, 15], 60), ex('pike', 3, [6, 10], 60), ex('chairdip', 3, [8, 12], 60), ex('plank', 3, [30, 60], 45)] },
      { id: 'B', name: 'Lower + Cardio', exercises: [ex('bwsquat', 3, [15, 25], 60), ex('splitsquat', 3, [8, 12], 60), ex('glutebridge', 3, [15, 20], 45), ex('burpee', 3, [8, 12], 60), ex('mountain', 3, [30, 45], 45)] },
      { id: 'C', name: 'Full Body', exercises: [ex('pushup', 3, [8, 15], 60), ex('lunge', 3, [10, 12], 60), ex('towelrow', 3, [10, 15], 60), ex('superman', 3, [20, 30], 45), ex('burpee', 2, [10, 15], 60)] },
    ],
  },
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    level: 'Intermediate', perWeek: 6, equipment: 'Gym',
    desc: 'Run it 3 or 6 days a week. More volume for building muscle.',
    days: [
      { id: 'push', name: 'Push', exercises: [ex('bench', 4, [6, 8], 150), ex('ohp', 3, [8, 10], 120), ex('dbpress', 3, [10, 12]), ex('latraise', 3, [12, 15], 60), ex('triext', 3, [10, 12], 60)] },
      { id: 'pull', name: 'Pull', exercises: [ex('deadlift', 3, [5, 6], 180), ex('pullup', 3, [6, 10], 120), ex('dbrow', 3, [10, 12]), ex('latpull', 3, [10, 12]), ex('curl', 3, [10, 12], 60)] },
      { id: 'legs', name: 'Legs', exercises: [ex('squat', 4, [6, 8], 150), ex('legpress', 3, [10, 12], 120), ex('legcurl', 3, [10, 12]), ex('lunge', 3, [10, 12], 60), ex('calf', 4, [12, 15], 60)] },
    ],
  },
  {
    id: 'dumbbell',
    name: 'Dumbbells Only',
    level: 'Beginner', perWeek: 3, equipment: 'Dumbbells',
    desc: 'For home with a pair of dumbbells. Upper / lower split.',
    days: [
      { id: 'upper', name: 'Upper', exercises: [ex('dbpress', 3, [8, 12]), ex('dbrow', 3, [8, 12]), ex('latraise', 3, [12, 15], 60), ex('curl', 3, [10, 12], 60), ex('pushup', 2, [8, 15], 60)] },
      { id: 'lower', name: 'Lower', exercises: [ex('goblet', 3, [10, 12]), ex('rdl', 3, [10, 12]), ex('splitsquat', 3, [8, 12], 60), ex('glutebridge', 3, [12, 15], 60), ex('plank', 3, [30, 60], 45)] },
    ],
  },
];

export const planById = id => PLANS.find(p => p.id === id);

/** Next day in the plan after the last finished session for that plan. */
export function nextDay(plan, sessions) {
  const last = [...sessions].reverse().find(s => s.planId === plan.id && s.finishedAt);
  if (!last) return plan.days[0];
  const i = plan.days.findIndex(d => d.id === last.dayId);
  return plan.days[(i + 1) % plan.days.length];
}

/** Last completed sets for an exercise across sessions. */
export function lastPerformance(exId, sessions) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const s = sessions[i];
    if (!s.finishedAt) continue;
    const e = s.exercises.find(x => x.id === exId);
    if (e && e.sets.some(st => st.done)) return e;
  }
  return null;
}

/**
 * Progression hint (double progression): if every set last time hit the top of the rep range,
 * add weight (weighted) or reps/time (bodyweight). Returns { kg, reps, message }.
 */
export function suggest(exercise, last) {
  const [min, max] = exercise.reps;
  if (!last) return { kg: null, reps: min, message: null };
  const done = last.sets.filter(s => s.done);
  const lastKg = Math.max(0, ...done.map(s => Number(s.kg) || 0));
  const allTop = done.length >= exercise.sets && done.every(s => Number(s.reps) >= max);
  if (exercise.type === 'weight') {
    if (allTop) {
      const step = lastKg >= 40 ? 2.5 : 1;
      return { kg: lastKg + step, reps: min, message: { key: 'prog_add_weight', vars: { kg: step } } };
    }
    return { kg: lastKg || null, reps: Math.min(max, Math.max(min, ...done.map(s => Number(s.reps) || 0))), message: { key: 'prog_same_weight', vars: {} } };
  }
  if (allTop) return { kg: null, reps: max, message: { key: 'prog_harder', vars: {} } };
  return { kg: null, reps: Math.min(max, Math.max(min, ...done.map(s => (Number(s.reps) || 0) + 1))), message: { key: 'prog_add_rep', vars: {} } };
}
