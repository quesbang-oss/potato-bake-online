/**
 * 設定ファイル
 * 環境に応じてWebSocketサーバーのURLを設定
 */

export const config = {
  // WebSocketサーバーのURL
  // GitHub Pagesから接続する場合は、公開されているサーバーのURLを指定
  wsUrl: import.meta.env.VITE_WS_URL || 
         (window.location.hostname === 'localhost' ? 'ws://localhost:8080' : 'wss://your-server.com'),
  
  // APIエンドポイント
  apiBaseUrl: import.meta.env.VITE_API_URL || 
              (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://your-server.com'),
  
  // デバッグモード
  debug: import.meta.env.DEV
};
