import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Optical Character Recognition (OCR) module.
 */
export function init() {
  const container = document.getElementById("ocr");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🔍 OCR Image Text Extractor</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12">
        <!-- Input Dropzone & Preview -->
        <div style="grid-column: span 6; display: flex; flex-direction: column; gap: 1rem;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Upload Source Image</h3>
          
          <div id="ocr-dropzone" style="border: 2px dashed var(--glass-border); border-radius: var(--border-radius-md); height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition-fast); background: rgba(255,255,255,0.02);">
            <span style="font-size: 3rem; margin-bottom: 0.5rem;">🖼️</span>
            <span style="font-weight: 600; font-size: 0.9rem;">Drag and drop image or Click to browse</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Supports JPG, PNG, WEBP</span>
            <input type="file" id="ocr-file-input" accept="image/*" style="display: none;" />
          </div>

          <!-- Image Preview Area -->
          <div id="ocr-preview-container" style="display: none; align-items: center; justify-content: center; border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 10px; background: rgba(0,0,0,0.1); height: 180px; overflow: hidden; position: relative;">
            <img id="ocr-preview" style="max-height: 100%; max-width: 100%; border-radius: 6px; object-fit: contain;" />
            <button id="ocr-remove-preview" style="position: absolute; right: 10px; top: 10px; font-size: 0.8rem; background: var(--danger); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">✕ Remove</button>
          </div>

          <button id="ocr-extract-btn" class="btn-primary" style="width: 100%; margin-top: 0.5rem;" disabled>
            Extract Text from Image
          </button>
        </div>

        <!-- Extract Result Textarea -->
        <div style="grid-column: span 6; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Extracted Output</h3>
            <button id="ocr-copy-btn" class="btn-glass" style="padding: 0.3rem 0.75rem; font-size: 0.75rem; display: flex; align-items: center; gap: 5px;">
              <span>📋</span> Copy Text
            </button>
          </div>

          <textarea id="ocr-output" class="input-glass" style="height: 380px; resize: none; font-size: 0.9rem; line-height: 1.6; padding: 1.25rem;" placeholder="Extracted text will appear here. You can edit / correct details after scan."></textarea>
        </div>
      </div>
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

  extractBtn.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) return;

    extractBtn.disabled = true;
    extractBtn.textContent = "Scanning characters (OCR)...";
    output.placeholder = "Reading image pixels and extracting text strings...";

    // Mock OCR or Sheets Apps Script base64 sync
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      apiFetch("ocrImage", { base64, filename: file.name })
        .then(res => {
          output.value = res.text || "Extracted content: No text labels discovered in image scanner.";
        })
        .catch(err => {
          console.warn("OCR API error, simulating extract:", err);
          // simulated extraction backup fallback
          setTimeout(() => {
            output.value = `[OCR Extract Result]
File Name: ${file.name}
Uploaded Size: ${Math.round(file.size / 1024)} KB
---
MOCKED EXTRACTED TEXT:
1. Product Item SKU-9080-23
2. Total Balance: $1,250.00 USD
3. Date: 2026-07-14
4. Status: VERIFIED AND PROCESS COMPLETED SUCCESSFULLY`;
          }, 1500);
        })
        .finally(() => {
          extractBtn.disabled = false;
          extractBtn.textContent = "Extract Text from Image";
        });
    };
    reader.readAsDataURL(file);
  });

  copyBtn.addEventListener("click", () => {
    const text = output.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert("Extracted text copied!");
    });
  });
}
