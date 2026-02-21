// options.js — Antigravity Options v2
document.addEventListener("DOMContentLoaded", async () => {
    const { settings } = await chrome.storage.local.get("settings");
    if (settings) {
        document.getElementById("opt-model").value = settings.defaultModel || "chatgpt";
        document.getElementById("opt-category").value = settings.defaultCategory || "general";
        document.getElementById("opt-inline").checked = settings.showInlineIcon !== false;
        if (settings.consentGiven) {
            const btn = document.getElementById("consent-btn");
            btn.textContent = "✓ Onay Verildi";
            btn.classList.add("accepted");
            if (settings.consentDate) {
                const dateEl = document.getElementById("consent-date");
                dateEl.style.display = "block";
                dateEl.textContent = `Onay tarihi: ${new Date(settings.consentDate).toLocaleDateString("tr-TR")}`;
            }
        }
    }

    document.getElementById("consent-btn").addEventListener("click", async () => {
        const { settings: s } = await chrome.storage.local.get("settings");
        if (s?.consentGiven) return;
        const updated = { ...s, consentGiven: true, consentDate: new Date().toISOString() };
        await chrome.storage.local.set({ settings: updated });
        const btn = document.getElementById("consent-btn");
        btn.textContent = "✓ Onay Verildi";
        btn.classList.add("accepted");
        const dateEl = document.getElementById("consent-date");
        dateEl.style.display = "block";
        dateEl.textContent = `Onay tarihi: ${new Date().toLocaleDateString("tr-TR")}`;
    });

    document.getElementById("opt-model").addEventListener("change", (e) => saveSettings({ defaultModel: e.target.value }));
    document.getElementById("opt-category").addEventListener("change", (e) => saveSettings({ defaultCategory: e.target.value }));
    document.getElementById("opt-inline").addEventListener("change", (e) => saveSettings({ showInlineIcon: e.target.checked }));

    document.getElementById("privacy-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: chrome.runtime.getURL("privacy/privacy-policy.html") });
    });
});

async function saveSettings(partial) {
    const { settings } = await chrome.storage.local.get("settings");
    await chrome.storage.local.set({ settings: { ...settings, ...partial } });
}
