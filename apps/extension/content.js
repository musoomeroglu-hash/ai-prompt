// content.js — Antigravity Content Script
// ============================================================

let floatingBtn = null;
let overlayPanel = null;
let selectedText = "";

// ── Floating Buton Oluştur ────────────────────────────────
function createFloatingButton() {
    if (floatingBtn) return;

    floatingBtn = document.createElement("div");
    floatingBtn.id = "antigravity-floating-btn";
    floatingBtn.innerHTML = `
    <div class="ag-btn-inner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              fill="currentColor"/>
      </svg>
      <span>Prompt Üret</span>
    </div>
  `;
    document.body.appendChild(floatingBtn);

    floatingBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openOverlay(selectedText);
    });
}

// ── Metin Seçimi Dinle ────────────────────────────────────
document.addEventListener("mouseup", async (e) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text || text.length < 3) {
        hideFloatingButton();
        return;
    }

    const { settings } = await chrome.storage.local.get("settings");
    if (!settings?.showFloatingButton) return;

    selectedText = text;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    showFloatingButton(rect);
});

document.addEventListener("mousedown", (e) => {
    if (
        floatingBtn &&
        !floatingBtn.contains(e.target) &&
        overlayPanel &&
        !overlayPanel.contains(e.target)
    ) {
        hideFloatingButton();
    }
});

function showFloatingButton(rect) {
    createFloatingButton();
    const x = rect.left + window.scrollX + rect.width / 2 - 60;
    const y = rect.top + window.scrollY - 48;
    floatingBtn.style.left = `${Math.max(8, x)}px`;
    floatingBtn.style.top = `${Math.max(8, y)}px`;
    floatingBtn.classList.add("ag-visible");
}

function hideFloatingButton() {
    if (floatingBtn) floatingBtn.classList.remove("ag-visible");
}

// ── Overlay Panel ─────────────────────────────────────────
function openOverlay(text) {
    if (overlayPanel) overlayPanel.remove();

    overlayPanel = document.createElement("div");
    overlayPanel.id = "antigravity-overlay";
    overlayPanel.innerHTML = `
    <div class="ag-overlay-backdrop"></div>
    <div class="ag-overlay-panel">
      <div class="ag-overlay-header">
        <div class="ag-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
        <button class="ag-close-btn" id="ag-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="ag-input-section">
        <div class="ag-input-label">Seçilen metin</div>
        <div class="ag-selected-text">${escapeHtml(text.slice(0, 120))}${text.length > 120 ? "..." : ""}</div>
      </div>

      <div class="ag-controls">
        <select class="ag-select" id="ag-model-select">
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gpt-4o">GPT-4o</option>
          <option value="claude">Claude</option>
          <option value="gemini">Gemini</option>
        </select>
        <select class="ag-select" id="ag-category-select">
          <option value="general">Genel</option>
          <option value="coding">Kodlama</option>
          <option value="writing">Yazı</option>
          <option value="marketing">Pazarlama</option>
          <option value="analysis">Analiz</option>
        </select>
      </div>

      <button class="ag-generate-btn" id="ag-generate-btn">
        <span class="ag-btn-text">✨ Prompt Üret</span>
        <div class="ag-spinner" style="display:none"></div>
      </button>

      <div class="ag-results" id="ag-results" style="display:none">
        <div class="ag-results-header">
          <span>Üretilen Promptlar</span>
          <button class="ag-copy-all-btn" id="ag-copy-all">Tümünü Kopyala</button>
        </div>
        <div id="ag-prompt-list" class="ag-prompt-list"></div>
      </div>

      <div class="ag-footer">
        <a href="https://ai-prompt-livid.vercel.app" target="_blank" class="ag-footer-link">
          antigravity.app
        </a>
        <span class="ag-footer-separator">·</span>
        <a href="#" class="ag-footer-link" id="ag-privacy-link">KVKK</a>
      </div>
    </div>
  `;

    document.body.appendChild(overlayPanel);
    setTimeout(() => overlayPanel.classList.add("ag-overlay-visible"), 10);

    // Event listeners
    document.getElementById("ag-close").addEventListener("click", () => {
        overlayPanel.classList.remove("ag-overlay-visible");
        setTimeout(() => overlayPanel.remove(), 300);
        overlayPanel = null;
    });

    document.getElementById("ag-generate-btn").addEventListener("click", async () => {
        await generatePromptFromOverlay(text);
    });

    document.getElementById("ag-privacy-link").addEventListener("click", (e) => {
        e.preventDefault();
        window.open(chrome.runtime.getURL("privacy/privacy-policy.html"), "_blank");
    });
}

async function generatePromptFromOverlay(text) {
    const btn = document.getElementById("ag-generate-btn");
    const btnText = btn.querySelector(".ag-btn-text");
    const spinner = btn.querySelector(".ag-spinner");
    const results = document.getElementById("ag-results");
    const promptList = document.getElementById("ag-prompt-list");

    btn.disabled = true;
    btnText.style.display = "none";
    spinner.style.display = "block";

    try {
        const model = document.getElementById("ag-model-select").value;
        const category = document.getElementById("ag-category-select").value;
        const { authToken } = await chrome.storage.local.get("authToken");

        const response = await chrome.runtime.sendMessage({
            type: "GENERATE_PROMPT",
            payload: { text, model, category, token: authToken },
        });

        if (!response.success) throw new Error(response.error);

        const prompts = response.data?.prompts || response.data?.variations || [];
        promptList.innerHTML = "";

        prompts.forEach((prompt, i) => {
            const labels = ["🎯 Kısa & Etkili", "📝 Detaylı", "🎨 Yaratıcı", "💼 Profesyonel", "⚙️ Teknik"];
            const div = document.createElement("div");
            div.className = "ag-prompt-item";
            div.innerHTML = `
        <div class="ag-prompt-label">${labels[i] || `Varyasyon ${i + 1}`}</div>
        <div class="ag-prompt-text">${escapeHtml(typeof prompt === "string" ? prompt : prompt.content || prompt.text || "")}</div>
        <button class="ag-copy-btn" data-text="${escapeAttr(typeof prompt === "string" ? prompt : prompt.content || "")}">
          Kopyala
        </button>
      `;
            promptList.appendChild(div);
        });

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

        results.style.display = "block";
    } catch (err) {
        promptList.innerHTML = `<div class="ag-error">Hata: ${err.message}</div>`;
        results.style.display = "block";
    } finally {
        btn.disabled = false;
        btnText.style.display = "block";
        spinner.style.display = "none";
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttr(str) {
    return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ── Mesaj Dinleyici ────────────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "GENERATE_FROM_SELECTION") {
        openOverlay(message.text);
    }
    if (message.type === "SHOW_CONSENT_DIALOG") {
        showConsentDialog();
    }
});

function showConsentDialog() {
    window.open(chrome.runtime.getURL("options/options.html#consent"), "_blank");
}
