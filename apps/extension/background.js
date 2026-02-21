// background.js — Antigravity Service Worker v2
const API_BASE = "https://ai-prompt-livid.vercel.app";

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "ag-improve",
        title: "⚡ Prompt İyileştir — Antigravity",
        contexts: ["selection"],
    });
    chrome.contextMenus.create({
        id: "ag-write",
        title: "✨ Prompt Yaz — Antigravity",
        contexts: ["selection"],
    });
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
    chrome.storage.local.get("settings", (data) => {
        if (!data.settings) {
            chrome.storage.local.set({
                settings: {
                    defaultModel: "gpt-4o-mini",
                    defaultCategory: "general",
                    showInlineIcon: true,
                    consentGiven: false,
                    consentDate: null,
                },
            });
        }
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!info.selectionText) return;
    const { settings } = await chrome.storage.local.get("settings");
    if (!settings?.consentGiven) {
        chrome.tabs.sendMessage(tab.id, { type: "SHOW_CONSENT" });
        return;
    }
    const mode = info.menuItemId === "ag-improve" ? "improve" : "write";
    await chrome.sidePanel.open({ tabId: tab.id });
    setTimeout(() => {
        chrome.runtime.sendMessage({ type: "SIDEBAR_CONTEXT", text: info.selectionText, mode }).catch(() => { });
    }, 350);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "OPEN_SIDEBAR") {
        const tabId = sender.tab?.id;
        chrome.sidePanel.open({ tabId }).then(() => {
            setTimeout(() => {
                chrome.runtime.sendMessage({ type: "SIDEBAR_CONTEXT", text: message.text, mode: message.mode }).catch(() => { });
            }, 350);
            sendResponse({ success: true });
        }).catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (message.type === "GENERATE_PROMPT") {
        handleGenerate(message.payload)
            .then((data) => sendResponse({ success: true, data }))
            .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (message.type === "GET_AUTH_TOKEN") {
        chrome.storage.local.get("authToken", (d) => sendResponse({ token: d.authToken || null }));
        return true;
    }

    if (message.type === "SAVE_CONSENT") {
        chrome.storage.local.get("settings", (d) => {
            chrome.storage.local.set({ settings: { ...d.settings, consentGiven: true, consentDate: new Date().toISOString() } });
        });
        sendResponse({ success: true });
        return true;
    }

    if (message.type === "OPEN_OPTIONS") {
        chrome.runtime.openOptionsPage();
        return true;
    }
});

async function handleGenerate({ text, model, category, mode, token }) {
    const response = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ userRequest: text, targetModel: model || "chatgpt", category: category || "general" }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
}
