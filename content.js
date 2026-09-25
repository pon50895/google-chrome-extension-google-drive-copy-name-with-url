// 在 Drive 頁面(MAIN world)攔截「複製連結」,把剪貼簿內容改成「名稱\n網址」。
// Drive 可能走 navigator.clipboard.writeText 或 execCommand('copy'),兩條都接。
(() => {
  const URL_RE = /^https:\/\/(drive|docs)\.google\.com\/\S+$/;

  const idOf = (url) => (url.match(/\/(?:d|folders)\/([\w-]{10,})/) || url.match(/[?&]id=([\w-]{10,})/) || [])[1];

  // 列裡第一個非空文字節點就是名稱;用 innerText 會把後面的類型標籤(例如「PDF」)一起抓進來
  const firstText = (el) => {
    for (const c of el.childNodes || []) {
      const t = c.nodeType === 3 ? c.textContent.trim() : firstText(c);
      if (t) return t;
    }
    return '';
  };

  // ponytail: 靠 Drive 的 DOM 猜名稱,Google 改版可能失效;失效時只是退回原網址,不會壞剪貼簿
  function nameOf(url) {
    const id = idOf(url);
    // 1. 共用對話框標題:共用「xxx」/ Share "xxx"
    for (const d of document.querySelectorAll('[role="dialog"]')) {
      const m = (d.innerText || '').match(/[「"“]([^」"”\n]+)[」"”]/);
      if (m) return m[1];
    }
    if (!id) return null;
    // 2. 檔案列表中的該列(data-id = 檔案 ID)
    const row = document.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (row) {
      const n = row.querySelector('[data-tooltip]')?.getAttribute('data-tooltip') || firstText(row);
      if (n) return n;
    }
    // 3. 目前所在資料夾 / 開著的檔案本身:用分頁標題
    if (location.href.includes(id)) return document.title.replace(/\s+-\s+Google[^-]*$/, '').trim();
    return null;
  }

  // 多選時 Drive 會一次複製多行網址,每行各自轉換
  function transform(text) {
    try { return transformUnsafe(text); } catch (e) {
      console.warn('[drive-copy-name] 抓名稱失敗,改回原網址', e);
      return null;
    }
  }

  function transformUnsafe(text) {
    const lines = (text || '').trim().split(/\s*\n\s*/);
    if (!lines[0] || !lines.every((l) => URL_RE.test(l))) return null;
    const out = lines.map((u) => { const n = nameOf(u); return n ? `${n}\n${u}` : u; });
    return out.join('\n\n') === lines.join('\n\n') ? null : out.join('\n\n');
  }

  const clip = navigator.clipboard;
  const origWriteText = clip.writeText.bind(clip);
  clip.writeText = (t) => origWriteText(transform(t) ?? t);

  // 最後一個跑(window bubble),才能蓋過 Drive 自己在 copy 事件裡 setData 的內容
  window.addEventListener('copy', (e) => {
    const a = document.activeElement;
    const sel = e.clipboardData.getData('text/plain') ||
      (a && 'value' in a ? a.value.slice(a.selectionStart, a.selectionEnd) : String(getSelection()));
    const t = transform(sel);
    if (!t) return;
    e.clipboardData.setData('text/plain', t);
    e.preventDefault();
  });
})();
