// メールアドレスを JS で組み立て（ボットスクレイピング対策）
document.querySelectorAll('.js-mail').forEach(el => {
  const addr = el.dataset.user + '@' + el.dataset.domain;
  el.href = 'mailto:' + addr;
  el.textContent = addr;
});

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
