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
    if (!info.selectionText || !tab?.id) return;

    const { settings } = await chrome.storage.local.get("settings");

    // KVKK: İzin kontrolü
    if (!settings?.consentGiven) {
        await ensureContentScriptInjected(tab.id);
        chrome.tabs.sendMessage(tab.id, {
            type: "SHOW_CONSENT_DIALOG",
        }).catch(err => console.error("Failed to show consent dialog:", err));
        return;
    }

    const action =
        info.menuItemId === "antigravity-improve" ? "improve" : "generate";

    // Content script'in yüklendiğinden emin ol
    await ensureContentScriptInjected(tab.id);

    chrome.tabs.sendMessage(tab.id, {
        type: "GENERATE_FROM_SELECTION",
        text: info.selectionText,
        action,
        settings,
    }).catch(err => {
        console.error("Failed to send message to content script:", err);
        // Fallback: Popup'ı aç
        chrome.action.openPopup();
    });
});

// ── Content Script Injection Kontrolü ──────────────────────
async function ensureContentScriptInjected(tabId) {
    try {
        // Ping gönder, cevap gelmezse inject et
        await chrome.tabs.sendMessage(tabId, { type: "PING" });
    } catch (err) {
        // Content script yüklü değil, inject et
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ["content.js"],
            });
            await chrome.scripting.insertCSS({
                target: { tabId },
                files: ["content.css"],
            });
        } catch (injectErr) {
            console.error("Failed to inject content script:", injectErr);
            throw injectErr;
        }
    }
}

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
