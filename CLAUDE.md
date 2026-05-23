# BlueCrow365 — bluecrow365.com

AI を活用した (1) ホームページ制作 (2) 業務効率化アプリ開発 (3) AI活用サービス を提供する
自社サイト。静的 HTML/CSS/JS の 3 ファイル構成。

## 構成

- `index.html` — 全セクション (Hero / Services / Why / CTA / Footer) を含む単一ページ
- `styles.css` — メインスタイル。`:root` にデザイントークン集約
- `script.js` — ヘッダースクロール検出 + IntersectionObserver によるフェードイン

フレームワーク・ビルドプロセス不使用。npm も package.json も置かない方針。

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
- `--blue: #0052FF` / `--cyan: #00D4FF` — ブランドカラー
- `--grad` — 上記2色の135°グラデーション。テキスト・アイコン・アクセント帯で使用
- `--ink: #0A1628` — 主要テキスト・ダーク背景
- `--ink-soft` / `--muted` — 副次テキスト

新色を追加するときも `:root` に集約し、各セレクタにハードコードしない。

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

`/samples/` 配下に営業用試作 HP を置く。デプロイ先は `bluecrow365.com/samples/<案件slug>/`。

- 1案件 = 1サブディレクトリ (kebab-case, 例: `samples/nagomi-neko/`)
- 各案件ディレクトリは独立した静的サイト (index.html / styles.css / 画像)
- 本体サイトと CSS を共有しないこと (営業先ごとにトーンを変える前提)
- 公開前段階のものは `samples/_drafts/` に置く (robots.txt で除外済み)
- Works セクションに掲載するときは、お客様の承諾を得てから実名を出すこと

## セキュリティ / SEO

- `_headers` で CSP / HSTS / X-Frame-Options 等を Cloudflare Pages に投入
- 外部スクリプト追加時は CSP の `script-src` を更新する
- メールアドレスは `js-mail` クラス + `data-user` / `data-domain` で難読化 (`script.js` で組み立て)。`<noscript>` フォールバックあり
- OGP 画像 (`og-image.svg`) は SVG。X (Twitter) で確実にプレビューを出したい場合は PNG (1200x630) を別途用意して `og:image` を差し替える
