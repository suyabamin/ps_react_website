import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Optical Character Recognition (OCR) module.
 */
export function init() {
  const container = document.getElementById("ocr");
  if (!container) return;

  container.innerHTML = `
    <style>
      /* Responsive layout for smaller screens */
      @media (max-width: 768px) {
        .grid-12 { display: flex; flex-direction: column; }
        .grid-12 > div { width: 100% !important; }
      }
      .ocr-spinner { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--text-primary); visibility: hidden; }
      @media (prefers-color-scheme: dark) {
        .card-glass, .input-glass, textarea { background: rgba(255,255,255,0.08) !important; color: var(--text-primary) !important; }
        .btn-glass { background: rgba(255,255,255,0.12) !important; }
        #ocr-dropzone, #ocr-preview-container { background: rgba(255,255,255,0.05) !important; border-color: var(--primary) !important; }
        .ocr-spinner { background: rgba(255,255,255,0.2) !important; }
      }
    </style>
    <div class="card-glass anim-slide-up" style="position: relative;">
      <div class="module-header">
        <h2 class="module-title">🔍 OCR Image Text Extractor</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12" style="gap: 1rem;">
        <!-- Input Dropzone & Preview -->
        <div style="grid-column: span 6; display: flex; flex-direction: column; gap: 1rem;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Upload Source Image</h3>
          <div id="ocr-dropzone" style="border: 2px dashed var(--glass-border); border-radius: var(--border-radius-md); height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition-fast); background: rgba(255,255,255,0.02);">
            <span style="font-size: 3rem; margin-bottom: 0.5rem;">🖼️</span>
            <span style="font-weight: 600; font-size: 0.9rem;">Drag & drop or click to browse</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Supports PNG, JPG, JPEG, WEBP, BMP, GIF</span>
            <input type="file" id="ocr-file-input" accept="image/*" style="display: none;" />
          </div>

          <!-- Language selector -->
          <select id="ocr-lang-select" class="input-glass" style="width: 200px; margin-top: 0.5rem;">
            <option value="eng">English</option>
            <option value="spa">Spanish</option>
            <option value="fra">French</option>
            <option value="deu">German</option>
            <option value="ita">Italian</option>
            <option value="por">Portuguese</option>
            <option value="ara">Arabic</option>
            <option value="hin">Hindi</option>
            <option value="ben">Bengali</option>
            <option value="jpn">Japanese</option>
            <option value="chi_sim">Chinese (Simplified)</option>
          </select>

          <!-- Image Preview Area -->
          <div id="ocr-preview-container" style="display: none; align-items: center; justify-content: center; border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 10px; background: rgba(0,0,0,0.1); height: 180px; overflow: hidden; position: relative;">
            <img id="ocr-preview" style="max-height: 100%; max-width: 100%; border-radius: 6px; object-fit: contain;" />
            <button id="ocr-remove-preview" style="position: absolute; right: 10px; top: 10px; font-size: 0.8rem; background: var(--danger); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">✕ Remove</button>
          </div>

          <button id="ocr-extract-btn" class="btn-primary" style="width: 100%; margin-top: 0.5rem;" disabled>Extract Text</button>
        </div>

        <!-- Extract Result -->
        <div style="grid-column: span 6; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Extracted Output</h3>
            <button id="ocr-copy-btn" class="btn-glass" style="padding: 0.3rem 0.75rem; font-size: 0.75rem; display: flex; align-items: center; gap: 5px;">📋 Copy</button>
          </div>
          <textarea id="ocr-output" class="input-glass" style="height: 260px; resize: none; font-size: 0.9rem; line-height: 1.6; padding: 1.25rem;" placeholder="Extracted text will appear here."></textarea>
          <div id="ocr-stats" style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4;">
            <div id="ocr-stat-confidence"></div>
            <div id="ocr-stat-time"></div>
            <div id="ocr-stat-lang"></div>
            <div id="ocr-stat-counts"></div>
          </div>
        </div>
      </div>
      <div class="ocr-spinner" id="ocr-spinner">⏳ Scanning...</div>
    </div>
  `;

  const dropzone = document.getElementById("ocr-dropzone");
  const fileInput = document.getElementById("ocr-file-input");
  const previewContainer = document.getElementById("ocr-preview-container");
  const preview = document.getElementById("ocr-preview");
  const removeBtn = document.getElementById("ocr-remove-preview");
  const extractBtn = document.getElementById("ocr-extract-btn");
  const output = document.getElementById("ocr-output");
  const copyBtn = document.getElementById("ocr-copy-btn");

  // Drag and drop handlers
  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", e => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--primary)";
    dropzone.style.background = "var(--primary-glow)";
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.style.borderColor = "var(--glass-border)";
    dropzone.style.background = "rgba(255,255,255,0.02)";
  });

  dropzone.addEventListener("drop", e => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--glass-border)";
    dropzone.style.background = "rgba(255,255,255,0.02)";
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelected(file);
    }
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) handleFileSelected(file);
  });

  function handleFileSelected(file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      dropzone.style.display = "none";
      previewContainer.style.display = "flex";
      extractBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  removeBtn.addEventListener("click", e => {
    e.stopPropagation();
    fileInput.value = "";
    preview.src = "";
    previewContainer.style.display = "none";
    dropzone.style.display = "flex";
    extractBtn.disabled = true;
    output.value = "";
  });

  // The mock OCR extraction fallback is now correctly placed inside the error handling block below.
  // OCR worker singleton and abort handling
  let ocrWorker = null;
  let abortController = null;

  // Updated getWorker to correctly handle the asynchronous creation of the Tesseract worker.
  // In Tesseract.js v7, `createWorker` returns a Promise that resolves to a worker object
  // already pre‑loaded. The previous implementation treated the returned Promise as the worker
  // itself, causing `load` to be undefined. The new implementation awaits the Promise and
  // skips the deprecated `load` call, only loading the requested language and initializing.
  async function getWorker(lang) {
    if (!ocrWorker) {
      const { createWorker } = await import('tesseract.js');
      // Await the promise to obtain the worker instance.
      ocrWorker = await createWorker({ logger: m => console.log('[OCR]', m) });
      // The worker is pre‑loaded; we only need to load the language and initialize.
      await ocrWorker.loadLanguage(lang);
      await ocrWorker.initialize(lang);
    } else {
      // Ensure the requested language is loaded and initialized for subsequent calls.
      await ocrWorker.loadLanguage(lang);
      await ocrWorker.initialize(lang);
    }
    return ocrWorker;
  }

  function preprocessImage(img) {
    const maxDim = 1024; // limit size for performance
    const canvas = document.createElement('canvas');
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const scale = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    // Draw image
    ctx.drawImage(img, 0, 0, width, height);
    // Simple preprocessing: grayscale + contrast boost
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      // increase contrast
      const contrast = 1.2; // 20% increase
      const newVal = ((lum / 255 - 0.5) * contrast + 0.5) * 255;
      const v = Math.max(0, Math.min(255, newVal));
      data[i] = data[i + 1] = data[i + 2] = v;
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  extractBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    // UI state
    extractBtn.disabled = true;
    extractBtn.textContent = "Scanning (OCR)...";
    output.placeholder = "Processing image...";
    const spinner = document.getElementById("ocr-spinner");
    if (spinner) spinner.style.visibility = "visible";

    // Abort previous if any
    if (abortController) abortController.abort();
    abortController = new AbortController();

    const selectedLang = document.getElementById("ocr-lang-select").value;
    const startTime = performance.now();
    try {
      // Load image into an HTMLImageElement for canvas processing
      const img = new Image();
      const imgLoad = new Promise((res, rej) => {
        img.onload = () => res();
        img.onerror = e => rej(e);
      });
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const dataUrl = await new Promise((res, rej) => {
        reader.onload = e => res(e.target.result);
        reader.onerror = e => rej(e);
      });
      img.src = dataUrl;
      await imgLoad;

      const canvas = preprocessImage(img);
      const worker = await getWorker(selectedLang);
      // Tesseract.js v7 recognize does not accept an AbortSignal; we simply call recognize.
      const { data } = await worker.recognize(canvas);
      // Populate output and stats
      output.value = data.text.trim();
      const confidence = data.confidence ? data.confidence.toFixed(2) : 'N/A';
      const duration = ((performance.now() - startTime) / 1000).toFixed(2);
      const words = data.words ? data.words.length : (output.value.match(/\S+/g) || []).length;
      const chars = output.value.length;
      const lines = output.value.split('\n').length;
      document.getElementById('ocr-stat-confidence').textContent = `Confidence: ${confidence}%`;
      document.getElementById('ocr-stat-time').textContent = `Processing time: ${duration}s`;
      document.getElementById('ocr-stat-lang').textContent = `Language: ${selectedLang}`;
      document.getElementById('ocr-stat-counts').textContent = `Words: ${words}, Characters: ${chars}, Lines: ${lines}`;
    } catch (e) {
      if (e && e.message && e.message.includes('canceled')) {
        output.value = 'OCR cancelled by user.';
      } else {
        console.error('OCR error:', e);
        output.value = `Error during OCR: ${e.message || e}`;
      }
    } finally {
      extractBtn.disabled = false;
      extractBtn.textContent = "Extract Text";
      if (spinner) spinner.style.visibility = "hidden";
    }
  });

  copyBtn.addEventListener("click", () => {
    const text = output.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert("Extracted text copied!");
    });
  });
  // Clean up OCR worker on page unload to free resources
  window.addEventListener('beforeunload', () => {
    if (ocrWorker) {
      ocrWorker.terminate();
      ocrWorker = null;
    }
  });
}
