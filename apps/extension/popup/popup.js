// popup.js — Antigravity Popup Logic
const API_BASE = "https://ai-prompt-livid.vercel.app";

const labels = [
    "🎯 Kısa & Etkili",
    "📝 Detaylı",
    "🎨 Yaratıcı",
    "💼 Profesyonel",
    "⚙️ Teknik",
];

document.addEventListener("DOMContentLoaded", async () => {
    await loadUsageData();
    setupEventListeners();
});

async function loadUsageData() {
    const data = await chrome.storage.local.get(["authToken", "usageData", "settings"]);

    if (data.usageData) {
        const { daily, dailyLimit } = data.usageData;
        const pct = Math.min((daily / dailyLimit) * 100, 100);
        document.getElementById("usage-count").textContent = `${daily} / ${dailyLimit}`;
        document.getElementById("usage-bar-fill").style.width = `${pct}%`;
        document.getElementById("plan-badge").textContent =
            data.usageData.planName || "Ücretsiz Plan";
    }
}

function setupEventListeners() {
    document.getElementById("generate-btn").addEventListener("click", handleGenerate);

    document.getElementById("settings-btn").addEventListener("click", () => {
        chrome.runtime.openOptionsPage();
    });

    document.getElementById("kvkk-link").addEventListener("click", (e) => {
        e.preventDefault();
        chrome.tabs.create({
            url: chrome.runtime.getURL("privacy/privacy-policy.html"),
        });
    });
}

async function handleGenerate() {
    const input = document.getElementById("prompt-input").value.trim();
    if (!input) return;

    const btn = document.getElementById("generate-btn");
    const btnText = document.getElementById("generate-btn-text");
    const spinner = document.getElementById("btn-spinner");

    btn.disabled = true;
    btnText.style.display = "none";
    spinner.style.display = "block";

    try {
        const model = document.getElementById("model-select").value;
        const category = document.getElementById("category-select").value;
        const { authToken } = await chrome.storage.local.get("authToken");

        const response = await chrome.runtime.sendMessage({
            type: "GENERATE_PROMPT",
            payload: { text: input, model, category, token: authToken },
        });

        if (!response.success) throw new Error(response.error);

        renderResults(response.data?.prompts || response.data?.variations || []);
    } catch (err) {
        renderError(err.message);
    } finally {
        btn.disabled = false;
        btnText.style.display = "block";
        spinner.style.display = "none";
    }
}

function renderResults(prompts) {
    const section = document.getElementById("results-section");
    const container = document.getElementById("prompts-container");
    container.innerHTML = "";

    prompts.forEach((prompt, i) => {
        const text = typeof prompt === "string" ? prompt : prompt.content || prompt.text || "";
        const card = document.createElement("div");
        card.className = "prompt-card";
        card.innerHTML = `
      <div class="prompt-card-label">${labels[i] || `Varyasyon ${i + 1}`}</div>
      <div class="prompt-card-text">${escapeHtml(text)}</div>
      <button class="prompt-card-copy" data-text="${escapeAttr(text)}">Kopyala</button>
    `;
        container.appendChild(card);
    });

    container.querySelectorAll(".prompt-card-copy").forEach((btn) => {
        btn.addEventListener("click", () => {
            navigator.clipboard.writeText(btn.dataset.text);
            btn.textContent = "✓ Kopyalandı!";
            btn.classList.add("copied");
            setTimeout(() => {
                btn.textContent = "Kopyala";
                btn.classList.remove("copied");
            }, 2000);
        });
    });

    document.getElementById("copy-all-btn").onclick = () => {
        const all = prompts
            .map((p, i) => `${labels[i] || `[${i + 1}]`}\n${typeof p === "string" ? p : p.content || ""}`)
            .join("\n\n---\n\n");
        navigator.clipboard.writeText(all);
    };

    section.style.display = "flex";
}

function renderError(msg) {
    const container = document.getElementById("prompts-container");
    container.innerHTML = `<div style="color:#ef4444;font-size:12px;padding:8px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:6px">Hata: ${msg}</div>`;
    document.getElementById("results-section").style.display = "flex";
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
