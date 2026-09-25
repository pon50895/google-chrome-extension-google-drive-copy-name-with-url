// node test.js — 用假 DOM 跑 content.js,驗證剪貼簿改寫邏輯
const vm = require('vm'), assert = require('assert');
let written, copyHandler;
const txt = (t) => ({ nodeType: 3, textContent: t });
const el = (...childNodes) => ({ nodeType: 1, childNodes });
// 模擬 Drive 的列:名稱後面跟著類型標籤「PDF」(innerText 會變成「名稱 PDF」)
const rows = { AAAAAAAAAAAA1: el(el(txt('  ')), el(txt('會議記錄_2026-01.pdf'), el(txt('PDF'))), el(txt('凌晨1:54 我'))) };
let dialogs = [];
const ctx = {
  CSS: { escape: (s) => s },
  location: { href: 'https://drive.google.com/drive/u/0/folders/FFFFFFFFFFFF1' },
  document: {
    title: '專案資料夾 - Google 雲端硬碟',
    querySelectorAll: () => dialogs,
    querySelector: (q) => { const id = q.match(/"(.+)"/)[1]; return rows[id] && { ...rows[id], querySelector: () => null }; },
  },
  navigator: { clipboard: { writeText: (t) => { written = t; return Promise.resolve(); } } },
  window: { addEventListener: (_, h) => { copyHandler = h; } },
  getSelection: () => '',
};
vm.runInNewContext(require('fs').readFileSync(__dirname + '/content.js', 'utf8'), ctx);
const clip = ctx.navigator.clipboard;

clip.writeText('https://drive.google.com/file/d/AAAAAAAAAAAA1/view?usp=sharing');
assert.strictEqual(written, '會議記錄_2026-01.pdf\nhttps://drive.google.com/file/d/AAAAAAAAAAAA1/view?usp=sharing');

clip.writeText('https://drive.google.com/drive/folders/FFFFFFFFFFFF1?usp=sharing');
assert.strictEqual(written, '專案資料夾\nhttps://drive.google.com/drive/folders/FFFFFFFFFFFF1?usp=sharing');

dialogs = [{ innerText: '共用「報告.pdf」\n新增使用者' }];
clip.writeText('https://drive.google.com/file/d/ZZZZZZZZZZZZ9/view');
assert.strictEqual(written, '報告.pdf\nhttps://drive.google.com/file/d/ZZZZZZZZZZZZ9/view');
dialogs = [];

clip.writeText('hello'); assert.strictEqual(written, 'hello');               // 非網址不動
clip.writeText('https://drive.google.com/file/d/UNKNOWNUNKNOWN/view');       // 找不到名稱 → 原樣
assert.strictEqual(written, 'https://drive.google.com/file/d/UNKNOWNUNKNOWN/view');

let set, prevented;
copyHandler({ clipboardData: { getData: () => 'https://drive.google.com/file/d/AAAAAAAAAAAA1/view', setData: (_, t) => { set = t; } }, preventDefault: () => { prevented = true; } });
assert.ok(prevented && set.startsWith('會議記錄_2026-01.pdf\n'));
// 抓名稱時丟例外 → 原網址照常複製,不能讓複製失敗
ctx.console = { warn: () => {} };
const bad = 'https://drive.google.com/file/d/AAAAAAAAAAAA1/view';
const saved = ctx.document.querySelector;
ctx.document.querySelector = () => { throw new Error('boom'); };
clip.writeText(bad); assert.strictEqual(written, bad);
ctx.document.querySelector = saved;
console.log('all ok');
