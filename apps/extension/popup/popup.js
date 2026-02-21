// popup.js
document.getElementById("open-btn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.sidePanel.open({ tabId: tab.id });
    window.close();
});
document.getElementById("settings-btn").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
    window.close();
});
