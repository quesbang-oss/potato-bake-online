# デプロイ方法

このプロジェクトはFirebaseを使用してデプロイします。FirebaseはHostingとRealtime Databaseの両方を提供しています。

## Firebaseデプロイ（推奨）

Firebaseはすべての機能を1つのプラットフォームで提供しています：

### Firebaseのメリット
- **無料枠**: HostingとRealtime Databaseが豊富
- **スリープなし**: 24時間365日利用可能
- **低レイテンシ**: グローバルCDN
- **設定簡単**: 1つのコンソールで管理
- **自動HTTPS**: SSL証明書自動

### Firebaseプロジェクト設定

#### 1. Firebaseプロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `potato-bake-online`）
4. Google Analyticsは無効でOK
5. 「プロジェクトを作成」をクリック

#### 2. Hosting有効化

1. 左側メニューから「Hosting」を選択
2. 「始める」をクリック
3. プロジェクトを選択（既存のプロジェクトを選択）
4. ビルド設定:
   - パブリックディレクトリ: `dist`
   - フレームワーク: なし
   - 単一ページアプリ: 有効（SPAルーティング用）
5. 「完了」をクリック

#### 3. Realtime Database有効化

1. 左側メニューから「Realtime Database」を選択
2. 「データベースを作成」をクリック
3. ロケーションを選択（推奨: `asia-northeast1`）
4. セキュリティルール: 「テストモードで開始」を選択
5. 「有効にする」をクリック

#### 4. セキュリティルール設定

Realtime Databaseの「ルール」タブで以下を設定：

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

#### 5. Firebase設定情報取得

1. プロジェクト設定（歯車アイコン）をクリック
2. 「全般」タブで以下を確認：
   - プロジェクトID
   - APIキー
3. 「サービスアカウント」タブでデータベースURLを確認

#### 6. ローカル環境設定

Firebase CLIをインストール：

```bash
npm install -g firebase-tools
```

Firebaseにログイン：

```bash
firebase login
```

プロジェクトを初期化：

```bash
firebase init
```

- Hosting: 有効
- Realtime Database: 有効
- 既存のプロジェクトを選択

#### 7. Firebase設定ファイル更新

`.firebaserc` ファイルでプロジェクトIDを確認：

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

#### 8. 環境変数設定

`.env.local` ファイルを作成（ローカル開発用）：

```env
VITE_NETWORK_TYPE=firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

#### 9. ビルドとデプロイ

ビルド：

```bash
npm run build
```

デプロイ：

```bash
firebase deploy
```

### GitHub Actionsを使用した自動デプロイ

GitHub ActionsからFirebaseにデプロイする場合：

1. Firebase Consoleでサービスアカウントキーを作成
2. GitHubリポジトリのSecretsに保存
3. GitHub ActionsでFirebase CLIを使用

詳細は [`.github/workflows/deploy-firebase.yml`](./.github/workflows/deploy-firebase.yml) を参照してください。

## その他のホスティングサービス

Firebase以外を使用する場合の設定も残していますが、推奨はFirebaseです。

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