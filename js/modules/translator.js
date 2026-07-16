import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Multi-language Translator view.
 */
export function init() {
  const container = document.getElementById("translator");
  if (!container) return;

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "bn", name: "Bengali" },
    { code: "ar", name: "Arabic" },
    { code: "ru", name: "Russian" }
  ];

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🌐 Language Translator</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12" style="gap: 1rem;">
        <!-- Left Pane: Input Text -->
        <div style="grid-column: span 5; display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">Source Language</label>
            <select id="translator-source-lang" class="input-glass" style="width: 140px; padding: 0.35rem 0.5rem; font-size: 0.8rem;">
              <option value="auto">Auto-Detect</option>
              ${languages.map(l => `<option value="${l.code}">${l.name}</option>`).join("")}
            </select>
          </div>
          <textarea id="translator-input-text" class="input-glass" style="height: 250px; resize: none; font-size: 0.95rem; padding: 1rem;" placeholder="Type text here to translate..."></textarea>
        </div>

        <!-- Center Column: Swap Actions -->
        <div style="grid-column: span 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;">
          <button id="translator-swap-btn" class="btn-glass" style="width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;" title="Swap Languages">
            🔄
          </button>
          
          <button id="translator-action-btn" class="btn-primary" style="width: 100%; font-weight: 700;">
            Translate →
          </button>
        </div>

        <!-- Right Pane: Translated Text Output -->
        <div style="grid-column: span 5; display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">Target Language</label>
            <select id="translator-target-lang" class="input-glass" style="width: 140px; padding: 0.35rem 0.5rem; font-size: 0.8rem;">
              ${languages.map((l, i) => `<option value="${l.code}" ${l.code === "es" ? "selected" : ""}>${l.name}</option>`).join("")}
            </select>
          </div>
          
          <div style="position: relative; height: 250px; width: 100%;">
            <textarea id="translator-output-text" class="input-glass" style="height: 100%; width: 100%; resize: none; font-size: 0.95rem; padding: 1rem; background: rgba(0,0,0,0.15);" readonly placeholder="Translation output will appear here..."></textarea>
            
            <button id="translator-copy-btn" class="btn-glass" style="position: absolute; right: 10px; bottom: 10px; padding: 0.35rem 0.75rem; font-size: 0.75rem; display: flex; align-items: center; gap: 5px;">
              <span>📋</span> Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const inputArea = document.getElementById("translator-input-text");
  const outputArea = document.getElementById("translator-output-text");
  const sourceSel = document.getElementById("translator-source-lang");
  const targetSel = document.getElementById("translator-target-lang");
  const swapBtn = document.getElementById("translator-swap-btn");
  const actionBtn = document.getElementById("translator-action-btn");
  const copyBtn = document.getElementById("translator-copy-btn");

  actionBtn.addEventListener("click", () => {
    const text = inputArea.value.trim();
    const source = sourceSel.value;
    const target = targetSel.value;

    if (!text) {
      outputArea.value = "";
      return;
    }

    actionBtn.disabled = true;
    actionBtn.textContent = "Translating...";
    outputArea.placeholder = "Querying translation micro-service...";

    apiFetch("translator", { text, source, target })
      .then(res => {
        outputArea.value = res.translated || `(Failed) Mock translation: ${text} [to ${target.toUpperCase()}]`;
      })
      .catch(err => {
        console.warn("Translator sync error:", err);
        // Fallback simulated translation
        setTimeout(() => {
          outputArea.value = `[Trans: ${target.toUpperCase()}] ${text}`;
        }, 600);
      })
      .finally(() => {
        actionBtn.disabled = false;
        actionBtn.textContent = "Translate →";
        outputArea.placeholder = "Translation output will appear here...";
      });
  });

  swapBtn.addEventListener("click", () => {
    const srcVal = sourceSel.value;
    const tgtVal = targetSel.value;
    
    // Cannot swap auto-detect representation
    if (srcVal === "auto") {
      sourceSel.value = tgtVal;
      targetSel.value = "en";
    } else {
      sourceSel.value = tgtVal;
      targetSel.value = srcVal;
    }

    const inText = inputArea.value;
    const outText = outputArea.value;
    inputArea.value = outText;
    outputArea.value = inText;
  });

  copyBtn.addEventListener("click", () => {
    const text = outputArea.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert("Translation copied successfully!");
    });
  });
}
