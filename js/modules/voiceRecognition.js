import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Voice Recognition & Voice control suite.
 */
export function init() {
  const container = document.getElementById("voiceRecognition");
  if (!container) return;

  const isSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🎤 Voice Command Studio</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 0; gap: 1.5rem;">
        <!-- Glowing Microphone Button -->
        <button id="voice-mic-btn" class="topbar-action-btn anim-pulse" style="width: 100px; height: 100px; font-size: 3rem; background: var(--primary); color: white; border-radius: 50%; cursor: pointer; border: none; box-shadow: 0 8px 30px var(--primary-glow); display: flex; align-items: center; justify-content: center;">
          🎙️
        </button>
        
        <div id="voice-status-text" style="font-weight: 600; color: var(--text-secondary); font-size: 1.1rem;">
          ${isSupported ? 'Click the microphone to start speaking' : 'Speech recognition not supported in this browser'}
        </div>

        <!-- Custom Waveform Visualizer simulation -->
        <div id="waveform-visualizer" style="display: flex; align-items: center; gap: 6px; height: 40px; margin: 1rem 0; width: 220px; justify-content: center; opacity: 0.15;">
          <span style="display: inline-block; width: 4px; height: 10px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
          <span style="display: inline-block; width: 4px; height: 25px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
          <span style="display: inline-block; width: 4px; height: 40px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
          <span style="display: inline-block; width: 4px; height: 18px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
          <span style="display: inline-block; width: 4px; height: 32px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
          <span style="display: inline-block; width: 4px; height: 12px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
        </div>

        <!-- Voice transcripts preview -->
        <div class="card-glass" style="width: 100%; max-width: 600px; min-height: 120px; background: rgba(0,0,0,0.1); border-color: var(--glass-border); padding: 1rem; border-radius: 12px;">
          <h3 style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 1px;">Live Transcript Output</h3>
          <p id="voice-transcript-output" style="font-size: 1rem; line-height: 1.5; color: var(--text-primary);">
            <i>Your spoken words will appear here...</i>
          </p>
        </div>

        <!-- Voice commands help list -->
        <div style="width: 100%; max-width: 600px; margin-top: 1rem;">
          <h3 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-secondary);">Available Voice Commands:</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span class="badge badge-primary">"Open Chat"</span>
            <span class="badge badge-primary">"Get weather for [City]"</span>
            <span class="badge badge-primary">"Dark Mode"</span>
            <span class="badge badge-primary">"Light Mode"</span>
            <span class="badge badge-primary">"Create task [Task]"</span>
          </div>
        </div>
      </div>
    </div>
  `;

  if (!isSupported) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  const btn = document.getElementById("voice-mic-btn");
  const statusText = document.getElementById("voice-status-text");
  const transcriptOutput = document.getElementById("voice-transcript-output");
  const waveform = document.getElementById("waveform-visualizer");

  let isListening = false;

  btn.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch(e) {}
    }
  });

  recognition.onstart = () => {
    isListening = true;
    statusText.textContent = "Listening carefully... speak now";
    statusText.style.color = "var(--primary)";
    transcriptOutput.innerHTML = "<i>Analyzing audio input...</i>";
    waveform.style.opacity = "1";
    btn.style.boxShadow = "0 8px 30px var(--secondary-glow)";
    
    // Waveform simulation
    const bars = waveform.querySelectorAll("span");
    bars.forEach((bar, idx) => {
      bar.style.animation = `floatElement ${0.5 + idx * 0.15}s ease-in-out infinite`;
    });
  };

  recognition.onend = () => {
    isListening = false;
    statusText.textContent = "Click the microphone to start speaking";
    statusText.style.color = "var(--text-secondary)";
    waveform.style.opacity = "0.15";
    btn.style.boxShadow = "0 8px 30px var(--primary-glow)";
    
    const bars = waveform.querySelectorAll("span");
    bars.forEach(bar => {
      bar.style.animation = "none";
    });
  };

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    transcriptOutput.textContent = `"${transcript}"`;
    
    // routing commands local triggers
    executeVoiceCommand(transcript);

    // Sync with apps script
    apiFetch("voiceRecognition", { transcript })
      .catch(err => console.error("voiceRecognition appsScript sync error:", err));
  };

  recognition.onerror = event => {
    console.error("Speech recognition error", event.error);
    statusText.textContent = `Error: ${event.error}`;
    statusText.style.color = "var(--danger)";
    isListening = false;
  };
}

/**
 * Basic voice command processor parser
 */
function executeVoiceCommand(text) {
  const query = text.toLowerCase().trim();
  const output = document.getElementById("voice-transcript-output");

  if (query.includes("open chat") || query.includes("go to chat") || query.includes("assistant")) {
    import("../main.js").then(m => m.navigateTo("aiChat"));
  } else if (query.includes("dark mode") || query.includes("toggle dark")) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else if (query.includes("light mode") || query.includes("toggle light")) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else if (query.includes("home") || query.includes("go home") || query.includes("dashboard")) {
    import("../main.js").then(m => m.navigateTo("dashboard"));
  } else {
    // Alert user that command sync completed
    if (output) {
      output.innerHTML = `"${text}" <br><br> <span class="badge badge-success">✓ Transcript sent to AI backend</span>`;
    }
  }
}
