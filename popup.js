// "報告 - Google 文件" → "報告"; "a.pdf - Google Drive" → "a.pdf"
const cleanTitle = (t) => t.replace(/\s+-\s+Google[^-]*$/, '').trim();

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
  const out = document.getElementById('out');
  const name = cleanTitle(tab.title || '');
  const url = tab.url;
  // ponytail: plain = "名稱\n網址"; html = 超連結(貼到 Docs/Slack/Gmail 會變成可點的檔名)
  const plain = `${name}\n${url}`;
  const html = `<a href="${esc(url)}">${esc(name)}</a>`;
  try {
    await navigator.clipboard.write([new ClipboardItem({
      'text/plain': new Blob([plain], { type: 'text/plain' }),
      'text/html': new Blob([html], { type: 'text/html' }),
    })]);
    out.textContent = `✅ 已複製\n${plain}`;
    out.style.whiteSpace = 'pre-wrap';
    setTimeout(() => window.close(), 1200);
  } catch (e) {
    out.textContent = `❌ 複製失敗:${e.message}`;
  }
});
