document.addEventListener('DOMContentLoaded', () => {
    const appUrlInput = document.getElementById('appUrl');
    const tokenInput = document.getElementById('supaToken');
    const saveBtn = document.getElementById('save');
    const status = document.getElementById('status');

    chrome.storage.sync.get(['APP_URL', 'SUPABASE_ACCESS_TOKEN'], (items) => {
        if (items.APP_URL) appUrlInput.value = items.APP_URL;
        if (items.SUPABASE_ACCESS_TOKEN) tokenInput.value = items.SUPABASE_ACCESS_TOKEN;
    });

    saveBtn.addEventListener('click', () => {
        const APP_URL = appUrlInput.value.replace(/\/$/, ''); // Remove trailing slash
        const SUPABASE_ACCESS_TOKEN = tokenInput.value;

        chrome.storage.sync.set({ APP_URL, SUPABASE_ACCESS_TOKEN }, () => {
            status.textContent = 'Options saved.';
            setTimeout(() => status.textContent = '', 2000);
        });
    });
});
