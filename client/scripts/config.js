/**
 * 設定ファイル
 * 環境に応じてWebSocketサーバーのURLを設定
 */

export const config = {
  // WebSocketサーバーのURL
  // RenderでデプロイしたサーバーのURLに変更してください
  wsUrl: import.meta.env.VITE_WS_URL || 
         (window.location.hostname === 'localhost' ? 'ws://localhost:8080' : 'wss://potato-bake-online-server.onrender.com'),
  
  // APIエンドポイント
  apiBaseUrl: import.meta.env.VITE_API_URL || 
              (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://potato-bake-online-server.onrender.com'),
  
  // デバッグモード
  debug: import.meta.env.DEV,
  
  // オフラインモード（サーバー接続失敗時に自動切り替え）
  offlineMode: false
};
