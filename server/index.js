import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { GameRoomManager } from './GameRoomManager.js';
import { PlayerManager } from './PlayerManager.js';
import { RankingManager } from './RankingManager.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// ミドルウェア設定
app.use(express.json());
app.use(express.static('dist'));

// 静的ファイル配信
app.get('/', (req, res) => {
  res.sendFile(resolve('dist/index.html'));
});

// マネージャー初期化
const roomManager = new GameRoomManager();
const playerManager = new PlayerManager();
const rankingManager = new RankingManager();

// WebSocket接続処理
wss.on('connection', (ws, req) => {
  const playerId = uuidv4();
  const clientIp = req.socket.remoteAddress;
  
  console.log(`New connection: ${playerId} from ${clientIp}`);
  
  // プレイヤー情報を初期化
  playerManager.addPlayer(playerId, {
    id: playerId,
    ip: clientIp,
    connected: true,
    lastPing: Date.now()
  });
  
  // WebSocketメッセージハンドラー
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(ws, playerId, message);
    } catch (error) {
      console.error('Message handling error:', error);
      sendError(ws, 'Invalid message format');
    }
  });
  
  // 切断処理
  ws.on('close', () => {
    handleDisconnect(playerId);
  });
  
  // エラー処理
  ws.on('error', (error) => {
    console.error(`WebSocket error for player ${playerId}:`, error);
  });
  
  // 初期接続成功を送信
  sendMessage(ws, {
    type: 'connected',
    playerId: playerId
  });
});

// メッセージハンドラー
async function handleMessage(ws, playerId, message) {
  const { type, data } = message;
  
  switch (type) {
    case 'createRoom':
      await handleCreateRoom(ws, playerId, data);
      break;
      
    case 'joinRoom':
      await handleJoinRoom(ws, playerId, data);
      break;
      
    case 'leaveRoom':
      await handleLeaveRoom(playerId);
      break;
      
    case 'ready':
      await handleReady(playerId, data);
      break;
      
    case 'startGame':
      await handleStartGame(playerId);
      break;
      
    case 'gameAction':
      await handleGameAction(playerId, data);
      break;
      
    case 'chat':
      await handleChat(playerId, data);
      break;
      
    case 'changeName':
      await handleChangeName(playerId, data);
      break;
      
    case 'ping':
      await handlePing(playerId);
      break;
      
    case 'updateProfile':
      await handleUpdateProfile(playerId, data);
      break;
      
    case 'getRanking':
      await handleGetRanking(ws, data);
      break;
      
    case 'unlockAchievement':
      await handleUnlockAchievement(playerId, data);
      break;
      
    default:
      sendError(ws, 'Unknown message type');
  }
}

// ルーム作成
async function handleCreateRoom(ws, playerId, data) {
  const roomCode = roomManager.createRoom(playerId, data);
  const room = roomManager.getRoom(roomCode);
  
  // プレイヤーをルームに追加
  room.addPlayer(playerId, {
    id: playerId,
    name: data.playerName || 'Player',
    isHost: true,
    isReady: false,
    isSpectator: false
  });
  
  sendMessage(ws, {
    type: 'roomCreated',
    roomCode: roomCode,
    roomInfo: room.getPublicInfo()
  });
}

// ルーム参加
async function handleJoinRoom(ws, playerId, data) {
  const { roomCode, playerName, isSpectator } = data;
  const room = roomManager.getRoom(roomCode);
  
  if (!room) {
    sendError(ws, 'Room not found');
    return;
  }
  
  if (room.players.size >= 10) {
    sendError(ws, 'Room is full');
    return;
  }
  
  // プレイヤーをルームに追加
  room.addPlayer(playerId, {
    id: playerId,
    name: playerName || 'Player',
    isHost: false,
    isReady: false,
    isSpectator: isSpectator || false
  });
  
  // ルーム内の全プレイヤーに通知
  broadcastToRoom(roomCode, {
    type: 'playerJoined',
    player: room.getPlayer(playerId)
  });
  
  // 参加者にルーム情報を送信
  sendMessage(ws, {
    type: 'roomJoined',
    roomCode: roomCode,
    roomInfo: room.getPublicInfo()
  });
}

// ルーム退出
async function handleLeaveRoom(playerId) {
  const room = roomManager.getPlayerRoom(playerId);
  if (room) {
    room.removePlayer(playerId);
    
    // ホストが退出した場合、ホスト移譲
    if (room.players.size > 0 && !room.hasHost()) {
      const newHost = room.players.keys().next().value;
      room.setHost(newHost);
      
      broadcastToRoom(room.code, {
        type: 'hostChanged',
        newHost: newHost
      });
    }
    
    // ルームが空になったら削除
    if (room.players.size === 0) {
      roomManager.deleteRoom(room.code);
    } else {
      broadcastToRoom(room.code, {
        type: 'playerLeft',
        playerId: playerId
      });
    }
  }
}

// Ready切り替え
async function handleReady(playerId, data) {
  const room = roomManager.getPlayerRoom(playerId);
  if (room) {
    room.setPlayerReady(playerId, data.isReady);
    
    broadcastToRoom(room.code, {
      type: 'playerReady',
      playerId: playerId,
      isReady: data.isReady
    });
    
    // 全員Readyでゲーム開始可能
    if (room.canStartGame()) {
      broadcastToRoom(room.code, {
        type: 'canStartGame',
        canStart: true
      });
    }
  }
}

// ゲーム開始
async function handleStartGame(playerId) {
  const room = roomManager.getPlayerRoom(playerId);
  if (room && room.isHost(playerId)) {
    room.startGame();
    
    broadcastToRoom(room.code, {
      type: 'gameStarted',
      gameState: room.getGameState()
    });
  }
}

// ゲームアクション
async function handleGameAction(playerId, data) {
  const room = roomManager.getPlayerRoom(playerId);
  if (room && room.isGameRunning()) {
    room.handleGameAction(playerId, data);
    
    broadcastToRoom(room.code, {
      type: 'gameAction',
      playerId: playerId,
      action: data
    });
  }
}

// チャット
async function handleChat(playerId, data) {
  const room = roomManager.getPlayerRoom(playerId);
  if (room) {
    const player = room.getPlayer(playerId);
    const chatMessage = {
      playerId: playerId,
      playerName: player.name,
      message: data.message,
      timestamp: Date.now()
    };
    
    broadcastToRoom(room.code, {
      type: 'chat',
      chat: chatMessage
    });
  }
}

// 名前変更
async function handleChangeName(playerId, data) {
  const room = roomManager.getPlayerRoom(playerId);
  if (room) {
    room.setPlayerName(playerId, data.name);
    
    broadcastToRoom(room.code, {
      type: 'playerNameChanged',
      playerId: playerId,
      name: data.name
    });
  }
}

// Ping応答
async function handlePing(playerId) {
  const player = playerManager.getPlayer(playerId);
  if (player) {
    player.lastPing = Date.now();
    playerManager.updatePlayer(playerId, player);
  }
}

// プロフィール更新
async function handleUpdateProfile(playerId, data) {
  playerManager.updateProfile(playerId, data);
  
  const room = roomManager.getPlayerRoom(playerId);
  if (room) {
    const player = room.getPlayer(playerId);
    player.profile = data;
  }
}

// ランキング取得
async function handleGetRanking(ws, data) {
  const ranking = await rankingManager.getRanking(data.category, data.limit);
  
  sendMessage(ws, {
    type: 'ranking',
    category: data.category,
    ranking: ranking
  });
}

// 実績解除
async function handleUnlockAchievement(playerId, data) {
  const achievement = await rankingManager.unlockAchievement(playerId, data.achievementId);
  
  if (achievement) {
    const room = roomManager.getPlayerRoom(playerId);
    if (room) {
      broadcastToRoom(room.code, {
        type: 'achievementUnlocked',
        playerId: playerId,
        achievement: achievement
      });
    }
  }
}

// 切断処理
function handleDisconnect(playerId) {
  console.log(`Player disconnected: ${playerId}`);
  
  const player = playerManager.getPlayer(playerId);
  if (player) {
    player.connected = false;
    playerManager.updatePlayer(playerId, player);
  }
  
  handleLeaveRoom(playerId);
}

// ルーム内ブロードキャスト
function broadcastToRoom(roomCode, message) {
  const room = roomManager.getRoom(roomCode);
  if (room) {
    room.players.forEach((player, playerId) => {
      const ws = playerManager.getWebSocket(playerId);
      if (ws && ws.readyState === 1) {
        sendMessage(ws, message);
      }
    });
  }
}

// メッセージ送信
function sendMessage(ws, message) {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(message));
  }
}

// エラー送信
function sendError(ws, error) {
  sendMessage(ws, {
    type: 'error',
    error: error
  });
}

// 定期的なクリーンアップ
setInterval(() => {
  // 5分以上Pingのないプレイヤーを切断
  const now = Date.now();
  playerManager.getAllPlayers().forEach(player => {
    if (player.connected && now - player.lastPing > 300000) {
      console.log(`Player timed out: ${player.id}`);
      handleDisconnect(player.id);
    }
  });
}, 60000);

// サーバー起動
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});
