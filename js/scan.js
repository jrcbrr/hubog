// Camera features: barcode scanning and nutrition label OCR.
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
  const F = window.Html5QrcodeSupportedFormats;
  const scanner = new window.Html5Qrcode(el.id, {
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

/** Run OCR on an image File. onProgress(0..1). Returns raw text. */
export async function readLabel(file, onProgress = () => {}) {
  await loadScript(TESSERACT);
  const img = await downscale(file, 1600);
  const { data } = await window.Tesseract.recognize(img, 'eng', {
    logger: m => { if (m.status === 'recognizing text') onProgress(m.progress); },
  });
  return data.text;
}

// Large phone photos make OCR slow; shrink first.
function downscale(file, max) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d');
      ctx.filter = 'grayscale(1) contrast(1.4)';
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
