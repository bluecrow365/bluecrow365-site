# bluecrow Studio — blue-crow365.com

**自社アプリ(主役は年齢表)の紹介**を主役に、あわせて (1) ホームページ制作 (2) 業務効率化アプリ開発
(3) AI活用 の受託相談も小さく受ける自社サイト。静的 HTML/CSS/JS 構成。
2026-11-03 に全面的に作り替えた(それまでは受託3本柱と並べた「やさしい」トーンのページだった)。

サイト名は **bluecrow Studio**（Google Play のデベロッパー名もこれに揃える方針。2026-07-27決定）。
旧称「BlueCrow365」表記は使わない。ドメインは **blue-crow365.com**（ハイフンあり）。
`bluecrow365.com`（ハイフンなし）は誤りなので canonical / OGP / JSON-LD に書かないこと。

## 構成

- `index.html` — 単一ページ。セクション順(id)は
  Hero / 年齢表 `#apps` / 記念日・期限 `#events` / スラパズ！ `#puzzle` / 制作のご相談 `#services` /
  お問い合わせ `#contact` / Footer
  - **`#contact` は消さない・改名しない**。年齢表アプリの「ご意見・ご要望」(`lib/util/feedback.dart`)と
    ko/zh の掲載文、ポリシーのページが `/#contact` を開く。`#apps` `#services` も旧ページからの名残で残している
- `styles.css` — メインスタイル。`:root` にデザイントークン集約
- `script.js` — お問い合わせフォームの送信だけ(`/api/contact`。項目名 name / email / message は
  `src/worker.js` と揃える)。フェードインやスクロール検出は 2026-11 の作り替えで捨てた
- `assets/apps/nennrei-{1,2}.webp` — ヒーローの端末画面。年齢表のストア用スクショ
  (`nennrei/store/assets/screenshots/final/shot_{1,2}.png`)から画面部分 `(102,300,976,1860)` を切り出し幅 520 に縮めたもの
- `app-ads.txt` — AdMob 用（`pub-3979308420686542`）。Play の「ウェブサイト」欄に
  このドメインを入れると AdMob がここをクロールする。**消さないこと**
- `privacy/` — アプリのプライバシーポリシー
  - `nennrei.html` — 年齢表アプリ（日英1ページ）。Play Console に登録するURLはこれ
  - `policy.css` — ポリシー専用スタイル（本体 `styles.css` とは独立）
  - スラパズ！のポリシーは `bluecrow365.github.io/privacy.html` に置いたまま外部リンクしている
    （Play に登録済みのURLを動かさない方針。2026-08 に製品版公開されたあとも同じ）

フレームワーク・ビルドプロセス不使用。npm も package.json も置かない方針。

## Apps セクションの扱い

- 年齢表が主役(ヒーロー・特徴4つ・記念日と期限の節)。位置づけは**家族の誕生日・年齢の管理**で、
  法要(回忌)は補助。終活・弔いアプリの方向に寄せない
- **まだ配信されていない機能を載せない**。記念日・期限の節は年齢表 vc15 の公開(2026-11-03、ユーザー確認)を待ってから出した
- 「記念日・期限」の節の通知とカードは画像ではなく HTML で組んだ表示例。文言は年齢表の
  `app_ja.arb`(`notifyExpiryTitle` / `anniversaryInDays` / `expiryInDays` など)と同じにしてある。
  アプリ側の文言を変えたらここも合わせる
- iPhone 版は「準備中」表記。App Store で公開されたらボタンを足す
- スラパズ！のサムネイルに**水着ステージ・ご褒美画像は使わない**
  （ゲーム側の `release_checklist_policy.md` の方針と、受託ページとしての体裁の両方から）
- アプリの画像は `assets/apps/` に置く（CSP が `img-src 'self' data:` なので外部URL不可）。
  Play用の512pxをそのまま入れると重いので、写真調のものは256pxのJPEG、スクショは WebP に落とす

## プレビュー / デプロイ

```bash
# ローカルプレビュー (ブラウザで index.html を開くだけで動く)
start index.html

# 簡易サーバが必要な場合
python -m http.server 8000
```

想定ホスティングは **Cloudflare Pages**。リポジトリ連携で `/` をそのまま公開。

⚠️ 実体は **Worker with Assets**(`wrangler.toml`)で、`[assets] directory = "."` が**リポジトリ直下を丸ごと配信する**。
2026-10-14 まで `.git/`・`src/worker.js`・この `CLAUDE.md` まで誰でも取得できた。**公開しないファイルを足したら
`.assetsignore` にも足す**こと。デプロイ後は `https://blue-crow365.com/.git/HEAD` が 200 でないことを確かめる。
問い合わせ API は IP ごとに 60 秒 3 回まで(`[[ratelimits]]`)。Workers Logs は有効(`[observability]`)

## デザイン規約

### カラートークン (`styles.css` の `:root`)
2026-11 に鮮やかな `#0052FF` / `#00D4FF` から**落ち着いた青**へ変えた。ユーザーは「もう少し明るく」を
2 回求めたので、`#2F5DA8` 級に暗くするのは不可。逆にこれ以上明るくすると白文字が読めなくなる。

- `--hero: #4A80E0` — ヒーローの面。白文字とのコントラストは **3.85:1 で、AA を満たすのは大きい見出しだけ**。
  上に載る小さい字(説明文・ナビ・注記)は `font-weight: 600` で補っている(承知のうえの判断)
- `--blue: #3A70D6` — ボタン・強調の面。白文字 4.7:1(AA)。**小さい白文字を載せる面はこちら**
- `--deep: #3567C4` — スラパズ！の帯
- `--cyan: #A8CDEB` — ヒーローの光とロゴの差し色
- `--blue-t: #2A62C9` — **文字として置く青**(リンク等)。ダーク時は `#A3C1EC`
- `--ink` / `--ink-2` — 本文 / 副次テキスト。`--bg` / `--bg-2` / `--line` — 背景・面・罫線

ヒーロー・スラパズ！の帯・ボタンの色は**ダークでも変えない**(青い面の上は常に白文字)。
「記念日・期限」の表示例(`.notif` / `.card-mock`)はアプリの見た目に合わせた固定色で、これもダークで変えない。
新色を足すときは `:root` に集め、ダーク時の値も同じ場所に書く。
favicon・OGP 画像・`privacy/policy.css` も同じ青系に揃えてある(ポリシーの `--blue` は `--blue-t` と同値)。

### ダークモード
`prefers-color-scheme: dark` に対応(`styles.css` / `privacy/policy.css` とも `:root` の上書きだけ)。
`:root` に `color-scheme: light dark` を宣言済み(Chrome の自動ダーク化に勝手に反転されないため)。
確認はヘッドレス Chrome の `--blink-settings=preferredColorScheme=1`(ライト)/ 指定なし(この PC はダーク)で撮る。
**スマホ幅は `--window-size=390,...` では撮れない**(Windows のヘッドレス Chrome は幅の下限が約 500px)。
幅 390px の iframe を並べた HTML を同じサーバから配って撮る

### 見出しの折り返し
`h1, h2, h3, .lead` に `word-break: auto-phrase`(文節の途中で折り返さない)。それでも 1 語だけ
次の行に落ちる見出しは、まとめたい部分を `<span class="nw">`(nowrap)で囲む(ヒーローの「もう数えなくていい。」)

### アクセシビリティ
`:focus-visible` に輪郭線を出している。`prefers-reduced-motion: reduce` ではスムーズスクロールを止める。
動きは入れていない(以前のフェードインは作り替えで捨てた)。足すなら同メディアクエリで打ち消すこと。

## 編集方針

- アプリが主役、受託は控えめ(3 行の一覧)という比重を崩さない
- 外部フレームワーク (React / Tailwind / Vue) は導入しない。素の HTML/CSS/JS を維持
- フォントはトップが Google Fonts の **Murecho のみ**(400/600/800)。ポリシーのページは従来の Inter + Noto Sans JP のまま
- コピーは日本語。英語の見出しラベル(Eyebrow)は作り替えで廃止した

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
- **CSS/JS/SVG を編集したら参照側の `?v=` を必ず上げる**。`_headers` が `/*.css` `/*.js` `/*.svg` に
  `max-age=31536000, immutable` を付けているため、クエリを変えないと再訪問者に1年間更新が届かない。
  HTML だけ `max-age=600` で先に更新されるので「新HTML + 旧CSS」で**表示が崩れる**
  (2026-08-25 に `styles.css` で実際に発生)。現在: `styles.css?v=4` / `script.js?v=3` /
  `privacy/policy.css?v=3` / `favicon.svg?v=2` / `og-image.svg?v=2`(参照は index.html と privacy/nennrei.html)。
  詳細と切り分け方は Obsidian [[immutable-cache-static-site-js]]
- 外部スクリプト追加時は CSP の `script-src` を更新する(インラインの `<script>` も CSP で止まる。JS は必ず別ファイル)
- メールアドレスはトップに載せていない(連絡はフォームのみ。以前の `js-mail` の難読化は作り替えで廃止)
- OGP 画像 (`og-image.svg`) は SVG。X (Twitter) で確実にプレビューを出したい場合は PNG (1200x630) を別途用意して `og:image` を差し替える
