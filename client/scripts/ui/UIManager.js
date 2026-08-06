/**
 * UIManager - UI管理クラス
 * 全てのUI要素の管理とイベント処理
 */

import { EventEmitter } from '../utils/EventEmitter.js';

export class UIManager extends EventEmitter {
  constructor(app) {
    super();
    this.app = app;
    
    this.currentScreen = null;
    this.screens = new Map();
    
    this.networkManager = null;
    this.gameEngine = null;
    
    this.playerName = 'Player';
    this.roomCode = null;
    this.isReady = false;
  }
  
  /**
   * 初期化
   */
  async initialize() {
    console.log('Initializing UIManager...');
    
    // 全てのスクリーンを取得
    this.screens.set('loading-screen', document.getElementById('loading-screen'));
    this.screens.set('main-menu', document.getElementById('main-menu'));
    this.screens.set('join-screen', document.getElementById('join-screen'));
    this.screens.set('lobby-screen', document.getElementById('lobby-screen'));
    this.screens.set('game-screen', document.getElementById('game-screen'));
    this.screens.set('ranking-screen', document.getElementById('ranking-screen'));
    this.screens.set('achievements-screen', document.getElementById('achievements-screen'));
    this.screens.set('settings-screen', document.getElementById('settings-screen'));
    
    // イベントリスナーを設定
    this.setupEventListeners();
    
    // ロード済みプレイヤー名を取得
    const saveManager = this.app.getSaveManager();
    const userData = saveManager.loadUserData();
    if (userData && userData.name) {
      this.playerName = userData.name;
    }
    
    console.log('UIManager initialized');
  }
  
  /**
   * イベントリスナーを設定
   */
  setupEventListeners() {
    // メインメニュー
    document.getElementById('btn-create-room').addEventListener('click', () => {
      this.handleCreateRoom();
    });
    
    document.getElementById('btn-join-room').addEventListener('click', () => {
      this.showScreen('join-screen');
    });
    
    document.getElementById('btn-ranking').addEventListener('click', () => {
      this.showScreen('ranking-screen');
      this.loadRanking('perfect');
    });
    
    document.getElementById('btn-achievements').addEventListener('click', () => {
      this.showScreen('achievements-screen');
      this.loadAchievements();
    });
    
    document.getElementById('btn-settings').addEventListener('click', () => {
      this.showScreen('settings-screen');
    });
    
    // 参加画面
    document.getElementById('btn-back-join').addEventListener('click', () => {
      this.showScreen('main-menu');
    });
    
    document.getElementById('btn-join-submit').addEventListener('click', () => {
      this.handleJoinRoom();
    });
    
    // ロビー画面
    document.getElementById('btn-leave-room').addEventListener('click', () => {
      this.handleLeaveRoom();
    });
    
    document.getElementById('btn-ready').addEventListener('click', () => {
      this.handleReady();
    });
    
    document.getElementById('btn-start-game').addEventListener('click', () => {
      this.handleStartGame();
    });
    
    document.getElementById('btn-send-chat').addEventListener('click', () => {
      this.handleSendChat();
    });
    
    document.getElementById('lobby-chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSendChat();
      }
    });
    
    // ゲーム画面
    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.handlePlayAgain();
    });
    
    document.getElementById('btn-back-to-lobby').addEventListener('click', () => {
      this.showScreen('lobby-screen');
    });
    
    // ランキング画面
    document.getElementById('btn-back-ranking').addEventListener('click', () => {
      this.showScreen('main-menu');
    });
    
    document.querySelectorAll('.ranking-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        this.loadRanking(category);
        
        // タブのアクティブ状態を更新
        document.querySelectorAll('.ranking-tabs .tab-btn').forEach(b => {
          b.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
      });
    });
    
    // 実績画面
    document.getElementById('btn-back-achievements').addEventListener('click', () => {
      this.showScreen('main-menu');
    });
    
    // 設定画面
    document.getElementById('btn-back-settings').addEventListener('click', () => {
      this.saveSettings();
      this.showScreen('main-menu');
    });
    
    // 設定スライダー
    document.getElementById('volume-bgm').addEventListener('input', (e) => {
      document.getElementById('volume-bgm-value').textContent = `${e.target.value}%`;
      this.updateVolume('bgm', e.target.value);
    });
    
    document.getElementById('volume-se').addEventListener('input', (e) => {
      document.getElementById('volume-se-value').textContent = `${e.target.value}%`;
      this.updateVolume('se', e.target.value);
    });
    
    // ネットワークイベント
    if (this.networkManager) {
      this.networkManager.on('roomCreated', (data) => {
        this.handleRoomCreated(data);
      });
      
      this.networkManager.on('roomJoined', (data) => {
        this.handleRoomJoined(data);
      });
      
      this.networkManager.on('playerJoined', (data) => {
        this.updatePlayerList(data.roomInfo);
      });
      
      this.networkManager.on('playerLeft', (data) => {
        this.updatePlayerList();
      });
      
      this.networkManager.on('playerReady', (data) => {
        this.updatePlayerList();
      });
      
      this.networkManager.on('canStartGame', (data) => {
        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
          startBtn.disabled = !data.canStart;
        }
      });
      
      this.networkManager.on('gameStarted', (data) => {
        this.handleGameStarted(data);
      });
      
      this.networkManager.on('chat', (data) => {
        this.addChatMessage(data.chat);
      });
      
      this.networkManager.on('ping', (ping) => {
        this.updatePing(ping);
      });
      
      this.networkManager.on('ranking', (data) => {
        this.displayRanking(data);
      });
    }
  }
  
  /**
   * スクリーンを表示
   * @param {string} screenName - スクリーン名
   */
  showScreen(screenName) {
    // 全てのスクリーンを非表示
    this.screens.forEach((screen, name) => {
      screen.classList.add('hidden');
    });
    
    // 指定したスクリーンを表示
    const screen = this.screens.get(screenName);
    if (screen) {
      screen.classList.remove('hidden');
      this.currentScreen = screenName;
    }
  }
  
  /**
   * ルーム作成処理
   */
  handleCreateRoom() {
    const networkManager = this.app.getNetworkManager();
    if (networkManager) {
      networkManager.connect();
      networkManager.createRoom(this.playerName);
    }
  }
  
  /**
   * ルーム参加処理
   */
  handleJoinRoom() {
    const roomCode = document.getElementById('room-code-input').value.toUpperCase();
    const playerName = document.getElementById('player-name-input').value || this.playerName;
    const isSpectator = document.getElementById('spectator-mode').checked;
    
    if (roomCode.length !== 6) {
      this.showNotification('ルームコードは6桁で入力してください', 'error');
      return;
    }
    
    this.playerName = playerName;
    
    const networkManager = this.app.getNetworkManager();
    if (networkManager) {
      networkManager.connect();
      networkManager.joinRoom(roomCode, playerName, isSpectator);
    }
  }
  
  /**
   * ルーム作成成功
   * @param {object} data - データ
   */
  handleRoomCreated(data) {
    this.roomCode = data.roomCode;
    this.showScreen('lobby-screen');
    this.updateLobbyInfo(data.roomInfo);
    this.showNotification('ルームを作成しました', 'success');
  }
  
  /**
   * ルーム参加成功
   * @param {object} data - データ
   */
  handleRoomJoined(data) {
    this.roomCode = data.roomCode;
    this.showScreen('lobby-screen');
    this.updateLobbyInfo(data.roomInfo);
    this.showNotification('ルームに参加しました', 'success');
  }
  
  /**
   * ロビー情報を更新
   * @param {object} roomInfo - ルーム情報
   */
  updateLobbyInfo(roomInfo) {
    document.getElementById('lobby-room-code').textContent = roomInfo.code;
    document.getElementById('game-room-code').textContent = roomInfo.code;
    this.updatePlayerList(roomInfo);
  }
  
  /**
   * プレイヤーリストを更新
   * @param {object} roomInfo - ルーム情報
   */
  updatePlayerList(roomInfo) {
    const playerList = document.getElementById('lobby-player-list');
    if (!playerList) return;
    
    if (roomInfo && roomInfo.players) {
      playerList.innerHTML = '';
      
      roomInfo.players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        
        if (player.isHost) {
          playerItem.classList.add('host');
        }
        
        if (player.isReady) {
          playerItem.classList.add('ready');
        }
        
        playerItem.innerHTML = `
          <div class="player-info">
            <span class="player-name">${player.name}</span>
            ${player.isHost ? '<span class="player-status">👑 Host</span>' : ''}
            ${player.isSpectator ? '<span class="player-status">👀 観戦</span>' : ''}
            ${player.isReady ? '<span class="player-status">✓ Ready</span>' : ''}
          </div>
        `;
        
        playerList.appendChild(playerItem);
      });
    }
  }
  
  /**
   * ルーム退出処理
   */
  handleLeaveRoom() {
    const networkManager = this.app.getNetworkManager();
    if (networkManager) {
      networkManager.leaveRoom();
    }
    
    this.roomCode = null;
    this.showScreen('main-menu');
  }
  
  /**
   * Ready処理
   */
  handleReady() {
    this.isReady = !this.isReady;
    
    const btn = document.getElementById('btn-ready');
    btn.textContent = this.isReady ? 'Ready ✓' : 'Ready';
    btn.classList.toggle('primary', this.isReady);
    
    const networkManager = this.app.getNetworkManager();
    if (networkManager) {
      networkManager.setReady(this.isReady);
    }
  }
  
  /**
   * ゲーム開始処理
   */
  handleStartGame() {
    const networkManager = this.app.getNetworkManager();
    if (networkManager) {
      networkManager.startGame();
    }
  }
  
  /**
   * ゲーム開始処理
   * @param {object} data - データ
   */
  handleGameStarted(data) {
    const gameEngine = this.app.getGameEngine();
    if (gameEngine) {
      gameEngine.startGame(data.gameState);
    }
    
    document.getElementById('game-result').classList.add('hidden');
  }
  
  /**
   * チャット送信処理
   */
  handleSendChat() {
    const input = document.getElementById('lobby-chat-input');
    const message = input.value.trim();
    
    if (message) {
      const networkManager = this.app.getNetworkManager();
      if (networkManager) {
        networkManager.sendChat(message);
      }
      
      input.value = '';
    }
  }
  
  /**
   * チャットメッセージを追加
   * @param {object} chat - チャットデータ
   */
  addChatMessage(chat) {
    const chatMessages = document.getElementById('lobby-chat-messages');
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `
      <span class="player-name">${chat.playerName}:</span>
      <span class="message-text">${chat.message}</span>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  /**
   * ゲーム結果を表示
   * @param {object} result - 結果データ
   */
  showGameResult(result) {
    const resultScreen = document.getElementById('game-result');
    const resultTitle = document.getElementById('result-title');
    const resultIcon = document.getElementById('result-icon');
    const resultMessage = document.getElementById('result-message');
    const resultStats = document.getElementById('result-stats');
    
    resultScreen.classList.remove('hidden');
    
    if (result.result === 'win') {
      resultTitle.textContent = '勝利！';
      resultIcon.textContent = '🎉';
      resultMessage.textContent = result.potato.status === 'perfect' ? 'Perfect！' : 'Good！';
    } else {
      resultTitle.textContent = '敗北...';
      resultIcon.textContent = '😢';
      
      const statusMap = {
        'burnt': '焦げちゃった...',
        'exploded': '爆発した...',
        'raw': 'まだ生だった...'
      };
      resultMessage.textContent = statusMap[result.potato.status] || '敗北';
    }
    
    resultStats.innerHTML = `
      <div>温度: ${Math.round(result.potato.temperature)}°C</div>
      <div>焼き加減: ${Math.round(result.potato.doneness)}%</div>
      <div>状態: ${result.potato.status}</div>
    `;
  }
  
  /**
   * もう一度プレイ
   */
  handlePlayAgain() {
    document.getElementById('game-result').classList.add('hidden');
    
    // ロビーに戻って再度Ready
    this.isReady = false;
    const btn = document.getElementById('btn-ready');
    btn.textContent = 'Ready';
    btn.classList.remove('primary');
    
    this.showScreen('lobby-screen');
  }
  
  /**
   * ランキングをロード
   * @param {string} category - カテゴリ
   */
  loadRanking(category) {
    const networkManager = this.app.getNetworkManager();
    if (networkManager) {
      networkManager.requestRanking(category, 50);
    }
  }
  
  /**
   * ランキングを表示
   * @param {object} data - ランキングデータ
   */
  displayRanking(data) {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;
    
    rankingList.innerHTML = '';
    
    data.ranking.forEach((item, index) => {
      const rankingItem = document.createElement('div');
      rankingItem.className = 'ranking-item';
      
      if (index < 3) {
        rankingItem.classList.add(`rank-${index + 1}`);
      }
      
      rankingItem.innerHTML = `
        <div class="ranking-rank">${item.rank}</div>
        <div class="ranking-name">${item.playerName}</div>
        <div class="ranking-score">${item.score}</div>
      `;
      
      rankingList.appendChild(rankingItem);
    });
  }
  
  /**
   * 実績をロード
   */
  loadAchievements() {
    const achievementManager = this.app.getAchievementManager();
    const achievements = achievementManager.getAllAchievements();
    const unlockedAchievements = achievementManager.getPlayerAchievements();
    
    const achievementList = document.getElementById('achievement-list');
    if (!achievementList) return;
    
    achievementList.innerHTML = '';
    
    document.getElementById('achievement-count').textContent = unlockedAchievements.length;
    document.getElementById('achievement-total').textContent = achievements.length;
    
    achievements.forEach(achievement => {
      const isUnlocked = unlockedAchievements.includes(achievement.id);
      
      const achievementItem = document.createElement('div');
      achievementItem.className = 'achievement-item';
      if (isUnlocked) {
        achievementItem.classList.add('unlocked');
      }
      
      achievementItem.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
      `;
      
      achievementList.appendChild(achievementItem);
    });
  }
  
  /**
   * 設定を保存
   */
  saveSettings() {
    const saveManager = this.app.getSaveManager();
    const audioManager = this.app.getAudioManager();
    
    const settings = {
      volumeBgm: parseInt(document.getElementById('volume-bgm').value),
      volumeSe: parseInt(document.getElementById('volume-se').value),
      quality: document.getElementById('quality-select').value,
      language: document.getElementById('language-select').value
    };
    
    saveManager.saveSettings(settings);
    audioManager.updateVolumes(settings);
    
    this.showNotification('設定を保存しました', 'success');
  }
  
  /**
   * 音量を更新
   * @param {string} type - タイプ（bgm/se）
   * @param {number} value - 音量
   */
  updateVolume(type, value) {
    const audioManager = this.app.getAudioManager();
    if (audioManager) {
      audioManager.setVolume(type, value / 100);
    }
  }
  
  /**
   * Pingを更新
   * @param {number} ping - Ping値
   */
  updatePing(ping) {
    const pingEl = document.getElementById('ping-display');
    if (pingEl) {
      pingEl.textContent = `${ping}ms`;
    }
    
    const statusIndicator = document.getElementById('connection-status');
    if (statusIndicator) {
      if (ping < 100) {
        statusIndicator.className = 'status-indicator';
      } else if (ping < 200) {
        statusIndicator.className = 'status-indicator';
        statusIndicator.style.background = '#ffff00';
      } else {
        statusIndicator.className = 'status-indicator disconnected';
      }
    }
  }
  
  /**
   * プレイヤー情報を更新
   * @param {object} userData - ユーザーデータ
   */
  updatePlayerInfo(userData) {
    this.playerName = userData.name || 'Player';
    document.getElementById('menu-player-name').textContent = this.playerName;
    
    const stats = document.getElementById('menu-player-stats');
    if (stats) {
      stats.innerHTML = `
        総プレイ数: ${userData.totalGames || 0} | 
        Perfect: ${userData.perfectCount || 0} | 
        爆発: ${userData.explodedCount || 0}
      `;
    }
  }
  
  /**
   * 通知を表示
   * @param {string} message - メッセージ
   * @param {string} type - タイプ（success/error/warning/info）
   */
  showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // 3秒後に削除
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  /**
   * イベント通知を表示
   * @param {string} message - メッセージ
   */
  showEventNotification(message) {
    const notification = document.getElementById('event-notification');
    if (notification) {
      notification.textContent = message;
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }
  }
  
  /**
   * ネットワークマネージャーを設定
   * @param {NetworkManager} networkManager - ネットワークマネージャー
   */
  setNetworkManager(networkManager) {
    this.networkManager = networkManager;
  }
  
  /**
   * ゲームエンジンを設定
   * @param {GameEngine} gameEngine - ゲームエンジン
   */
  setGameEngine(gameEngine) {
    this.gameEngine = gameEngine;
  }
}
