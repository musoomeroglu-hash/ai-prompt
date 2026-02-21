// content.js — Antigravity Content Script v2
let inlineBadge = null;
let actionMenu = null;
let currentSelection = "";
let currentRange = null;
let badgeIdCounter = 0;
let consentToastActive = false;

// METİN SEÇİMİ DİNLE
document.addEventListener("mouseup", async (e) => {
  if (actionMenu?.contains(e.target) || inlineBadge?.contains(e.target)) return;
  removeActionMenu();
  const selection = window.getSelection();
  const text = selection?.toString().trim();
  if (!text || text.length < 3) { removeBadge(); return; }
  const { settings } = await chrome.storage.local.get("settings");
  if (!settings?.showInlineIcon) { removeBadge(); return; }
  currentSelection = text;
  currentRange = selection.getRangeAt(0).cloneRange();
  showInlineBadge(currentRange);
});

document.addEventListener("mousedown", (e) => {
  if (!inlineBadge?.contains(e.target) && !actionMenu?.contains(e.target)) {
    removeBadge();
    removeActionMenu();
  }
});

window.addEventListener("scroll", updatePositions, { passive: true });
window.addEventListener("resize", updatePositions, { passive: true });

// 2. INLINE BADGE — seçimin SAĞ TARAFINDA
function showInlineBadge(range) {
  removeBadge();
  const rect = range.getBoundingClientRect();
  inlineBadge = document.createElement("div");
  inlineBadge.id = "ag-inline-badge";
  inlineBadge.setAttribute("role", "button");
  inlineBadge.setAttribute("tabindex", "0");
  inlineBadge.setAttribute("aria-label", "Antigravity ile Prompt Üret");
  const x = rect.right + window.scrollX + 8;
  const y = rect.top + window.scrollY + rect.height / 2 - 16;
  const gradientId = `ag-g-${++badgeIdCounter}`;
  inlineBadge.style.cssText = `
    position: absolute;
    left: ${Math.min(x, window.scrollX + window.innerWidth - 50)}px;
    top: ${Math.max(window.scrollY + 4, y)}px;
    z-index: 2147483646;
  `;
  inlineBadge.innerHTML = `
    <div class="ag-badge-inner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#${gradientId})"/>
        <defs>
          <linearGradient id="${gradientId}" x1="2" y1="2" x2="22" y2="22">
            <stop offset="0%" stop-color="#6366f1"/>
            <stop offset="100%" stop-color="#a78bfa"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  `;
  document.body.appendChild(inlineBadge);
  requestAnimationFrame(() => inlineBadge.classList.add("ag-badge-visible"));
  inlineBadge.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleActionMenu(currentRange);
  });
  inlineBadge.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleActionMenu(currentRange); }
  });
}

function removeBadge() {
  if (inlineBadge) { inlineBadge.remove(); inlineBadge = null; }
}

// 3. ACTION MENU — seçimin ÜSTÜNDE
function toggleActionMenu(range) {
  if (actionMenu) { removeActionMenu(); return; }
  const rect = range.getBoundingClientRect();
  actionMenu = document.createElement("div");
  actionMenu.id = "ag-action-menu";
  const x = rect.left + window.scrollX + rect.width / 2;
  const y = rect.top + window.scrollY - 8;
  actionMenu.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    z-index: 2147483647;
    transform: translateX(-50%) translateY(-100%);
  `;
  actionMenu.innerHTML = `
    <div class="ag-action-menu-inner">
      <div class="ag-action-arrow"></div>
      <button class="ag-action-btn ag-action-improve" data-mode="improve">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <span>Prompt İyileştir</span>
      </button>
      <div class="ag-action-divider"></div>
      <button class="ag-action-btn ag-action-write" data-mode="write">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Prompt Yaz</span>
      </button>
    </div>
  `;
  document.body.appendChild(actionMenu);
  requestAnimationFrame(() => actionMenu.classList.add("ag-action-menu-visible"));
  actionMenu.querySelectorAll(".ag-action-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault(); e.stopPropagation();
      await openSidebar(currentSelection, btn.dataset.mode);
      removeBadge(); removeActionMenu();
    });
  });
}

function removeActionMenu() {
  if (actionMenu) {
    const menu = actionMenu;
    actionMenu = null;
    menu.classList.remove("ag-action-menu-visible");
    setTimeout(() => menu.remove(), 180);
  }
}

// 4. SIDEBAR AÇMA
async function openSidebar(text, mode) {
  const { settings } = await chrome.storage.local.get("settings");
  if (!settings?.consentGiven) { showConsentToast(); return; }
  chrome.runtime.sendMessage({ type: "OPEN_SIDEBAR", text, mode }).catch(() => { });
}

// 5. YERİM GÜNCELLEME
function updatePositions() {
  if (!currentRange) return;
  try {
    const rect = currentRange.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      removeBadge(); removeActionMenu(); currentRange = null;
      return;
    }
    if (inlineBadge) {
      inlineBadge.style.left = `${Math.min(rect.right + window.scrollX + 8, window.scrollX + window.innerWidth - 50)}px`;
      inlineBadge.style.top = `${Math.max(window.scrollY + 4, rect.top + window.scrollY + rect.height / 2 - 16)}px`;
    }
    if (actionMenu) {
      actionMenu.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
      actionMenu.style.top = `${rect.top + window.scrollY - 8}px`;
    }
  } catch (e) {
    removeBadge(); removeActionMenu(); currentRange = null;
  }
}

// 6. CONSENT TOAST
function showConsentToast() {
  if (consentToastActive) return;
  consentToastActive = true;
  const toast = document.createElement("div");
  toast.id = "ag-consent-toast";
  toast.innerHTML = `
    <div class="ag-toast-inner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#6366f1" stroke-width="2"/>
        <path d="M12 8v4m0 4h.01" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>Antigravity kullanmak için KVKK onayı verin.</span>
      <button id="ag-open-opts">Ayarları Aç</button>
    </div>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("ag-toast-visible"));
  document.getElementById("ag-open-opts")?.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_OPTIONS" });
    toast.remove();
    consentToastActive = false;
  });
  setTimeout(() => {
    toast.classList.remove("ag-toast-visible");
    setTimeout(() => { toast.remove(); consentToastActive = false; }, 300);
  }, 4000);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_CONSENT") showConsentToast();
});
