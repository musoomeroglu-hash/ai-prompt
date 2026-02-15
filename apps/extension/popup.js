document.addEventListener('DOMContentLoaded', async () => {
  const { APP_URL, SUPABASE_ACCESS_TOKEN } = await chrome.storage.sync.get(['APP_URL', 'SUPABASE_ACCESS_TOKEN']);

  if (!APP_URL || !SUPABASE_ACCESS_TOKEN) {
    document.getElementById('auth-check').classList.remove('hidden');
    document.getElementById('main-ui').classList.add('hidden');
  } else {
    document.getElementById('auth-check').classList.add('hidden');
    document.getElementById('main-ui').classList.remove('hidden');
  }

  document.getElementById('open-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  const getSelectedBtn = document.getElementById('get-selected');
  const generateBtn = document.getElementById('generate');
  const requestInput = document.getElementById('request');
  const resultsDiv = document.getElementById('results');

  getSelectedBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Execute script to get selection
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => window.getSelection().toString()
    }, (results) => {
      if (results && results[0] && results[0].result) {
        requestInput.value = results[0].result;
      }
    });
  });

  generateBtn.addEventListener('click', async () => {
    const category = document.getElementById('category').value;
    const tone = document.getElementById('tone').value;
    const userRequest = requestInput.value;

    if (!userRequest) return alert('Please enter a request');

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    resultsDiv.innerHTML = '';

    try {
      const response = await fetch(`${APP_URL}/api/extension/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          category,
          tone,
          userRequest,
          targetModel: 'gemini' // Default
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      const result = data.result; // Expecting { short, detailed, creative }

      renderResultCard('Short', result.short);
      renderResultCard('Detailed', result.detailed);
      renderResultCard('Creative', result.creative);

    } catch (error) {
      resultsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate';
    }
  });

  function renderResultCard(title, content) {
    if (!content) return;
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <h3>${title}</h3>
      <p>${content}</p>
      <button class="copy-btn">Copy</button>
    `;

    card.querySelector('.copy-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(content);
      const btn = card.querySelector('.copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });

    resultsDiv.appendChild(card);
  }
});
