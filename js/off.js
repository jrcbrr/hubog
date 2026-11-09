// Open Food Facts (free, open database) — https://world.openfoodfacts.org
import { per100ToServing, round1 } from './calc.js';

const FIELDS = 'code,product_name,brands,nutriments,serving_size,serving_quantity';

export function fromOFF(p) {
  if (!p) return null;
  const n = p.nutriments || {};
  const kcal100 = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : null);
  if (kcal100 == null) return null;
  const per100 = { kcal: kcal100, protein: n.proteins_100g, carbs: n.carbohydrates_100g, fat: n.fat_100g };
  const sq = Number(p.serving_quantity);
  const hasServing = sq > 0 && sq < 2000;
  const grams = hasServing ? sq : 100;
  const v = per100ToServing(per100, grams);
  const name = [p.product_name, p.brands?.split(',')[0]].filter(Boolean).join(' — ') || 'Unnamed product';
  return {
    id: 'off:' + p.code,
    name,
    serving: hasServing ? `${p.serving_size || grams + ' g'}` : '100 g',
    ...v,
    per100: { kcal: Math.round(per100.kcal), protein: round1(per100.protein || 0), carbs: round1(per100.carbs || 0), fat: round1(per100.fat || 0) },
    source: 'off',
  };
}

export async function lookupBarcode(code) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.status === 1 ? fromOFF(data.product) : null;
}

export async function searchOFF(query, signal) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=20&fields=${FIELDS}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.products || []).map(fromOFF).filter(Boolean);
}
