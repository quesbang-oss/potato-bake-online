/**
 * 設定ファイル
 * 環境に応じてWebSocketサーバーのURLを設定
 */

export const config = {
  // WebSocketサーバーのURL
  // サーバーが利用できない場合、オフラインモードで動作
  wsUrl: import.meta.env.VITE_WS_URL || 
         (window.location.hostname === 'localhost' ? 'ws://localhost:8080' : null),
  
  // APIエンドポイント
  apiBaseUrl: import.meta.env.VITE_API_URL || 
              (window.location.hostname === 'localhost' ? 'http://localhost:8080' : null),
  
  // デバッグモード
  debug: import.meta.env.DEV,
  
  // オフラインモード
  offlineMode: true
};
