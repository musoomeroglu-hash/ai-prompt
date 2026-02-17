// background.js — Antigravity Service Worker (MV3)
// ============================================================

const API_BASE = "https://ai-prompt-livid.vercel.app";

// ── Context Menu Kurulumu ──────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "antigravity-generate",
        title: "✨ Antigravity ile Prompt Üret",
        contexts: ["selection"],
    });

    chrome.contextMenus.create({
        id: "antigravity-improve",
        title: "⚡ Seçilen Metni İyileştir",
        contexts: ["selection"],
    });

    // İlk kurulum: varsayılan ayarları kaydet
    chrome.storage.local.get("settings", (data) => {
        if (!data.settings) {
            chrome.storage.local.set({
                settings: {
                    defaultModel: "gpt-4o-mini",
                    defaultCategory: "general",
                    autoDetectPlatform: true,
                    showFloatingButton: true,
                    theme: "dark",
                    language: "tr",
                    consentGiven: false,
                    consentDate: null,
                },
            });
        }
    });
});

// ── Context Menu Click Handler ─────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!info.selectionText) return;

    const { settings } = await chrome.storage.local.get("settings");

    // KVKK: İzin kontrolü
    if (!settings?.consentGiven) {
        chrome.tabs.sendMessage(tab.id, {
            type: "SHOW_CONSENT_DIALOG",
        });
        return;
    }

    const action =
        info.menuItemId === "antigravity-improve" ? "improve" : "generate";

    chrome.tabs.sendMessage(tab.id, {
        type: "GENERATE_FROM_SELECTION",
        text: info.selectionText,
        action,
        settings,
    });
});

// ── Mesaj Dinleyici ────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GENERATE_PROMPT") {
        handleGeneratePrompt(message.payload)
            .then((result) => sendResponse({ success: true, data: result }))
            .catch((err) => sendResponse({ success: false, error: err.message }));
        return true; // async yanıt için gerekli
    }

    if (message.type === "GET_AUTH_TOKEN") {
        chrome.storage.local.get("authToken", (data) => {
            sendResponse({ token: data.authToken || null });
        });
        return true;
    }

    if (message.type === "SAVE_CONSENT") {
        chrome.storage.local.set({
            settings: {
                ...message.settings,
                consentGiven: true,
                consentDate: new Date().toISOString(),
            },
        });
        sendResponse({ success: true });
        return true;
    }
});

// ── Prompt Üretim API Çağrısı ──────────────────────────────
async function handleGeneratePrompt({ text, model, category, token }) {
    const response = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
            userMessage: text,
            selectedModel: model || "gpt-4o-mini",
            category: category || "general",
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "API hatası");
    }

    return response.json();
}
