// content.js —  Antigravity Sidebar UI
// ============================================================

let sidebar = null;
let toggleBtn = null;
let selectedText = "";
let isDragging = false;
let dragStartY = 0;
let btnStartY = 0;
let sidebarExpanded = false;

// ── Initialize Sidebar ────────────────────────────────────
async function initSidebar() {
  if (sidebar) return;

  // Load preferences
  const { sidebarPreferences } = await chrome.storage.local.get("sidebarPreferences");
  const prefs = sidebarPreferences || {
    isExpanded: false,
    buttonPosition: { side: "right", yPosition: 50 }
  };

  sidebarExpanded = prefs.isExpanded;

  // Create sidebar container
  sidebar = document.createElement("div");
  sidebar.id = "antigravity-sidebar";
  sidebar.className = sidebarExpanded ? "" : "ag-collapsed";

  sidebar.innerHTML = `
        <!-- Sidebar Panel -->
        <div class="ag-sidebar-panel">
            <!-- Header -->
            <div class="ag-sidebar-header">
                <div class="ag-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#ag-gradient)"/>
                        <defs>
                            <linearGradient id="ag-gradient" x1="2" y1="2" x2="22" y2="22">
                                <stop offset="0%" stop-color="#6366f1"/>
                                <stop offset="100%" stop-color="#8b5cf6"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <span>Antigravity</span>
                </div>
                <div class="ag-header-actions">
                    <div class="ag-usage-info" id="ag-usage-info" style="display:none">
                        <span class="ag-usage-label">Kullanım:</span>
                        <span class="ag-usage-value" id="ag-usage-value">0/0</span>
                    </div>
                    <button class="ag-icon-btn" id="ag-collapse-btn" title="Daralt">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="ag-icon-btn" id="ag-close-btn" title="Kapat">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="ag-sidebar-body">
                <!-- Selected Text Section -->
                <div class="ag-section" id="ag-text-section" style="display:none">
                    <div class="ag-section-label">Seçilen Metin</div>
                    <div class="ag-selected-text" id="ag-selected-text"></div>
                </div>

                <!-- Controls Section -->
                <div class="ag-section">
                    <div class="ag-section-label">Model</div>
                    <select class="ag-select" id="ag-model-select">
                        <option value="gpt-4o-mini">GPT-4o Mini</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="claude">Claude</option>
                        <option value="gemini">Gemini</option>
                    </select>
                </div>

                <div class="ag-section">
                    <div class="ag-section-label">Kategori</div>
                    <select class="ag-select" id="ag-category-select">
                        <option value="general">Genel</option>
                        <option value="coding">Kodlama</option>
                        <option value="writing">Yazı</option>
                        <option value="marketing">Pazarlama</option>
                        <option value="analysis">Analiz</option>
                    </select>
                </div>

                <!-- Generate Button -->
                <button class="ag-generate-btn" id="ag-generate-btn">
                    <span class="ag-btn-text">✨ Prompt Üret</span>
                    <div class="ag-spinner" style="display:none"></div>
                </button>

                <!-- Results Section -->
                <div class="ag-results" id="ag-results" style="display:none">
                    <div class="ag-results-header">
                        <span>Üretilen Promptlar</span>
                        <button class="ag-copy-all-btn" id="ag-copy-all">Tümünü Kopyala</button>
                    </div>
                    <div class="ag-prompt-list" id="ag-prompt-list"></div>
                </div>
            </div>

            <!-- Footer -->
            <div class="ag-sidebar-footer">
                <a href="https://ai-prompt-livid.vercel.app" target="_blank" class="ag-footer-link">antigravity.app</a>
                <span class="ag-footer-separator">·</span>
                <a href="#" class="ag-footer-link" id="ag-privacy-link">KVKK</a>
            </div>
        </div>

        <!-- Toggle Button -->
        <button class="ag-toggle-btn ${prefs.buttonPosition.side === 'left' ? 'ag-left' : ''}" id="ag-toggle-btn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
            </svg>
        </button>
    `;

  document.body.appendChild(sidebar);
  toggleBtn = document.getElementById("ag-toggle-btn");

  // Set initial button position
  setToggleButtonPosition(prefs.buttonPosition.yPosition);

  // Attach event listeners
  attachSidebarListeners();
  initDraggableButton();
}

// ── Toggle Sidebar ─────────────────────────────────────────
async function toggleSidebar(expand = null) {
  if (!sidebar) {
    await initSidebar();
  }

  sidebarExpanded = expand !== null ? expand : !sidebarExpanded;

  if (sidebarExpanded) {
    sidebar.classList.remove("ag-collapsed");
  } else {
    sidebar.classList.add("ag-collapsed");
  }

  // Save preference
  chrome.storage.local.get("sidebarPreferences", (data) => {
    const prefs = data.sidebarPreferences || {};
    prefs.isExpanded = sidebarExpanded;
    chrome.storage.local.set({ sidebarPreferences: prefs });
  });
}

// ── Open Sidebar with Text ─────────────────────────────────
async function openSidebarWithText(text, action = "generate") {
  await initSidebar();

  selectedText = text;
  const textSection = document.getElementById("ag-text-section");
  const textDisplay = document.getElementById("ag-selected-text");
  const categorySelect = document.getElementById("ag-category-select");
  const generateBtnText = document.querySelector("#ag-generate-btn .ag-btn-text");

  if (text && text.trim()) {
    textDisplay.textContent = text.slice(0, 200) + (text.length > 200 ? "..." : "");
    textSection.style.display = "flex";
  } else {
    textSection.style.display = "none";
  }

  // Handle action specific logic
  if (action === "improve") {
    categorySelect.value = "writing";
    generateBtnText.textContent = "⚡ Metni İyileştir";
  } else {
    // Reset to default if needed, or keep previous
    generateBtnText.textContent = "✨ Prompt Üret";
  }

  toggleSidebar(true);
}

// ── Generate Prompt ────────────────────────────────────────
async function generatePrompt() {
  const btn = document.getElementById("ag-generate-btn");
  const btnText = btn.querySelector(".ag-btn-text");
  const spinner = btn.querySelector(".ag-spinner");
  const results = document.getElementById("ag-results");
  const promptList = document.getElementById("ag-prompt-list");
  const usageInfo = document.getElementById("ag-usage-info");
  const usageValue = document.getElementById("ag-usage-value");

  btn.disabled = true;
  btnText.style.display = "none";
  spinner.style.display = "block";

  try {
    let text = selectedText || "Generate a creative prompt";
    const model = document.getElementById("ag-model-select").value;
    const category = document.getElementById("ag-category-select").value;
    const { authToken } = await chrome.storage.local.get("authToken");

    // If it's an improvement action, slightly modify the message if needed
    // but the API handles category=writing well.

    const response = await chrome.runtime.sendMessage({
      type: "GENERATE_PROMPT",
      payload: { text, model, category, token: authToken },
    });

    if (!response.success) throw new Error(response.error);

    // Update Usage Info
    if (response.subscription) {
      const sub = response.subscription;
      usageValue.textContent = `${sub.dailyPromptsUsed}/${sub.dailyPromptLimit}`;
      usageInfo.style.display = "flex";
    }

    const prompts = response.data?.prompts || response.data?.variations || [];
    promptList.innerHTML = "";

    prompts.forEach((prompt, i) => {
      const labels = ["🎯 Kısa & Etkili", "📝 Detaylı", "🎨 Yaratıcı", "💼 Profesyonel", "⚙️ Teknik"];
      const div = document.createElement("div");
      div.className = "ag-prompt-item";
      const promptText = typeof prompt === "string" ? prompt : prompt.content || prompt.text || "";

      div.innerHTML = `
                <div class="ag-prompt-label">${labels[i] || `Varyasyon ${i + 1}`}</div>
                <div class="ag-prompt-text">${escapeHtml(promptText)}</div>
                <button class="ag-copy-btn" data-text="${escapeAttr(promptText)}">Kopyala</button>
            `;
      promptList.appendChild(div);
    });

    // Attach copy handlers
    promptList.querySelectorAll(".ag-copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(btn.dataset.text);
        btn.textContent = "✓ Kopyalandı!";
        btn.classList.add("ag-copied");
        setTimeout(() => {
          btn.textContent = "Kopyala";
          btn.classList.remove("ag-copied");
        }, 2000);
      });
    });

    results.style.display = "flex";
  } catch (err) {
    promptList.innerHTML = `<div class="ag-error">Hata: ${err.message}</div>`;
    results.style.display = "flex";
  } finally {
    btn.disabled = false;
    btnText.style.display = "block";
    spinner.style.display = "none";
  }
}

// ── Attach Event Listeners ─────────────────────────────────
function attachSidebarListeners() {
  document.getElementById("ag-close-btn").addEventListener("click", () => {
    sidebar.remove();
    sidebar = null;
    toggleBtn = null;
  });

  document.getElementById("ag-collapse-btn").addEventListener("click", () => {
    toggleSidebar(false);
  });

  document.getElementById("ag-toggle-btn").addEventListener("click", () => {
    toggleSidebar(true);
  });

  document.getElementById("ag-generate-btn").addEventListener("click", generatePrompt);

  document.getElementById("ag-privacy-link").addEventListener("click", (e) => {
    e.preventDefault();
    window.open(chrome.runtime.getURL("privacy/privacy-policy.html"), "_blank");
  });

  // Keyboard shortcut: Esc to collapse
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar && !sidebar.classList.contains("ag-collapsed")) {
      toggleSidebar(false);
    }
  });
}

// ── Draggable Toggle Button ────────────────────────────────
function initDraggableButton() {
  toggleBtn.addEventListener("mousedown", startDrag);
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", endDrag);
}

function startDrag(e) {
  if (sidebar && !sidebar.classList.contains("ag-collapsed")) return;

  isDragging = true;
  dragStartY = e.clientY;
  btnStartY = toggleBtn.getBoundingClientRect().top;
  toggleBtn.classList.add("ag-dragging");
  e.preventDefault();
}

function onDrag(e) {
  if (!isDragging) return;

  const deltaY = e.clientY - dragStartY;
  const newY = btnStartY + deltaY;
  const maxY = window.innerHeight - 56;
  const clampedY = Math.max(28, Math.min(newY, maxY));

  toggleBtn.style.top = `${clampedY}px`;
  toggleBtn.style.transform = "translateY(0)";

  // Check if should snap to other side
  const distanceToLeft = e.clientX;
  const distanceToRight = window.innerWidth - e.clientX;

  if (distanceToLeft < 100 && !toggleBtn.classList.contains("ag-left")) {
    toggleBtn.classList.add("ag-left");
  } else if (distanceToRight < 100 && toggleBtn.classList.contains("ag-left")) {
    toggleBtn.classList.remove("ag-left");
  }
}

function endDrag(e) {
  if (!isDragging) return;

  isDragging = false;
  toggleBtn.classList.remove("ag-dragging");

  // Calculate final position
  const btnRect = toggleBtn.getBoundingClientRect();
  const yPercent = (btnRect.top / window.innerHeight) * 100;
  const side = toggleBtn.classList.contains("ag-left") ? "left" : "right";

  // Save position
  chrome.storage.local.get("sidebarPreferences", (data) => {
    const prefs = data.sidebarPreferences || {};
    prefs.buttonPosition = { side, yPosition: yPercent };
    chrome.storage.local.set({ sidebarPreferences: prefs });
  });

  // Reset transform for future animations
  setTimeout(() => {
    toggleBtn.style.transform = "";
  }, 100);
}

function setToggleButtonPosition(yPercent) {
  if (!toggleBtn) return;
  toggleBtn.style.top = `${yPercent}%`;
}

// ── Utility Functions ──────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ── Message Listener ───────────────────────────────────────
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "PING") {
    sendResponse({ pong: true });
    return true;
  }
  if (message.type === "TOGGLE_SIDEBAR") {
    await toggleSidebar();
  }
  if (message.type === "GENERATE_FROM_SELECTION") {
    openSidebarWithText(message.text, message.action);
  }
  if (message.type === "SHOW_CONSENT_DIALOG") {
    window.open(chrome.runtime.getURL("options/options.html#consent"), "_blank");
  }
});

// ── Auto-init on page load ─────────────────────────────────
(async () => {
  const { sidebarPreferences } = await chrome.storage.local.get("sidebarPreferences");
  if (sidebarPreferences?.isExpanded) {
    await initSidebar();
  }
})();

// ── Text Selection Floating UI ─────────────────────────────
let selectionPanel = null;

document.addEventListener("mouseup", async (e) => {
  // If clicking inside sidebar or toggle button, ignore
  if (sidebar && sidebar.contains(e.target)) return;
  if (toggleBtn && toggleBtn.contains(e.target)) return;
  if (selectionPanel && selectionPanel.contains(e.target)) return;

  const selection = window.getSelection();
  const text = selection?.toString().trim();

  // Hide panel if no text or text too short
  if (!text || text.length < 3) {
    hideSelectionPanel();
    return;
  }

  // Check settings
  const { settings } = await chrome.storage.local.get("settings");
  if (settings?.showFloatingButton === false) return;

  // Show panel near selection
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  showSelectionPanel(rect, text);
});

document.addEventListener("mousedown", (e) => {
  // Hide on click outside
  if (selectionPanel && !selectionPanel.contains(e.target)) {
    hideSelectionPanel();
  }
});

function showSelectionPanel(rect, text) {
  if (!selectionPanel) {
    selectionPanel = document.createElement("div");
    selectionPanel.className = "ag-selection-panel";
    selectionPanel.innerHTML = `
        <button class="ag-action-btn primary" id="ag-btn-generate">
          <svg viewBox="0 0 24 24" fill="none" class="ag-icon">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
          Prompt Üret
        </button>
        <div class="ag-divider"></div>
        <button class="ag-action-btn" id="ag-btn-improve">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          İyileştir
        </button>
    `;
    document.body.appendChild(selectionPanel);

    document.getElementById("ag-btn-generate").addEventListener("click", (e) => {
      handleAction(e, text, "generate");
    });

    document.getElementById("ag-btn-improve").addEventListener("click", (e) => {
      handleAction(e, text, "improve");
    });
  }

  // Position calculation
  const x = rect.left + window.scrollX + rect.width / 2 - 100; // Center roughly
  const y = rect.top + window.scrollY - 54; // Above selection

  selectionPanel.style.left = `${Math.max(8, x)}px`;
  selectionPanel.style.top = `${Math.max(8, y)}px`;
  selectionPanel.classList.add("ag-visible");
}

function handleAction(e, text, action) {
  e.preventDefault();
  e.stopPropagation();
  openSidebarWithText(text, action);
  hideSelectionPanel();
  window.getSelection().removeAllRanges();
}

function hideSelectionPanel() {
  if (selectionPanel) {
    selectionPanel.classList.remove("ag-visible");
  }
}
