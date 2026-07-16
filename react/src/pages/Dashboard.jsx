import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../js/utils/fetch.js";

// ==========================================
// 1. Clock & Date Widget
// ==========================================
function ClockWidget() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hrs = now.getHours();
      let mins = now.getMinutes();
      let secs = now.getSeconds();

      hrs = hrs < 10 ? `0${hrs}` : hrs;
      mins = mins < 10 ? `0${mins}` : mins;
      secs = secs < 10 ? `0${secs}` : secs;

      setTime(`${hrs}:${mins}:${secs}`);

      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      setDate(now.toLocaleDateString("en-US", options));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card-glass" style={{ gridColumn: "span 4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="widget-clock">
        <div id="dash-clock" className="clock-number">
          {time || "00:00:00"}
        </div>
        <div id="dash-date" className="clock-date">
          📅 {date || "--, ---, ----"}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. System Health Telemetry Widget
// ==========================================
function SystemHealthWidget() {
  const [batteryPct, setBatteryPct] = useState(100);
  const [batteryClass, setBatteryClass] = useState("circle-progress success");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storagePct, setStoragePct] = useState(88);

  const circumference = 251.2;

  useEffect(() => {
    // Battery monitoring
    if (navigator.getBattery) {
      navigator.getBattery().then((battery) => {
        const updateBattery = () => {
          const pct = Math.round(battery.level * 100);
          setBatteryPct(pct);

          let bCls = "circle-progress";
          if (battery.level <= 0.2) {
            bCls += " danger";
          } else if (battery.level <= 0.5) {
            bCls += " warning";
          } else {
            bCls += " success";
          }
          setBatteryClass(bCls);
        };

        updateBattery();
        battery.addEventListener("levelchange", updateBattery);
        battery.addEventListener("chargingchange", updateBattery);

        return () => {
          battery.removeEventListener("levelchange", updateBattery);
          battery.removeEventListener("chargingchange", updateBattery);
        };
      });
    }

    // Network status
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Storage estimation
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        const used = estimate.usage || 0;
        const total = estimate.quota || 1;
        const percentUsed = Math.min(Math.round((used / total) * 100), 100);
        setStoragePct(percentUsed);
      });
    }

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const getOffset = (percent) => {
    return circumference - (percent / 100) * circumference;
  };

  return (
    <div className="card-glass" style={{ gridColumn: "span 4" }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem" }}>System Health</h3>
      <div className="system-stats-grid">
        {/* Battery Circle */}
        <div>
          <div className="circle-chart">
            <svg className="circle-chart-svg" width="90" height="90">
              <circle className="circle-bg" cx="45" cy="45" r="40"></circle>
              <circle
                id="battery-progress"
                className={batteryClass}
                cx="45"
                cy="45"
                r="40"
                strokeDasharray={circumference}
                strokeDashoffset={getOffset(batteryPct)}
              ></circle>
            </svg>
            <span id="battery-text" className="circle-chart-text">
              {batteryPct}%
            </span>
          </div>
          <div className="system-stat-label">Battery</div>
        </div>

        {/* Network Circle */}
        <div>
          <div className="circle-chart">
            <svg className="circle-chart-svg" width="90" height="90">
              <circle className="circle-bg" cx="45" cy="45" r="40"></circle>
              <circle
                id="network-progress"
                className={`circle-progress ${isOnline ? "success" : "danger"}`}
                cx="45"
                cy="45"
                r="40"
                strokeDasharray={circumference}
                strokeDashoffset={isOnline ? 0 : circumference}
              ></circle>
            </svg>
            <span id="network-text" className="circle-chart-text">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="system-stat-label">Network</div>
        </div>

        {/* Storage Circle */}
        <div>
          <div className="circle-chart">
            <svg className="circle-chart-svg" width="90" height="90">
              <circle className="circle-bg" cx="45" cy="45" r="40"></circle>
              <circle
                id="storage-progress"
                className="circle-progress warning"
                cx="45"
                cy="45"
                r="40"
                strokeDasharray={circumference}
                strokeDashoffset={getOffset(storagePct)}
              ></circle>
            </svg>
            <span id="storage-text" className="circle-chart-text">
              {storagePct}%
            </span>
          </div>
          <div className="system-stat-label">Storage</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. Quick AI Prompt Assistant
// ==========================================
function QuickAIAssistant() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleAsk = () => {
    if (!prompt.trim()) return;
    navigate("/aiChat", { state: { initialPrompt: prompt.trim() } });
    setPrompt("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAsk();
  };

  return (
    <div className="card-glass" style={{ gridColumn: "span 8" }}>
      <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>💬</span> Quick Ask Assistant
      </h3>
      <div className="ai-prompt-bar">
        <input
          id="dash-ai-input"
          className="input-glass"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask details, create tables, write script drafts..."
        />
        <button id="dash-ai-btn" className="btn-primary" onClick={handleAsk}>
          Ask
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 4. Weather Widget
// ==========================================
function WeatherWidget() {
  const [weather, setWeather] = useState({
    temperature: 31,
    description: "Sunny Intervals",
    city: "Dhaka, BD",
  });

  useEffect(() => {
    const cacheKey = "cached_weather_summary";
    const cachedVal = localStorage.getItem(cacheKey);

    if (cachedVal) {
      try {
        setWeather(JSON.parse(cachedVal));
      } catch (e) {}
    }

    apiFetch("dashboard")
      .then((data) => {
        if (data && data.weather) {
          localStorage.setItem(cacheKey, JSON.stringify(data.weather));
          setWeather(data.weather);
        }
      })
      .catch((err) => {
        console.warn("Unable to fetch live dashboard weather data update:", err);
      });
  }, []);

  return (
    <div className="card-glass" style={{ gridColumn: "span 4" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem" }}>🌦️ Weather</h3>
        <span id="dash-weather-city" className="badge badge-primary">
          {weather.city}
        </span>
      </div>
      <div id="dash-weather-detail" style={{ textAlign: "center", padding: "0.5rem 0" }}>
        <div style={{ fontSize: "2.25rem" }}>⛅</div>
        <div id="dash-weather-temp" style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.25rem 0" }}>
          {weather.temperature}°C
        </div>
        <div id="dash-weather-desc" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {weather.description}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. Quick Tasks Widget
// ==========================================
function QuickTasksWidget() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem("todos") || "[]");
    } catch (e) {}

    if (list.length === 0) {
      list = [
        { text: "Update dashboard design metrics", done: true, tag: "UI" },
        { text: "Connect Sheets CRUD API", done: false, tag: "Database" },
        { text: "Sync files to Google Drive", done: false, tag: "Storage" },
      ];
      localStorage.setItem("todos", JSON.stringify(list));
    }
    setTodos(list);
  }, []);

  const pending = todos.filter((t) => !t.done);

  return (
    <div className="card-glass" style={{ gridColumn: "span 4" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem" }}>📋 Quick Tasks</h3>
        <span
          id="dash-todo-badge"
          className={`badge ${pending.length === 0 ? "badge-success" : "badge-warning"}`}
        >
          {pending.length} Pending
        </span>
      </div>
      <div id="dash-todo-items">
        {todos.slice(0, 3).map((t, idx) => (
          <div className="widget-list-item" key={idx}>
            <span
              className="widget-list-text"
              style={t.done ? { textDecoration: "line-through", opacity: 0.6 } : {}}
            >
              {t.text}
            </span>
            <span className={`badge ${t.done ? "badge-success" : "badge-primary"}`}>
              {t.tag || "Task"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 6. Sticky Note Widget
// ==========================================
function StickyNoteWidget() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [buttonText, setButtonText] = useState("Save to Notes Database");

  useEffect(() => {
    setContent(localStorage.getItem("temp_sticky_draft") || "");
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setContent(val);
    localStorage.setItem("temp_sticky_draft", val);
  };

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setSaving(true);
    setButtonText("Saving to Sheets...");

    apiFetch("saveNote", { note: trimmed })
      .then(() => {
        alert("Sticky Note submitted successfully to sheets database!");
        setContent("");
        localStorage.removeItem("temp_sticky_draft");
      })
      .catch((err) => {
        console.error("Failed to sync sticky note to Apps Script:", err);
        // Save to offline notes registry as backup fallback
        let offlineNotes = JSON.parse(localStorage.getItem("offline_notes") || "[]");
        offlineNotes.push({ content: trimmed, date: new Date().toISOString() });
        localStorage.setItem("offline_notes", JSON.stringify(offlineNotes));
        alert("Network offline. Sticky note saved to local cache browser database.");
      })
      .finally(() => {
        setSaving(false);
        setButtonText("Save to Notes Database");
      });
  };

  return (
    <div className="card-glass" style={{ gridColumn: "span 4" }}>
      <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>📌 Sticky Note</h3>
      <textarea
        id="dash-sticky-note"
        className="input-glass"
        style={{ height: "70px", resize: "none", fontSize: "0.85rem", marginBottom: "0.5rem" }}
        placeholder="Save temporary thoughts/scratch logs..."
        value={content}
        onChange={handleInputChange}
      ></textarea>
      <button
        id="dash-save-note"
        className="btn-primary"
        style={{ padding: "0.35rem", fontSize: "0.8rem", width: "100%" }}
        disabled={saving}
        onClick={handleSave}
      >
        {buttonText}
      </button>
    </div>
  );
}

// ==========================================
// 7. Launcher Grid / Shortcut Links
// ==========================================
function LauncherGrid() {
  const navigate = useNavigate();

  const launchers = [
    { target: "aiChat", icon: "💬", title: "AI Chat" },
    { target: "voiceRecognition", icon: "🎤", title: "Voice Control" },
    { target: "speechRecognition", icon: "🔊", title: "Dictation" },
    { target: "translator", icon: "🌐", title: "Translator" },
    { target: "ocr", icon: "🔍", title: "OCR Extractor" },
    { target: "faceDetection", icon: "👤", title: "Face Recog" },
    { target: "todoList", icon: "✅", title: "To-do List" },
    { target: "notes", icon: "📝", title: "Notes Workspace" },
    { target: "expenseTracker", icon: "💰", title: "Expenses" },
    { target: "calendar", icon: "📅", title: "Calendar" },
    { target: "reminder", icon: "🔔", title: "Reminders" },
    { target: "pdfReader", icon: "📄", title: "PDF Reader" },
    { target: "calculator", icon: "➗", title: "Calculator" },
    { target: "qrGenerator", icon: "📱", title: "QR/Barcodes" },
    { target: "camera", icon: "📷", title: "Camera Hub" },
    { target: "musicPlayer", icon: "🎵", title: "Media Player" },
  ];

  return (
    <div className="launcher-grid">
      {launchers.map((item) => (
        <div
          key={item.target}
          className="launcher-card"
          data-target={item.target}
          onClick={() => navigate(`/${item.target}`)}
        >
          <span className="launcher-icon">{item.icon}</span>
          <span className="launcher-title">{item.title}</span>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// Main Dashboard Page Component
// ==========================================
export default function Dashboard() {
  return (
    <div id="dashboard" className="app-section active">
      {/* Row 1: Welcome Banner & Clock Widget */}
      <div className="grid-12" style={{ marginBottom: "1.5rem" }}>
        <div className="card-glass welcome-card" style={{ gridColumn: "span 8" }}>
          <div className="welcome-emoji">⚡</div>
          <h2 id="welcome-msg" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Good Day, Commander
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "80%" }}>
            Welcome back to your workspace. All local micro-services are active. Ask me anything to begin.
          </p>
        </div>
        <ClockWidget />
      </div>

      {/* Row 2: Prompt Bar and System metrics */}
      <div className="grid-12" style={{ marginBottom: "1.5rem" }}>
        <QuickAIAssistant />
        <SystemHealthWidget />
      </div>

      {/* Row 3: Widgets Grid */}
      <div className="grid-12" style={{ marginBottom: "1.5rem" }}>
        <WeatherWidget />
        <QuickTasksWidget />
        <StickyNoteWidget />
      </div>

      {/* Row 4: Shortcuts Modules Launchers */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "2rem 0 1rem 0" }}>
        Launch Assistant Modules
      </h3>
      <LauncherGrid />
    </div>
  );
}
