// sidebar.js — Antigravity Side Panel v2
const API_BASE = "https://ai-prompt-livid.vercel.app";
const LABELS = [
    { emoji: "🎯", name: "KISA & ETKİLİ" },
    { emoji: "📝", name: "DETAYLI" },
    { emoji: "🎨", name: "YARATICI" },
    { emoji: "💼", name: "PROFESYONEL" },
    { emoji: "⚙️", name: "TEKNİK" },
];
let currentMode = "write";
let promptHistory = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
    setupTabs();
    setupTextarea();
    setupButtons();
    setupHistory();
    listenForContext();
});

async function loadData() {
    const data = await chrome.storage.local.get(["usageData", "promptHistory", "settings"]);
    if (data.usageData) {
        const { daily = 0, dailyLimit = 2, planName = "Ücretsiz" } = data.usageData;
        document.getElementById("usage-count").textContent = `${daily} / ${dailyLimit}`;
        document.getElementById("usage-fill").style.width = `${Math.min((daily / dailyLimit) * 100, 100)}%`;
        document.getElementById("plan-chip").textContent = planName;
    }
    if (data.settings?.defaultModel) document.getElementById("model-select").value = data.settings.defaultModel;
    promptHistory = data.promptHistory || [];
    renderHistoryList();
}

function listenForContext() {
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === "SIDEBAR_CONTEXT") {
            if (msg.mode) setMode(msg.mode);
            if (msg.text) applySelectedText(msg.text);
        }
    });
}

function setupTabs() {
    document.querySelectorAll(".mode-tab").forEach((tab) =>
        tab.addEventListener("click", () => setMode(tab.dataset.mode))
    );
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll(".mode-tab").forEach((t) => t.classList.toggle("active", t.dataset.mode === mode));
    document.getElementById("main-input").placeholder =
        mode === "improve"
            ? "İyileştirmek istediğin mevcut promptu buraya yapıştır…"
            : "Ne hakkında prompt üreteyim? Konu, amaç veya fikir yaz…";
    document.getElementById("gen-label").textContent = mode === "improve" ? "⚡ Promptu İyileştir" : "✨ Prompt Yaz";
}

function applySelectedText(text) {
    document.getElementById("selected-preview").textContent = text.length > 120 ? text.slice(0, 120) + "…" : text;
    document.getElementById("selected-box").style.display = "block";
    const ta = document.getElementById("main-input");
    ta.value = text; ta.focus();
    updateCharCount(text);
}

function setupTextarea() {
    const ta = document.getElementById("main-input");
    ta.addEventListener("input", () => {
        updateCharCount(ta.value);
        ta.style.height = "auto";
        ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    });
    document.getElementById("clear-btn")?.addEventListener("click", () => {
        document.getElementById("selected-box").style.display = "none";
        ta.value = "";
        updateCharCount("");
    });
}

function updateCharCount(text) {
    const el = document.getElementById("char-count");
    const n = text.length;
    el.textContent = `${n} / 1000`;
    el.style.color = n > 900 ? "#ef4444" : n > 750 ? "#fbbf24" : "";
}

function setupButtons() {
    document.getElementById("gen-btn").addEventListener("click", handleGenerate);
    document.getElementById("settings-btn").addEventListener("click", () => chrome.runtime.openOptionsPage());
    document.getElementById("kvkk-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: chrome.runtime.getURL("privacy/privacy-policy.html") });
    });
    document.getElementById("copy-all-btn")?.addEventListener("click", copyAll);
}

async function handleGenerate() {
    const input = document.getElementById("main-input").value.trim();
    if (!input) { shakeBtn(); return; }
    const btn = document.getElementById("gen-btn");
    const label = document.getElementById("gen-label");
    const spinner = document.getElementById("gen-spinner");
    btn.disabled = true; label.style.display = "none"; spinner.style.display = "block";
    showSkeleton();
    try {
        const model = document.getElementById("model-select").value;
        const category = document.getElementById("category-select").value;
        const { authToken } = await chrome.storage.local.get("authToken");
        const res = await chrome.runtime.sendMessage({
            type: "GENERATE_PROMPT",
            payload: { text: input, model, category, mode: currentMode, token: authToken },
        });
        if (!res.success) throw new Error(res.error);
        renderPrompts(res.data?.prompts || res.data?.variations || []);
        saveHistory({ text: input, mode: currentMode });
        await bumpUsage();
    } catch (err) {
        showError(err.message);
    } finally {
        btn.disabled = false; label.style.display = "block"; spinner.style.display = "none";
    }
}

function showSkeleton() {
    const results = document.getElementById("results");
    const list = document.getElementById("prompts-list");
    results.style.display = "flex";
    list.innerHTML = [1, 2, 3].map(() => `
    <div class="prompt-card" style="animation:none;opacity:1;transform:none">
      <div class="prompt-card-head">
        <div style="height:10px;width:70px;background:var(--s3);border-radius:4px;animation:pulse 1.2s ease infinite"></div>
        <div style="height:22px;width:55px;background:var(--s3);border-radius:4px;animation:pulse 1.2s ease infinite"></div>
      </div>
      <div style="height:10px;background:var(--s3);border-radius:4px;margin-bottom:6px;animation:pulse 1.2s ease infinite"></div>
      <div style="height:10px;width:75%;background:var(--s3);border-radius:4px;animation:pulse 1.2s ease infinite"></div>
    </div>
  `).join("");
    if (!document.getElementById("ag-pulse")) {
        const s = document.createElement("style"); s.id = "ag-pulse";
        s.textContent = "@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.7}}";
        document.head.appendChild(s);
    }
}

function renderPrompts(prompts) {
    const results = document.getElementById("results");
    const list = document.getElementById("prompts-list");
    results.style.display = "flex"; list.innerHTML = "";
    prompts.forEach((p, i) => {
        const text = typeof p === "string" ? p : p.content || p.text || "";
        const { emoji, name } = LABELS[i] || { emoji: "✦", name: `VARYASYON ${i + 1}` };
        const card = document.createElement("div");
        card.className = "prompt-card"; card.style.animationDelay = `${i * 60}ms`;
        card.innerHTML = `
      <div class="prompt-card-head">
        <span class="prompt-card-label">${emoji} ${name}</span>
        <button class="prompt-card-copy" data-text="${esc(text)}">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Kopyala
        </button>
      </div>
      <div class="prompt-card-text">${escHtml(text)}</div>
    `;
        list.appendChild(card);
        card.querySelector(".prompt-card-copy").addEventListener("click", (e) => {
            const b = e.currentTarget;
            navigator.clipboard.writeText(b.dataset.text);
            b.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Kopyalandı!`;
            b.classList.add("copied");
            setTimeout(() => { b.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Kopyala`; b.classList.remove("copied"); }, 2500);
        });
    });
}

function copyAll() {
    const texts = Array.from(document.querySelectorAll(".prompt-card-copy")).map((b, i) => `[${LABELS[i]?.name || i + 1}]\n${b.dataset.text}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(texts);
    const btn = document.getElementById("copy-all-btn"); btn.textContent = "✓ Tümü Kopyalandı!";
    setTimeout(() => btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Tümünü Kopyala`, 2500);
}

function showError(msg) {
    document.getElementById("results").style.display = "flex";
    document.getElementById("prompts-list").innerHTML = `<div class="error-card">⚠️ ${escHtml(msg)}</div>`;
}

function shakeBtn() {
    const btn = document.getElementById("gen-btn"); btn.style.animation = "none"; btn.offsetHeight;
    btn.style.animation = "shake 0.4s ease"; setTimeout(() => btn.style.animation = "", 400);
    if (!document.getElementById("ag-shake")) {
        const s = document.createElement("style"); s.id = "ag-shake";
        s.textContent = "@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}";
        document.head.appendChild(s);
    }
}

function setupHistory() {
    const toggle = document.getElementById("history-toggle");
    const list = document.getElementById("history-list");
    toggle.addEventListener("click", () => {
        const open = list.style.display !== "none";
        list.style.display = open ? "none" : "flex";
        toggle.classList.toggle("open", !open);
    });
}

function saveHistory(item) {
    promptHistory.unshift({ ...item, ts: Date.now() });
    if (promptHistory.length > 20) promptHistory = promptHistory.slice(0, 20);
    chrome.storage.local.set({ promptHistory });
    renderHistoryList();
}

function renderHistoryList() {
    const list = document.getElementById("history-list");
    if (!promptHistory.length) { list.innerHTML = `<div style="font-size:11px;color:var(--t2);padding:6px 0">Henüz geçmiş yok.</div>`; return; }
    list.innerHTML = promptHistory.slice(0, 10).map((item) => `
    <div class="history-item" data-text="${esc(item.text)}" data-mode="${item.mode}">
      <span class="history-mode ${item.mode}">${item.mode === "improve" ? "⚡" : "✨"}</span>
      <span class="history-text">${escHtml(item.text.slice(0, 60))}${item.text.length > 60 ? "…" : ""}</span>
    </div>
  `).join("");
    list.querySelectorAll(".history-item").forEach((el) => {
        el.addEventListener("click", () => { setMode(el.dataset.mode); document.getElementById("main-input").value = el.dataset.text; updateCharCount(el.dataset.text); });
    });
}

async function bumpUsage() {
    const { usageData } = await chrome.storage.local.get("usageData");
    if (!usageData) return;
    const updated = { ...usageData, daily: (usageData.daily || 0) + 1 };
    await chrome.storage.local.set({ usageData: updated });
    document.getElementById("usage-count").textContent = `${updated.daily} / ${updated.dailyLimit}`;
    document.getElementById("usage-fill").style.width = `${Math.min((updated.daily / updated.dailyLimit) * 100, 100)}%`;
}

function esc(str) { return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function escHtml(str) { return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
