import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Multi-language Translator view.
 */
export function init() {
  const container = document.getElementById("translator");
  if (!container) return;

  // Expanded language list based on LibreTranslate supported languages for universal coverage
  const languages = [
    { code: "en", name: "English" },
    { code: "ar", name: "Arabic" },
    { code: "az", name: "Azerbaijani" },
    { code: "zh", name: "Chinese" },
    { code: "cs", name: "Czech" },
    { code: "da", name: "Danish" },
    { code: "nl", name: "Dutch" },
    { code: "eo", name: "Esperanto" },
    { code: "fi", name: "Finnish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "el", name: "Greek" },
    { code: "hi", name: "Hindi" },
    { code: "hu", name: "Hungarian" },
    { code: "id", name: "Indonesian" },
    { code: "ga", name: "Irish" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "fa", name: "Persian" },
    { code: "pl", name: "Polish" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "sk", name: "Slovak" },
    { code: "es", name: "Spanish" },
    { code: "sv", name: "Swedish" },
    { code: "tr", name: "Turkish" },
    { code: "uk", name: "Ukrainian" },
    { code: "vi", name: "Vietnamese" },
    { code: "bn", name: "Bangla" }
  ];

      // ---------------------------------------------------------------------
      // UI markup – responsive, dark‑mode aware, includes counters and history.
      // ---------------------------------------------------------------------
      container.innerHTML = `
        <style>
          @media (max-width: 768px) {
            .grid-12 { display: flex; flex-direction: column; }
            .grid-12 > div { width: 100% !important; }
          }
          .translator-spinner { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--text-primary); visibility: hidden; }
          @media (prefers-color-scheme: dark) {
            .card-glass, .input-glass, textarea { background: rgba(255,255,255,0.08) !important; color: var(--text-primary) !important; }
            .btn-glass { background: rgba(255,255,255,0.12) !important; }
            .translator-spinner { background: rgba(255,255,255,0.2) !important; }
            select.input-glass { background: rgba(255,255,255,0.12) !important; color: var(--text-primary) !important; }
            select.input-glass option { background: rgba(0,0,0,0.6) !important; color: var(--text-primary) !important; }
          }
        </style>
        <div class="card-glass anim-slide-up" style="position: relative;">
          <div class="module-header">
            <h2 class="module-title">🌐 Language Translator</h2>
            <button class="btn-glass btn-back-dash">🏠 Home</button>
          </div>
          <div class="grid-12" style="gap: 1rem;">
            <!-- Input pane -->
            <div style="grid-column: span 5; display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <label style="font-size:0.85rem;font-weight:700;color:var(--text-secondary);">Source Language</label>
                <select id="translator-source-lang" class="input-glass" style="width:140px;padding:0.35rem 0.5rem;font-size:0.8rem;">
                  <option value="auto">Auto‑Detect</option>
                  ${languages.map(l=>`<option value="${l.code}">${l.name}</option>`).join('')}
                </select>
              </div>
              <textarea id="translator-input-text" class="input-glass" style="height:200px;resize:none;font-size:0.95rem;padding:1rem;" placeholder="Type text to translate…"></textarea>
              <div style="font-size:0.75rem;color:var(--text-secondary);text-align:right;">
                <span id="char-count">0</span> chars / <span id="word-count">0</span> words
              </div>
            </div>
            <!-- Controls -->
            <div style="grid-column: span 2; display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;">
              <button id="translator-swap-btn" class="btn-glass" title="Swap Languages" style="width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.25rem;">🔄</button>
              <button id="translator-action-btn" class="btn-primary" style="width:100%;font-weight:700;">Translate →</button>
            </div>
            <!-- Output pane -->
            <div style="grid-column: span 5; display:flex;flex-direction:column;gap:0.5rem;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <label style="font-size:0.85rem;font-weight:700;color:var(--text-secondary);">Target Language</label>
                <select id="translator-target-lang" class="input-glass" style="width:140px;padding:0.35rem 0.5rem;font-size:0.8rem;">
                  ${languages.map(l=>`<option value="${l.code}" ${l.code==='es'?'selected':''}>${l.name}</option>`).join('')}
                </select>
              </div>
              <div style="position:relative;height:200px;">
                <textarea id="translator-output-text" class="input-glass" style="height:100%;width:100%;resize:none;font-size:0.95rem;padding:1rem;background:rgba(0,0,0,0.15);" readonly placeholder="Translation will appear here…"></textarea>
                <button id="translator-copy-btn" class="btn-glass" style="position:absolute;right:10px;bottom:10px;padding:0.35rem 0.75rem;font-size:0.75rem;display:flex;align-items:center;gap:5px;">📋 Copy</button>
              </div>
            </div>
          </div>
        </div>
        <div class="translator-spinner" id="translator-spinner">⏳ Translating…</div>
      `;

      // ---------------------------------------------------------------------
      // State & utilities
      // ---------------------------------------------------------------------
      const inputArea = document.getElementById("translator-input-text");
      const outputArea = document.getElementById("translator-output-text");
      const sourceSel = document.getElementById("translator-source-lang");
      const targetSel = document.getElementById("translator-target-lang");
      const swapBtn = document.getElementById("translator-swap-btn");
      const actionBtn = document.getElementById("translator-action-btn");
      const copyBtn = document.getElementById("translator-copy-btn");
      const spinner = document.getElementById("translator-spinner");
      const charCountEl = document.getElementById("char-count");
      const wordCountEl = document.getElementById("word-count");

      const cache = new Map(); // key -> translated text
      const historyKey = "translator-history";
      const maxHistory = 50;

      // ---------------------------------------------------------------------
      // Helper: update counters
      // ---------------------------------------------------------------------
      function updateCounters() {
        const text = inputArea.value;
        charCountEl.textContent = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        wordCountEl.textContent = words;
      }
      inputArea.addEventListener("input", updateCounters);
      updateCounters();

      // ---------------------------------------------------------------------
      // Helper: debounce
      // ---------------------------------------------------------------------
      function debounce(fn, delay) {
        let timer;
        return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => fn.apply(this, args), delay);
        };
      }

      // ---------------------------------------------------------------------
      // Translation provider implementations
      // ---------------------------------------------------------------------
      const LIBRE_ENDPOINT = "https://libretranslate.de/translate";
      const GOOGLE_ENDPOINT = "https://translation.googleapis.com/language/translate/v2";
      const GOOGLE_API_KEY = window.GOOGLE_TRANSLATE_API_KEY || ""; // optional
      const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";

      async function callProvider(url, options, signal) {
        const response = await fetch(url, { ...options, signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      }

      async function translateLibre(text, source, target, signal) {
        const body = JSON.stringify({ q: text, source: source === "auto" ? "auto" : source, target, format: "text" });
        const data = await callProvider(LIBRE_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body }, signal);
        if (!data.translatedText) throw new Error("LibreTranslate missing result");
        return data.translatedText;
      }

      async function translateGoogle(text, source, target, signal) {
        if (!GOOGLE_API_KEY) throw new Error("Google API key not configured");
        const params = new URLSearchParams({ q: text, target, key: GOOGLE_API_KEY });
        if (source && source !== "auto") params.append("source", source);
        const url = `${GOOGLE_ENDPOINT}?${params.toString()}`;
        const data = await callProvider(url, { method: "GET" }, signal);
        if (!data.data || !data.data.translations || !data.data.translations[0].translatedText) {
          throw new Error("Google translate malformed response");
        }
        return data.data.translations[0].translatedText;
      }

      async function translateMyMemory(text, source, target, signal) {
        const params = new URLSearchParams({ q: text, langpair: `${source}|${target}` });
        const url = `${MYMEMORY_ENDPOINT}?${params.toString()}`;
        const data = await callProvider(url, { method: "GET" }, signal);
        if (!data.responseData || typeof data.responseData.translatedText !== "string") {
          throw new Error("MyMemory malformed response");
        }
        return data.responseData.translatedText;
      }

      // ---------------------------------------------------------------------
      // Core translation orchestration with fallback, retry, timeout, abort.
      // ---------------------------------------------------------------------
      async function translateWithFallback(text, source, target) {
        const cacheKey = `${text}|${source}|${target}`;
        if (cache.has(cacheKey)) return cache.get(cacheKey);

        const providers = [translateLibre, translateGoogle, translateMyMemory];
        let lastError;
        for (const provider of providers) {
          for (let attempt = 0; attempt < 2; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            try {
              const result = await provider(text, source, target, controller.signal);
              clearTimeout(timeoutId);
              cache.set(cacheKey, result);
              return result;
            } catch (e) {
              clearTimeout(timeoutId);
              lastError = e;
              // If abort due to timeout, break retry loop and try next provider.
              if (e.name === "AbortError") break;
            }
          }
        }
        throw lastError || new Error("All translation providers failed");
      }

      // ---------------------------------------------------------------------
      // History handling (localStorage)
      // ---------------------------------------------------------------------
      function loadHistory() {
        try { return JSON.parse(localStorage.getItem(historyKey)) || []; } catch { return []; }
      }
      function saveHistory(entry) {
        const hist = loadHistory();
        hist.unshift(entry);
        if (hist.length > maxHistory) hist.pop();
        localStorage.setItem(historyKey, JSON.stringify(hist));
      }

      // ---------------------------------------------------------------------
      // UI actions
      // ---------------------------------------------------------------------
      async function performTranslation() {
        const text = inputArea.value.trim();
        const source = sourceSel.value;
        const target = targetSel.value;
        if (!text) { outputArea.value = ""; return; }

        actionBtn.disabled = true;
        spinner.style.visibility = "visible";
        outputArea.placeholder = "Translating…";
        try {
          const translated = await translateWithFallback(text, source, target);
          outputArea.value = translated;
          saveHistory({ text, translated, source, target, timestamp: Date.now() });
        } catch (e) {
          console.error(e);
          if (e.name === "AbortError") {
            outputArea.value = "Network Error (timeout)";
          } else if (e.message.includes("offline")) {
            outputArea.value = "Provider Offline";
          } else if (e.message.includes("rate limit")) {
            outputArea.value = "Rate Limited";
          } else if (e.message.includes("unsupported")) {
            outputArea.value = "Language Not Supported";
          } else {
            outputArea.value = "Translation Failed";
          }
        } finally {
          actionBtn.disabled = false;
          spinner.style.visibility = "hidden";
          outputArea.placeholder = "Translation will appear here…";
        }
      }

      const debouncedTranslate = debounce(performTranslation, 500);
      inputArea.addEventListener("input", debouncedTranslate);
      actionBtn.addEventListener("click", performTranslation);

      swapBtn.addEventListener("click", () => {
        const src = sourceSel.value;
        const tgt = targetSel.value;
        if (src === "auto") {
          sourceSel.value = tgt;
          targetSel.value = "en";
        } else {
          sourceSel.value = tgt;
          targetSel.value = src;
        }
        // swap textarea contents
        const tmp = inputArea.value;
        inputArea.value = outputArea.value;
        outputArea.value = tmp;
        updateCounters();
      });

      copyBtn.addEventListener("click", () => {
        const txt = outputArea.value;
        if (!txt) return;
        navigator.clipboard.writeText(txt).then(() => alert("Translation copied!"));
      });
    }
