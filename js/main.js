// Main entry point for the Personal AI Assistant SPA

import { apiFetch } from "./utils/fetch.js";

// Import all module initializers (they each export an init function)
import * as dashboard from "./modules/dashboard.js";
import * as aiChat from "./modules/aiChat.js";
import * as voiceRecognition from "./modules/voiceRecognition.js";
import * as voiceResponse from "./modules/voiceResponse.js";
import * as speechRecognition from "./modules/speechRecognition.js";
import * as speechSynthesis from "./modules/speechSynthesis.js";
import * as typingAnimation from "./modules/typingAnimation.js";
import * as weather from "./modules/weather.js";
import * as news from "./modules/news.js";
import * as timeModule from "./modules/time.js";
import * as calendar from "./modules/calendar.js";
import * as reminder from "./modules/reminder.js";
import * as alarm from "./modules/alarm.js";
import * as clock from "./modules/clock.js";
import * as stopwatch from "./modules/stopwatch.js";
import * as timer from "./modules/timer.js";
import * as calculator from "./modules/calculator.js";
import * as scientificCalculator from "./modules/scientificCalculator.js";
import * as unitConverter from "./modules/unitConverter.js";
import * as currencyConverter from "./modules/currencyConverter.js";
import * as qrGenerator from "./modules/qrGenerator.js";
import * as barcodeGenerator from "./modules/barcodeGenerator.js";
import * as googleSearch from "./modules/googleSearch.js";
import * as wikipediaSearch from "./modules/wikipediaSearch.js";
import * as youtubeSearch from "./modules/youtubeSearch.js";
import * as translator from "./modules/translator.js";
import * as dictionary from "./modules/dictionary.js";
import * as ocr from "./modules/ocr.js";
import * as pdfReader from "./modules/pdfReader.js";
import * as imageGallery from "./modules/imageGallery.js";
import * as camera from "./modules/camera.js";
import * as screenshot from "./modules/screenshot.js";
import * as faceDetection from "./modules/faceDetection.js";
import * as faceRecognition from "./modules/faceRecognition.js";
import * as musicPlayer from "./modules/musicPlayer.js";
import * as videoPlayer from "./modules/videoPlayer.js";
import * as todoList from "./modules/todoList.js";
import * as notes from "./modules/notes.js";
import * as chatBot from "./modules/chatBot.js";
import * as languageLearning from "./modules/languageLearning.js";
import * as healthTracker from "./modules/healthTracker.js";
import * as habitTracker from "./modules/habitTracker.js";
import * as budgetPlanner from "./modules/budgetPlanner.js";
import * as stockTracker from "./modules/stockTracker.js";
import * as newsAggregator from "./modules/newsAggregator.js";

/**
 * Register the service worker for PWA support.
 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(err => {
      console.error("Service worker registration failed:", err);
    });
  });
}

/**
 * SPA Navigation System & Router
 */
export function navigateTo(targetId) {
  const sections = document.querySelectorAll(".app-section");
  let targetExists = false;
  
  sections.forEach(sec => {
    if (sec.id === targetId) {
      sec.classList.add("active");
      targetExists = true;
    } else {
      sec.classList.remove("active");
    }
  });

  if (!targetExists) {
    console.warn(`Target section #${targetId} not found in DOM.`);
    return;
  }

  // Update active states in sidebar navigation menu
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  sidebarLinks.forEach(link => {
    if (link.getAttribute("data-target") === targetId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Smooth scroll content area back to top
  const viewport = document.getElementById("sections-viewport");
  if (viewport) viewport.scrollTop = 0;

  // Close mobile sidebar if open
  const sidebar = document.getElementById("sidebar");
  if (sidebar && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
  }

  // Auto trigger focus on relevant inputs if needed
  if (targetId === "aiChat") {
    setTimeout(() => {
      const chatInput = document.getElementById("chat-input");
      if (chatInput) chatInput.focus();
    }, 100);
  }
}

/**
 * UI State Initialization and Event Handlers
 */
function setupUIHandlers() {
  // Mobile sidebar toggle switch
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // Theme configuration controls
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem(
        "theme",
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    });
    // Restore preference
    if (localStorage.getItem("theme") === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }

  // Custom Accent Hue selectors
  const accentDots = document.querySelectorAll("#accent-selector .color-dot");
  accentDots.forEach(dot => {
    dot.addEventListener("click", () => {
      accentDots.forEach(d => d.classList.remove("active"));
      dot.classList.add("active");
      const hue = dot.getAttribute("data-hue");
      document.documentElement.style.setProperty("--accent-hue", hue);
      localStorage.setItem("accent-hue", hue);
    });
  });

  const storedHue = localStorage.getItem("accent-hue");
  if (storedHue) {
    document.documentElement.style.setProperty("--accent-hue", storedHue);
    accentDots.forEach(dot => {
      if (dot.getAttribute("data-hue") === storedHue) {
        accentDots.forEach(d => d.classList.remove("active"));
        dot.classList.add("active");
      }
    });
  }

  // Attach navigation listeners to elements with data-target
  document.addEventListener("click", e => {
    // Check if target or parent is a link/card with data-target
    const navigationEl = e.target.closest("[data-target]");
    if (navigationEl) {
      e.preventDefault();
      const targetId = navigationEl.getAttribute("data-target");
      navigateTo(targetId);
    }

    // Check click on Back-to-Dashboard buttons
    if (e.target.closest(".btn-back-dash")) {
      e.preventDefault();
      navigateTo("dashboard");
    }
  });

  // Global short-key combinations (Ctrl+K focus search, Esc go home)
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      const searchInput = document.getElementById("global-search");
      if (searchInput) searchInput.focus();
    }
    if (e.key === "Escape") {
      const activeSection = document.querySelector(".app-section.active");
      if (activeSection && activeSection.id !== "dashboard") {
        navigateTo("dashboard");
      }
    }
  });
}

/**
 * Initialise all feature modules.
 * Each module should expose an `init()` function that sets up its UI and
 * registers any event listeners.
 */
function initModules() {
  const modules = [
    dashboard,
    aiChat,
    voiceRecognition,
    voiceResponse,
    speechRecognition,
    speechSynthesis,
    typingAnimation,
    weather,
    news,
    timeModule,
    calendar,
    reminder,
    alarm,
    clock,
    stopwatch,
    timer,
    calculator,
    scientificCalculator,
    unitConverter,
    currencyConverter,
    qrGenerator,
    barcodeGenerator,
    googleSearch,
    wikipediaSearch,
    youtubeSearch,
    translator,
    dictionary,
    ocr,
    pdfReader,
    imageGallery,
    camera,
    screenshot,
    faceDetection,
    faceRecognition,
    musicPlayer,
    videoPlayer,
    todoList,
    notes,
    chatBot,
    languageLearning,
    healthTracker,
    habitTracker,
    budgetPlanner,
    stockTracker,
    newsAggregator,
  ];

  modules.forEach(mod => {
    if (mod && typeof mod.init === "function") {
      try {
        mod.init();
      } catch (e) {
        console.error(`Failed to init module:`, e);
      }
    }
  });
}

// Kick off the app once DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupUIHandlers();
    initModules();
  });
} else {
  setupUIHandlers();
  initModules();
}
