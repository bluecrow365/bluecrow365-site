// メールアドレスを JS で組み立て（ボットスクレイピング対策）
// data-show-addr 属性がある要素のみ textContent も書き換える
document.querySelectorAll('.js-mail').forEach(el => {
  const addr = el.dataset.user + '@' + el.dataset.domain;
  el.href = 'mailto:' + addr;
  if (el.dataset.showAddr != null) el.textContent = addr;
});

// お問い合わせフォーム（Formspree）
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn    = contactForm.querySelector('.form-submit');
    const ok     = contactForm.querySelector('.form-success');
    const err    = contactForm.querySelector('.form-error');
    ok.hidden = true;
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = '送信中…';
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        ok.hidden = false;
        contactForm.reset();
        btn.textContent = '送信しました ✓';
      } else {
        throw new Error();
      }
    } catch {
      err.hidden = false;
      btn.disabled = false;
      btn.textContent = '送信する →';
    }
  });
}

// ヘッダーをスクロール時に薄く境界線表示
const header = document.querySelector('.site-header');
const onScroll = () => {
  if (window.scrollY > 8) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// スクロールでフェードイン
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-fade]').forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i * 80, 320)}ms`;
  io.observe(el);
});
