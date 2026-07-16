import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Dictation (Continuous Speech Recognition) module.
 */
export function init() {
  const container = document.getElementById("speechRecognition");
  if (!container) return;

  const isSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🔊 Speech-to-Text Dictation</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12">
        <!-- Control buttons side -->
        <div style="grid-column: span 4; display: flex; flex-direction: column; gap: 1rem;">
          <button id="dictation-start-btn" class="btn-primary" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <span>🎙️</span> Start Dictation
          </button>
          
          <button id="dictation-stop-btn" class="btn-glass" style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;" disabled>
            <span>⏹️</span> Stop Dictation
          </button>

          <button id="dictation-copy-btn" class="btn-glass" style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;">
            <span>📋</span> Copy to Clipboard
          </button>

          <button id="dictation-download-btn" class="btn-glass" style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;">
            <span>💾</span> Save Text File
          </button>

          <button id="dictation-clear-btn" class="btn-glass" style="display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--danger); width: 100%;">
            <span>🗑️</span> Clear All
          </button>

          <div id="dictation-indicator" style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-top: 1rem;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ccc;" id="dictation-dot"></span>
            <span id="dictation-status-label">${isSupported ? 'Systems Active' : 'Speech Not Supported'}</span>
          </div>
        </div>

        <!-- Dictation Text Area -->
        <div style="grid-column: span 8;">
          <textarea id="dictation-textarea" class="input-glass" style="width: 100%; height: 350px; resize: none; font-size: 0.95rem; line-height: 1.6; padding: 1.25rem;" placeholder="Click 'Start Dictation' and begin speaking. Your words will be transcribed in real-time here..."></textarea>
        </div>
      </div>
    </div>
  `;

  if (!isSupported) return;

  const startBtn = document.getElementById("dictation-start-btn");
  const stopBtn = document.getElementById("dictation-stop-btn");
  const copyBtn = document.getElementById("dictation-copy-btn");
  const downloadBtn = document.getElementById("dictation-download-btn");
  const clearBtn = document.getElementById("dictation-clear-btn");
  const textarea = document.getElementById("dictation-textarea");
  const dot = document.getElementById("dictation-dot");
  const statusLabel = document.getElementById("dictation-status-label");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let finalTranscript = "";

  startBtn.addEventListener("click", () => {
    try {
      recognition.start();
    } catch(e) {}
  });

  stopBtn.addEventListener("click", () => {
    recognition.stop();
  });

  recognition.onstart = () => {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    dot.style.background = "var(--danger)";
    dot.style.boxShadow = "0 0 10px var(--danger)";
    statusLabel.textContent = "Listening continuously...";
  };

  recognition.onend = () => {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    dot.style.background = "var(--success)";
    dot.style.boxShadow = "none";
    statusLabel.textContent = "Dictation stopped";
  };

  recognition.onresult = event => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + " ";
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    textarea.value = finalTranscript + interimTranscript;
    textarea.scrollTop = textarea.scrollHeight;

    // Send delta update check to Apps Script
    if (finalTranscript.trim()) {
      apiFetch("speechRecognition", { transcript: finalTranscript.trim() })
        .catch(err => console.error(err));
    }
  };

  copyBtn.addEventListener("click", () => {
    const text = textarea.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert("Dictated text copied to clipboard!");
    });
  });

  downloadBtn.addEventListener("click", () => {
    const text = textarea.value;
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dictation_transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your current transcription?")) {
      finalTranscript = "";
      textarea.value = "";
    }
  });
}
