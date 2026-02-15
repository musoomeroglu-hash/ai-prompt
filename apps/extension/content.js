(async function () {
    const { APP_URL, SUPABASE_ACCESS_TOKEN } = await chrome.storage.sync.get(['APP_URL', 'SUPABASE_ACCESS_TOKEN']);

    if (!APP_URL || !SUPABASE_ACCESS_TOKEN) {
        console.log('AI Prompt App: Not configured.');
        return;
    }

    function findTextarea() {
        // Attempt multiple strategies
        const selectors = [
            'textarea', // Generic
            'div[contenteditable="true"]', // Rich text editors
            '[role="textbox"]'
        ];

        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && isTargetContainer(el)) return el;
        }
        return null;
    }

    function isTargetContainer(el) {
        // Avoid small inputs, search boxes, etc.
        if (el.offsetHeight < 40) return false;
        // Don't inject if already injected
        if (el.parentElement.querySelector('.ai-prompt-improve-btn')) return false;
        return true;
    }

    function injectButton(textarea) {
        if (!textarea) return;

        const btn = document.createElement('button');
        btn.className = 'ai-prompt-improve-btn';
        btn.textContent = '✨ Improve';
        btn.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 60px; /* Adjust based on site UI */
      z-index: 9999;
      background: #0070f3;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.2s;
    `;

        btn.onmouseover = () => btn.style.opacity = '1';
        btn.onmouseout = () => btn.style.opacity = '0.8';

        // Container needs positioning context
        const parent = textarea.parentElement;
        if (getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
        }

        parent.appendChild(btn);

        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const originalText = textarea.value || textarea.innerText;
            if (!originalText) return alert('Enter some text first!');

            btn.textContent = 'Improving...';
            btn.disabled = true;

            try {
                const response = await fetch(`${APP_URL}/api/extension/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
                    },
                    body: JSON.stringify({
                        category: 'prompt_improve',
                        tone: 'Professional',
                        userRequest: originalText,
                        targetModel: 'gemini'
                    })
                });

                const data = await response.json();

                if (!response.ok) throw new Error(data.error || 'Failed');

                const improvedText = data.result.short; // Use short version for inline replacement

                if (textarea.tagName === 'TEXTAREA') {
                    textarea.value = improvedText;
                } else {
                    textarea.innerText = improvedText;
                }

                // Trigger input event for frameworks (React/Vue)
                textarea.dispatchEvent(new Event('input', { bubbles: true }));

            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                btn.textContent = '✨ Improve';
                btn.disabled = false;
            }
        });
    }

    // Observer to handle SPA navigation
    const observer = new MutationObserver(() => {
        const textarea = findTextarea();
        // Only inject if not already injected (checked in findTextarea -> isTargetContainer logic issue?)
        // Actually needed a better check in findTextarea
        if (textarea && !textarea.parentElement.querySelector('.ai-prompt-improve-btn')) {
            injectButton(textarea);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check
    setTimeout(() => {
        const textarea = findTextarea();
        if (textarea) injectButton(textarea);
    }, 2000);

})();
