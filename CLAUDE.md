# bluecrow Studio — blue-crow365.com

**自社Androidアプリの紹介**を主役に、あわせて (1) ホームページ制作 (2) 業務効率化アプリ開発
(3) AI活用サービス の受託相談も受ける自社サイト。静的 HTML/CSS/JS 構成。

サイト名は **bluecrow Studio**（Google Play のデベロッパー名もこれに揃える方針。2026-07-27決定）。
旧称「BlueCrow365」表記は使わない。ドメインは **blue-crow365.com**（ハイフンあり）。
`bluecrow365.com`（ハイフンなし）は誤りなので canonical / OGP / JSON-LD に書かないこと。

## 構成

- `index.html` — 単一ページ。セクション順は
  Hero / About / **Apps** / Services / Process / Mindset / Contact / Footer
- `styles.css` — メインスタイル。`:root` にデザイントークン集約
- `script.js` — ヘッダースクロール検出 + IntersectionObserver によるフェードイン
- `app-ads.txt` — AdMob 用（`pub-3979308420686542`）。Play の「ウェブサイト」欄に
  このドメインを入れると AdMob がここをクロールする。**消さないこと**
- `privacy/` — アプリのプライバシーポリシー
  - `nennrei.html` — 年齢表アプリ（日英1ページ）。Play Console に登録するURLはこれ
  - `policy.css` — ポリシー専用スタイル（本体 `styles.css` とは独立）
  - スラパズ！のポリシーは `bluecrow365.github.io/privacy.html` に置いたまま外部リンクしている
    （Play に登録済みのURLを動かさない方針。2026-08 に製品版公開されたあとも同じ）

フレームワーク・ビルドプロセス不使用。npm も package.json も置かない方針。

## Apps セクションの扱い

- 既存の `.works` グリッド + `.work-card` を流用している（アプリ用の専用CSSは作っていない）
- カード内のリンクは `.work-links`、補足行は `.work-meta`（`styles.css` の works ブロック内に定義）
- スラパズ！のサムネイルに**水着ステージ・ご褒美画像は使わない**
  （ゲーム側の `release_checklist_policy.md` の方針と、B2B受託ページとしての体裁の両方から）
- アプリアイコン画像は `assets/apps/` に置く（CSP が `img-src 'self' data:` なので外部URL不可）。
  サムネイルに出すときは `.work-thumb-app` を使う（グラデ背景の中央に角丸＋影で配置）。
  Play用の512pxをそのまま入れると重いので、写真調のものは256pxのJPEGに落とす

## プレビュー / デプロイ

```bash
# ローカルプレビュー (ブラウザで index.html を開くだけで動く)
start index.html

# 簡易サーバが必要な場合
python -m http.server 8000
```

想定ホスティングは **Cloudflare Pages**。リポジトリ連携で `/` をそのまま公開。

## デザイン規約

### カラートークン (`styles.css` の `:root`)
- `--blue: #0052FF` / `--cyan: #00D4FF` — ブランドカラー。**面の塗り専用**でダークでも変えない
- `--grad` — 上記2色の135°グラデーション。テキスト・アイコン・アクセント帯で使用
- `--blue-text` — **文字として置く青**。`--blue` はダーク時にコントラスト不足なので、
  リンク・Eyebrow・ラベル等は必ずこちらを使う（ダーク時だけ `#7AB0FF` に切り替わる）
- `--ink: #0A1628` — 主要テキスト**専用**。ダーク時は明色に反転する
- `--surface-dark` — 「濃紺を**背景として**使う」面（btn-primary / nav-cta / card-feature / cta /
  work-thumb-dark）。`--ink` と兼用しないこと。兼用するとダーク反転で文字と背景が同時に裏返って壊れる
- `--ink-fixed` — 反転しない濃紺。白い面の上に置く文字用（例: `.cta .btn-primary`）
- `--ink-soft` / `--muted` — 副次テキスト

新色を追加するときも `:root` に集約し、各セレクタにハードコードしない。

### ダークモード
`prefers-color-scheme: dark` に対応済み（`styles.css` / `privacy/policy.css` とも末尾の
DARK MODE ブロック）。**トークンを差し替えるだけ**で全体が追従する設計なので、
`:root` に色を足したらダーク時の値もそこに必ず書くこと。ライト時の値は対応前と1色も変えていない。

- `:root` に `color-scheme: light dark` を宣言済み（Chrome の自動ダーク化に勝手に反転されないため）
- 波形仕切りの SVG は `fill` 属性より CSS が優先されるので、色は
  `.divider-wave-soft / -sand svg path` の CSS 側で決めている。HTML の `fill=` は触らなくてよい
- 確認方法: `styles.css` をコピーして `@media (prefers-color-scheme: dark) {` を
  `@media all {`（ダーク強制）/ `@media (min-width: 999999px) {`（ライト強制）に置換し、
  `python -m http.server` で両方見る。`file://` は Chrome 拡張から開けない

### フェードイン
要素に `data-fade` を付けると、`script.js` の IntersectionObserver が `.in` を付与して
立ち上がる。新規セクションを足すときは `data-fade` を付与するだけでよい。

### アクセシビリティ
`prefers-reduced-motion: reduce` を尊重しているので、新規アニメーションを書くときも
同メディアクエリで打ち消すこと。

## 編集方針

- ミニマル × 青グラデ × 3軸事業ストーリー (HP制作 / 業務効率化 / AI活用) を崩さない
- 外部フレームワーク (React / Tailwind / Vue) は導入しない。素の HTML/CSS/JS を維持
- フォントは Google Fonts の Inter + Noto Sans JP のみ
- コピーは日本語ベース。英語の Eyebrow ラベルはアクセントとして使う

## samples/ ディレクトリ

`/samples/` 配下に営業用試作 HP を置く。デプロイ先は `blue-crow365.com/samples/<案件slug>/`。

- 1案件 = 1サブディレクトリ (kebab-case, 例: `samples/nagomi-neko/`)
- 各案件ディレクトリは独立した静的サイト (index.html / styles.css / 画像)
- 本体サイトと CSS を共有しないこと (営業先ごとにトーンを変える前提)
- 公開前段階のものは `samples/previews/` に置く (robots.txt で除外済み)
- Works セクションに掲載するときは、お客様の承諾を得てから実名を出すこと

## 作業ルール

### 基本方針
- 変更を加える前に、必ず作業計画を提示して確認を取ること
- 一度に大量の変更をせず、小さく段階的に進めること
- 不明点があれば作業を止めて質問すること

### やってはいけないこと
- 指示されていないファイルを勝手に変更しない
- `.env` ファイルを読み取ったり変更したりしない
- テストを勝手にスキップしない
- 運営元・設立経緯・実績が不明な外部サービスを提案しない
- 個人情報（氏名・メールアドレス等）を扱う外部サービスは、信頼性（設立年・運営企業・GDPR/プライバシーポリシーの明確さ）を確認してから提案すること

### コンテキスト管理
- 作業完了後は `/clear` を促すこと
- 長いセッションでは `/compact` を提案すること

## セキュリティ / SEO

- `_headers` で CSP / HSTS / X-Frame-Options 等を Cloudflare Pages に投入
- **CSS/JS を編集したら参照側の `?v=` を必ず上げる**。`_headers` が `/*.css` `/*.js` に
  `max-age=31536000, immutable` を付けているため、クエリを変えないと再訪問者に1年間更新が届かない。
  HTML だけ `max-age=600` で先に更新されるので「新HTML + 旧CSS」で**表示が崩れる**
  (2026-08-25 に `styles.css` で実際に発生)。現在: `styles.css?v=3` / `script.js?v=2` /
  `privacy/policy.css?v=2`。詳細と切り分け方は Obsidian [[immutable-cache-static-site-js]]
- 外部スクリプト追加時は CSP の `script-src` を更新する
- メールアドレスは `js-mail` クラス + `data-user` / `data-domain` で難読化 (`script.js` で組み立て)。`<noscript>` フォールバックあり
- OGP 画像 (`og-image.svg`) は SVG。X (Twitter) で確実にプレビューを出したい場合は PNG (1200x630) を別途用意して `og:image` を差し替える
