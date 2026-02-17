// options.js
document.addEventListener("DOMContentLoaded", async () => {
    const { settings } = await chrome.storage.local.get("settings");
    if (!settings) return;

    if (settings.consentGiven) {
        document.getElementById("consent-checkbox").checked = true;
        const acceptedEl = document.getElementById("consent-accepted");
        acceptedEl.style.display = "block";
        document.getElementById("consent-date").textContent = new Date(
            settings.consentDate
        ).toLocaleDateString("tr-TR");
    }

    document.getElementById("floating-btn-toggle").checked =
        settings.showFloatingButton ?? true;
    document.getElementById("auto-detect-toggle").checked =
        settings.autoDetectPlatform ?? true;
    document.getElementById("default-model").value =
        settings.defaultModel || "gpt-4o-mini";
    document.getElementById("default-category").value =
        settings.defaultCategory || "general";
});

document.getElementById("save-btn").addEventListener("click", async () => {
    const { settings } = await chrome.storage.local.get("settings");
    const consentChecked = document.getElementById("consent-checkbox").checked;

    const newSettings = {
        ...settings,
        showFloatingButton: document.getElementById("floating-btn-toggle").checked,
        autoDetectPlatform: document.getElementById("auto-detect-toggle").checked,
        defaultModel: document.getElementById("default-model").value,
        defaultCategory: document.getElementById("default-category").value,
        consentGiven: consentChecked,
        consentDate: consentChecked
            ? settings?.consentDate || new Date().toISOString()
            : null,
    };

    await chrome.storage.local.set({ settings: newSettings });

    const saveStatus = document.getElementById("save-status");
    saveStatus.style.display = "block";
    setTimeout(() => (saveStatus.style.display = "none"), 2500);

    if (consentChecked) {
        const accepted = document.getElementById("consent-accepted");
        accepted.style.display = "block";
        document.getElementById("consent-date").textContent = new Date(
            newSettings.consentDate
        ).toLocaleDateString("tr-TR");
    }
});
