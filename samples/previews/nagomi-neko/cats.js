/* ===========================================================
   画面上を歩く・走る・寝る小さい猫アニメーション
   ===========================================================
   - 複数の猫が画面下部を中心にうろうろする
   - 状態: walk / run / sleep をランダムに切り替える
   - 移動は requestAnimationFrame で滑らかに
   =========================================================== */

(() => {
  const playground = document.getElementById('cat-playground');
  if (!playground) return;

  // 猫の毛色バリエーション（和み猫の子たちをイメージ）
  const COAT_COLORS = [
    { body: '#f4d4a8', stripe: '#c9a577', name: 'cream'  }, // クリーム
    { body: '#9b8579', stripe: '#5e4f44', name: 'brown'  }, // 茶白
    { body: '#3a3530', stripe: '#1a1815', name: 'black'  }, // 黒
    { body: '#ffffff', stripe: '#c98787', name: 'calico' }, // 三毛
    { body: '#d9d4cc', stripe: '#8a8278', name: 'gray'   }, // グレー
  ];

  /* ---------- SVGテンプレート ----------
     胴体・脚4本・しっぽ・耳・目を別パスに分けて
     CSSアニメで動かせる構造にしてある。 */
  function createCatSVG(color) {
    return `
      <svg viewBox="0 0 56 40" xmlns="http://www.w3.org/2000/svg">
        <!-- しっぽ -->
        <g class="tail" style="transform-box: fill-box;">
          <path d="M44,22 C50,18 54,20 54,14"
                fill="none" stroke="${color.body}" stroke-width="4"
                stroke-linecap="round"/>
        </g>

        <!-- 後ろ脚 -->
        <rect class="leg-bl" x="36" y="26" width="4" height="10" rx="2" fill="${color.stripe}" style="transform-box: fill-box;"/>
        <rect class="leg-br" x="42" y="26" width="4" height="10" rx="2" fill="${color.stripe}" style="transform-box: fill-box;"/>

        <!-- 前脚 -->
        <rect class="leg-fl" x="14" y="26" width="4" height="10" rx="2" fill="${color.stripe}" style="transform-box: fill-box;"/>
        <rect class="leg-fr" x="20" y="26" width="4" height="10" rx="2" fill="${color.stripe}" style="transform-box: fill-box;"/>

        <!-- 胴体 -->
        <g class="body" style="transform-box: fill-box;">
          <ellipse cx="28" cy="24" rx="18" ry="9" fill="${color.body}"/>
          <!-- 縞模様 -->
          <path d="M22,17 Q24,22 22,28" stroke="${color.stripe}" stroke-width="1.2" fill="none" opacity="0.6"/>
          <path d="M30,16 Q32,22 30,29" stroke="${color.stripe}" stroke-width="1.2" fill="none" opacity="0.6"/>
          <path d="M38,17 Q40,22 38,28" stroke="${color.stripe}" stroke-width="1.2" fill="none" opacity="0.6"/>
        </g>

        <!-- 頭 -->
        <g class="head">
          <!-- 耳 -->
          <polygon points="6,16 10,8 14,16" fill="${color.body}"/>
          <polygon points="8,14 10,10 12,14" fill="${color.stripe}" opacity="0.7"/>
          <polygon points="16,14 19,7 22,14" fill="${color.body}"/>
          <polygon points="18,12 19,9 20,12" fill="${color.stripe}" opacity="0.7"/>
          <!-- 顔 -->
          <circle cx="13" cy="20" r="9" fill="${color.body}"/>
          <!-- 目（開） -->
          <circle class="eye-open" cx="10" cy="20" r="1.4" fill="#1e1612"/>
          <circle class="eye-open" cx="16" cy="20" r="1.4" fill="#1e1612"/>
          <!-- 目（閉） -->
          <path class="eye-closed" d="M8.5,20 Q10,21.5 11.5,20" stroke="#1e1612" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          <path class="eye-closed" d="M14.5,20 Q16,21.5 17.5,20" stroke="#1e1612" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          <!-- 鼻と口 -->
          <path d="M13,22 L12,23 M13,22 L14,23" stroke="#9a5a4a" stroke-width="0.8" stroke-linecap="round"/>
          <circle cx="13" cy="22" r="0.9" fill="#e08a7a"/>
          <!-- ひげ -->
          <line x1="4"  y1="22" x2="9"  y2="22.5" stroke="#aaa" stroke-width="0.4"/>
          <line x1="4"  y1="24" x2="9"  y2="23.5" stroke="#aaa" stroke-width="0.4"/>
          <line x1="17" y1="22.5" x2="22" y2="22" stroke="#aaa" stroke-width="0.4"/>
          <line x1="17" y1="23.5" x2="22" y2="24" stroke="#aaa" stroke-width="0.4"/>
        </g>
      </svg>
      <span class="zzz">Z</span>
    `;
  }

  /* ---------- 猫1匹を表すクラス ---------- */
  class Cat {
    constructor() {
      this.el = document.createElement('div');
      this.el.className = 'tiny-cat';
      const color = COAT_COLORS[Math.floor(Math.random() * COAT_COLORS.length)];
      this.el.innerHTML = createCatSVG(color);
      playground.appendChild(this.el);

      // 初期位置: 画面下寄り
      this.x = Math.random() * (window.innerWidth - 60);
      this.y = window.innerHeight - 80 - Math.random() * 60;
      this.targetX = this.x;
      this.targetY = this.y;
      // SVGはデフォルトで頭が左側にある = 左向き。flipクラスで右向きになる。
      this.facingLeft = true;

      this.state = 'walk';
      this.setState('walk');
      this.pickNewTarget();
      this.stateTimer = 0;
      this.nextStateChange = this.randomStateDuration();
      this.applyTransform();
    }

    setState(state) {
      this.state = state;
      this.el.classList.remove('walk', 'run', 'sleep');
      this.el.classList.add(state);
    }

    randomStateDuration() {
      // 状態の継続時間（ms）
      if (this.state === 'sleep') return 4000 + Math.random() * 6000;
      if (this.state === 'run')   return 1500 + Math.random() * 2500;
      return 3000 + Math.random() * 4000; // walk
    }

    pickNewTarget() {
      // 画面の下半分を回遊
      const margin = 40;
      this.targetX = margin + Math.random() * (window.innerWidth - margin * 2);
      this.targetY = window.innerHeight * 0.55 + Math.random() * (window.innerHeight * 0.35);
    }

    pickNewState() {
      // 状態遷移の確率
      const r = Math.random();
      let next;
      if (r < 0.55)      next = 'walk';
      else if (r < 0.8)  next = 'sleep';
      else               next = 'run';

      // 寝てた直後はちょっと走らないように緩和
      if (this.state === 'sleep' && next === 'run' && Math.random() < 0.5) next = 'walk';

      this.setState(next);
      if (next !== 'sleep') this.pickNewTarget();
      this.stateTimer = 0;
      this.nextStateChange = this.randomStateDuration();
    }

    applyTransform() {
      // 右向き（facingLeft=false）のときに flip クラスを付けてSVGを反転
      this.el.classList.toggle('flip', !this.facingLeft);
      this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    update(dt) {
      this.stateTimer += dt;
      if (this.stateTimer >= this.nextStateChange) {
        this.pickNewState();
      }

      if (this.state === 'sleep') {
        // 寝てるときは動かない
        return;
      }

      const speed = this.state === 'run' ? 0.18 : 0.06; // px/ms
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 4) {
        // 到着したら次の目的地
        this.pickNewTarget();
        return;
      }

      const mx = (dx / dist) * speed * dt;
      const my = (dy / dist) * speed * dt;
      this.x += mx;
      this.y += my;

      // 向き: 左へ動いていたら反転
      if (mx < -0.05) this.facingLeft = true;
      else if (mx > 0.05) this.facingLeft = false;

      this.applyTransform();
    }
  }

  /* ---------- 全体のループ ---------- */
  const NUM_CATS = 4; // 同時に画面にいる猫の数
  const cats = [];
  for (let i = 0; i < NUM_CATS; i++) cats.push(new Cat());

  let lastTime = performance.now();
  function tick(now) {
    const dt = Math.min(now - lastTime, 50); // 大きすぎるdtはクリップ
    lastTime = now;
    for (const cat of cats) cat.update(dt);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // 画面リサイズ時、画面外に出ないように引き戻す
  window.addEventListener('resize', () => {
    for (const cat of cats) {
      cat.x = Math.min(cat.x, window.innerWidth  - 60);
      cat.y = Math.min(cat.y, window.innerHeight - 60);
      cat.pickNewTarget();
    }
  });
})();
