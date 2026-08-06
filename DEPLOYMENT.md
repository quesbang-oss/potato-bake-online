# デプロイ方法

このプロジェクトは複数の無料ホスティングサービスでデプロイできます。

## フロントエンドデプロイ

### GitHub Pages (推奨)

すでに設定済みです。GitHubリポジトリのmainブランチにプッシュするだけで自動的にデプロイされます。

- URL: `https://quesbang-oss.github.io/potato-bake-online/`

### Vercel (最も簡単)

1. [Vercel](https://vercel.com) にサインアップ
2. 「New Project」をクリック
3. GitHubリポジトリをインポート
4. デフォルト設定のまま「Deploy」をクリック
5. 数分でデプロイ完了

- 無料枠: 無制限
- 独自ドメイン: 無料
- 自動HTTPS: 対応

### Netlify

1. [Netlify](https://netlify.com) にサインアップ
2. 「Add new site」→「Import an existing project」
3. GitHubリポジトリを選択
4. 設定を確認して「Deploy site」をクリック

- 無料枠: 100GB/月
- 独自ドメイン: 無料
- 自動HTTPS: 対応

### Cloudflare Pages

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

## WebSocketサーバーデプロイ

WebSocketサーバーはマルチプレイ機能に必要です。以下の手順でRenderにデプロイしてください：

### Renderデプロイ手順

1. **Renderアカウント作成**
   - [Render](https://render.com) にサインアップ
   - GitHubアカウントでログイン

2. **新しいWeb Service作成**
   - ダッシュボードで「New +」→「Web Service」をクリック
   - GitHubリポジトリ `potato-bake-online` を選択
   - 「Connect」をクリック

3. **設定**
   - **Name**: `potato-bake-online-server`
   - **Region**: `Singapore`（日本に近いリージョン推奨）
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Instance Type**: `Free`

4. **環境変数**
   - `PORT`: `8080`
   - `NODE_ENV`: `production`

5. **詳細設定**
   - **Health Check Path**: `/health`
   - **Auto Deploy**: `Off`（手動デプロイ推奨）

6. **デプロイ**
   - 「Create Web Service」をクリック
   - デプロイ完了まで数分待つ

7. **URL確認**
   - デプロイ完了後、URLを確認（例: `https://potato-bake-online-server.onrender.com`）
   - `https://[URL]/health` でヘルスチェック

### 無料枠の制限
- Render無料枠: スリープします（15分アクセスがないと）
- 最初のリクエストで起動に数秒かかります
- 複数のサーバーをデプロイして負荷分散を推奨

### 注意点
- 無料枠はスリープするため、最初の接続に時間がかかります
- 本番環境では有料プランの検討を推奨
- 複数のリージョンにサーバーをデプロイしてレイテンシを最小化

## オフラインモード

サーバーが利用できない場合、自動的にオフラインモードで動作します：
- マルチプレイ機能は利用できません
- UIの表示と基本機能は利用可能
- WebSocket接続エラーが表示されません

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