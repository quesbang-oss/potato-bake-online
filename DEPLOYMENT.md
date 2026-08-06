# デプロイ方法

このプロジェクトは複数の無料ホスティングサービスでデプロイできます。

## GitHub Pages (推奨)

すでに設定済みです。GitHubリポジトリのmainブランチにプッシュするだけで自動的にデプロイされます。

- URL: `https://quesbang-oss.github.io/potato-bake-online/`

## Vercel (最も簡単)

1. [Vercel](https://vercel.com) にサインアップ
2. 「New Project」をクリック
3. GitHubリポジトリをインポート
4. デフォルト設定のまま「Deploy」をクリック
5. 数分でデプロイ完了

- 無料枠: 無制限
- 独自ドメイン: 無料
- 自動HTTPS: 対応

## Netlify

1. [Netlify](https://netlify.com) にサインアップ
2. 「Add new site」→「Import an existing project」
3. GitHubリポジトリを選択
4. 設定を確認して「Deploy site」をクリック

- 無料枠: 100GB/月
- 独自ドメイン: 無料
- 自動HTTPS: 対応

## Cloudflare Pages

1. [Cloudflare Pages](https://pages.cloudflare.com) にサインアップ
2. 「Create a project」をクリック
3. GitHubリポジトリを接続
4. 設定:
   - Build command: `npm install && npm run build`
   - Build output directory: `dist`
5. 「Save and Deploy」をクリック

- 無料枠: 無制限
- 独自ドメイン: 無料
- 自動HTTPS: 対応
- CDN: Cloudflareネットワーク

## トラブルシューティング

### GitHub Pagesで404エラーが出る場合
1. Actionsタブでデプロイが成功しているか確認
2. ブラウザキャッシュをクリア
3. `.nojekyll` ファイルがdistに含まれているか確認

### 他のサービスでビルドエラーが出る場合
1. Node.jsバージョンが18以上であることを確認
2. `npm install --legacy-peer-deps` を使用
3. ビルドコマンド: `npm run build`

### アセットが読み込まれない場合
1. 相対パスを使用していることを確認
2. `.nojekyll` ファイルが存在することを確認（GitHub Pages）
3. SPAルーティング用のリダイレクト設定を確認