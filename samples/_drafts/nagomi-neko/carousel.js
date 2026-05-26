/* スタッフカードの写真カルーセル
   - 各 .staff-photo 内の <img> を一定間隔でフェード切替
   - 1枚しかないカードは何もしない
*/
(() => {
  const INTERVAL = 3800; // ms

  document.querySelectorAll('.staff-photo').forEach((photo, cardIdx) => {
    const imgs = photo.querySelectorAll('img');
    if (imgs.length <= 1) return;

    let current = 0;
    // カード毎に位相をずらして同時切替を避ける
    const offset = cardIdx * 800;

    setTimeout(() => {
      setInterval(() => {
        imgs[current].classList.remove('active');
        current = (current + 1) % imgs.length;
        imgs[current].classList.add('active');
      }, INTERVAL);
    }, offset);
  });
})();
