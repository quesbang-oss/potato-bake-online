/**
 * 設定ファイル
 * 環境に応じてWebSocketサーバーのURLを設定
 */

export const config = {
  // ネットワークタイプ: 'websocket' または 'firebase'
  networkType: 'firebase',
  
  // WebSocketサーバーのURL（WebSocketモード時）
  get wsUrl() {
    return (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'ws://localhost:8080'
      : 'wss://potato-bake-online-server.onrender.com';
  },
  
  // APIエンドポイント
  get apiBaseUrl() {
    return (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:8080'
      : 'https://potato-bake-online-server.onrender.com';
  },
  
  // Firebase設定
  // GitHub Actionsの環境変数優先、なければデフォルト値を使用
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
  },
  
  // デバッグモード
  debug: true,
  
  // オフラインモード（サーバー接続失敗時に自動切り替え）
  // Firebase設定を完了したらfalseに変更してください
  offlineMode: false
};
