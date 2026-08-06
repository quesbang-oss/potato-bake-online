/**
 * 設定ファイル
 * 環境に応じてWebSocketサーバーのURLを設定
 */

export const config = {
  // ネットワークタイプ: 'websocket' または 'firebase'
  networkType: 'firebase',
  
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
    apiKey: "AIzaSyD36l6SapV90xX1i3N0D9f0_ri4F9Ru0-E",
    authDomain: "potato-bake-online.firebaseapp.com",
    databaseURL: "https://potato-bake-online-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "potato-bake-online",
    storageBucket: "potato-bake-online.firebasestorage.app",
    messagingSenderId: "402395102799",
    appId: "1:402395102799:web:76f3d85900a7e08516b43a"
  },
  
  // デバッグモード
  debug: true,
  
  // オフラインモード（サーバー接続失敗時に自動切り替え）
  offlineMode: false
};
