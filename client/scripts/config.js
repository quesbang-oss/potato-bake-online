/**
 * 設定ファイル
 * 環境に応じてWebSocketサーバーのURLを設定
 */

export const config = {
  // ネットワークタイプ: 'websocket' または 'firebase'
  networkType: import.meta.env.VITE_NETWORK_TYPE || 'firebase',
  
  // WebSocketサーバーのURL（WebSocketモード時）
  wsUrl: window.location.hostname === 'localhost' 
    ? 'ws://localhost:8080' 
    : 'wss://potato-bake-online-server.onrender.com',
  
  // APIエンドポイント
  apiBaseUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'https://potato-bake-online-server.onrender.com',
  
  // Firebase設定
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
  },
  
  // デバッグモード
  debug: import.meta.env.DEV,
  
  // オフラインモード（サーバー接続失敗時に自動切り替え）
  offlineMode: false
};
