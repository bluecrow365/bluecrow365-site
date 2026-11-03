// お問い合わせフォームを /api/contact (src/worker.js) へ送る。
// 項目名 name / email / message は Worker 側と揃えること。
(() => {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const btn = form.querySelector('[type=submit]');
  const ok = form.querySelector('.form-ok');
  const err = form.querySelector('.form-err');
  const label = btn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    ok.hidden = true;
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = '送信しています…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      ok.hidden = false;
      btn.textContent = '送信しました';
    } catch {
      err.hidden = false;
      btn.disabled = false;
      btn.textContent = label;
    }
  });
})();
