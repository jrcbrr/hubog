// Camera features: barcode scanning and nutrition label OCR.
import { parseLabel, labelQuality } from './label.js';
import { toGray, median3, bradley } from './imageprep.js';
const HTML5_QRCODE = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
const TESSERACT = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

const loaded = {};
function loadScript(src) {
  return loaded[src] ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = resolve; s.onerror = () => reject(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
}

/**
 * Start scanning barcodes inside `container`. Calls onCode(code) once, then stops.
 * Returns a stop() function.
 */
export async function startBarcodeScan(container, onCode) {
  let stopped = false;
  const formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'];

  if ('BarcodeDetector' in window) {
    const supported = await window.BarcodeDetector.getSupportedFormats?.().catch(() => []) || [];
    if (supported.some(f => formats.includes(f))) {
      const detector = new window.BarcodeDetector({ formats: formats.filter(f => supported.includes(f)) });
      const video = document.createElement('video');
      video.setAttribute('playsinline', ''); video.muted = true;
      container.appendChild(video);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = stream; await video.play();
      const stop = () => { stopped = true; stream.getTracks().forEach(t => t.stop()); video.remove(); };
      const tick = async () => {
        if (stopped) return;
        try {
          const codes = await detector.detect(video);
          if (codes.length) { stop(); onCode(codes[0].rawValue); return; }
        } catch { /* frame not ready */ }
        setTimeout(tick, 200);
      };
      tick();
      return stop;
    }
  }

  // Fallback (iPhone Safari, Firefox, desktop): html5-qrcode library
  await loadScript(HTML5_QRCODE);
  const el = document.createElement('div');
  el.id = 'qr-' + Math.random().toString(36).slice(2);
  container.appendChild(el);
  const lib = window.__Html5QrcodeLibrary__ || window;
  const F = lib.Html5QrcodeSupportedFormats;
  const scanner = new lib.Html5Qrcode(el.id, {
    formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128], verbose: false,
  });
  const stop = () => {
    if (stopped) return; stopped = true;
    scanner.stop().catch(() => {}).finally(() => el.remove());
  };
  await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 260, height: 140 } },
    text => { stop(); onCode(text); }, () => {});
  return stop;
}

/**
 * Read a nutrition label photo. Pass 1 reads the plain photo; if the result looks incomplete or the
 * numbers don't add up, pass 2 reads a cleaned-up version (grain removed + local thresholding) and the
 * more believable result wins. onProgress({ pass, progress }).
 */
export async function readLabel(file, onProgress = () => {}) {
  await loadScript(TESSERACT);
  let pass = 1;
  const worker = await window.Tesseract.createWorker('eng', 1, {
    logger: m => { if (m.status === 'recognizing text') onProgress({ pass, progress: m.progress }); },
  });
  try {
    await worker.setParameters({ tessedit_pageseg_mode: '6' }); // one block of text, like a label panel
    const canvas = await loadScaled(file, 1600);
    const first = parseLabel((await worker.recognize(canvas)).data.text);
    if (labelQuality(first) >= 6) return first;          // all 4 numbers found and they add up
    pass = 2;
    const second = parseLabel((await worker.recognize(cleaned(canvas))).data.text);
    return labelQuality(second) > labelQuality(first) ? second : first;
  } finally {
    worker.terminate();
  }
}

// Large phone photos make OCR slow; shrink to max px on the long side, grayscale.
function loadScaled(file, max) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      const g = toGray(d);
      for (let i = 0, j = 0; j < g.length; i += 4, j++) d.data[i] = d.data[i + 1] = d.data[i + 2] = g[j];
      ctx.putImageData(d, 0, 0);
      URL.revokeObjectURL(img.src);
      resolve(c);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function cleaned(src) {
  const { width: w, height: h } = src;
  const ctx = src.getContext('2d', { willReadFrequently: true });
  const d = ctx.getImageData(0, 0, w, h);
  const bw = bradley(median3(toGray(d), w, h), w, h);
  for (let i = 0, j = 0; j < bw.length; i += 4, j++) d.data[i] = d.data[i + 1] = d.data[i + 2] = bw[j];
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').putImageData(d, 0, 0);
  return c;
}
