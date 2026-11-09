// Image cleanup before OCR. Pure functions on grayscale pixel arrays (tested in tests/).

/** RGBA ImageData-like {data,width,height} -> Uint8ClampedArray of gray values */
export function toGray({ data, width, height }) {
  const g = new Uint8ClampedArray(width * height);
  for (let i = 0, j = 0; j < g.length; i += 4, j++) g[j] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
  return g;
}

/** 3×3 median filter: removes camera grain / speckles without blurring letters much */
export function median3(g, w, h) {
  const out = new Uint8ClampedArray(g.length);
  const win = new Uint8Array(9);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = Math.min(h - 1, Math.max(0, y + dy)) * w;
        for (let dx = -1; dx <= 1; dx++) win[n++] = g[yy + Math.min(w - 1, Math.max(0, x + dx))];
      }
      win.sort();
      out[y * w + x] = win[4];
    }
  }
  return out;
}

/**
 * Bradley adaptive threshold (integral image): turns each pixel black/white by comparing it with
 * its neighbourhood, so shadows and uneven light on a packet don't wipe out the text.
 */
export function bradley(g, w, h, { winFrac = 1 / 12, t = 0.12 } = {}) {
  const S = Math.max(15, Math.floor(Math.max(w, h) * winFrac)) | 1, r = S >> 1;
  const W1 = w + 1;
  const integ = new Float64Array(W1 * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) { row += g[y * w + x]; integ[(y + 1) * W1 + x + 1] = integ[y * W1 + x + 1] + row; }
  }
  const out = new Uint8ClampedArray(g.length);
  for (let y = 0; y < h; y++) {
    const y1 = Math.max(0, y - r), y2 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x1 = Math.max(0, x - r), x2 = Math.min(w, x + r + 1);
      const area = (y2 - y1) * (x2 - x1);
      const sum = integ[y2 * W1 + x2] - integ[y1 * W1 + x2] - integ[y2 * W1 + x1] + integ[y1 * W1 + x1];
      out[y * w + x] = g[y * w + x] * area <= sum * (1 - t) ? 0 : 255;
    }
  }
  return out;
}
