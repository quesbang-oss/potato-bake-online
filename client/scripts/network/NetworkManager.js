/**
 * NetworkManager - ネットワーク通信管理クラス
 * WebSocketを通じてサーバーと通信
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { config } from '../config.js';

export class NetworkManager extends EventEmitter {
  constructor() {
    super();
    
    this.ws = null;
    this.playerId = null;
    this.roomCode = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    
    this.pingInterval = null;
    this.lastPingTime = 0;
    this.ping = 0;
    
    this.wsUrl = config.wsUrl;
  }
  
  /**
   * 初期化
   */
  initialize() {
    console.log('Initializing NetworkManager...');
  }
  
  /**
   * サーバーに接続
   * @param {string} url - WebSocket URL
   */
  connect(url = this.wsUrl) {
    console.log('Connecting to server:', url);
    
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onerror = (error) => this.handleError(error);
      this.ws.onclose = () => this.handleClose();
      
    } catch (error) {
      console.error('Failed to connect:', error);
      this.emit('error', '接続に失敗しました');
    }
  }
  
  /**
   * 接続成功時の処理
   */
  handleOpen() {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Pingを開始
    this.startPing();
    
    this.emit('connected');
  }
  
  /**
   * メッセージ受信時の処理
   * @param {MessageEvent} event - メッセージイベント
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log('Received message:', message.type);
      
      switch (message.type) {
        case 'connected':
          this.handleConnected(message);
          break;
          
        case 'roomCreated':
          this.handleRoomCreated(message);
          break;
          
        case 'roomJoined':
          this.handleRoomJoined(message);
          break;
          
        case 'playerJoined':
          this.handlePlayerJoined(message);
          break;
          
        case 'playerLeft':
          this.handlePlayerLeft(message);
          break;
          
        case 'playerReady':
          this.handlePlayerReady(message);
          break;
          
        case 'canStartGame':
          this.handleCanStartGame(message);
          break;
          
        case 'gameStarted':
          this.handleGameStarted(message);
          break;
          
        case 'gameAction':
          this.handleGameAction(message);
          break;
          
        case 'gameState':
          this.handleGameState(message);
          break;
          
        case 'chat':
          this.handleChat(message);
          break;
          
        case 'playerNameChanged':
          this.handlePlayerNameChanged(message);
          break;
          
        case 'hostChanged':
          this.handleHostChanged(message);
          break;
          
        case 'achievementUnlocked':
          this.handleAchievementUnlocked(message);
          break;
          
        case 'ranking':
          this.handleRanking(message);
          break;
          
        case 'error':
          this.handleError(message);
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
      
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }
  
  /**
   * 接続成功メッセージ処理
   * @param {object} message - メッセージ
   */
  handleConnected(message) {
    this.playerId = message.playerId;
    console.log('Player ID:', this.playerId);
  }
  
  /**
   * ルーム作成成功
   * @param {object} message - メッセージ
   */
  handleRoomCreated(message) {
    this.roomCode = message.roomCode;
    this.emit('roomCreated', message);
  }
  
  /**
   * ルーム参加成功
   * @param {object} message - メッセージ
   */
  handleRoomJoined(message) {
    this.roomCode = message.roomCode;
    this.emit('roomJoined', message);
  }
  
  /**
   * プレイヤー参加
   * @param {object} message - メッセージ
   */
  handlePlayerJoined(message) {
    this.emit('playerJoined', message);
  }
  
  /**
   * プレイヤー退出
   * @param {object} message - メッセージ
   */
  handlePlayerLeft(message) {
    this.emit('playerLeft', message);
  }
  
  /**
   * プレイヤーReady
   * @param {object} message - メッセージ
   */
  handlePlayerReady(message) {
    this.emit('playerReady', message);
  }
  
  /**
   * ゲーム開始可能
   * @param {object} message - メッセージ
   */
  handleCanStartGame(message) {
    this.emit('canStartGame', message);
  }
  
  /**
   * ゲーム開始
   * @param {object} message - メッセージ
   */
  handleGameStarted(message) {
    this.emit('gameStarted', message);
  }
  
  /**
   * ゲームアクション
   * @param {object} message - メッセージ
   */
  handleGameAction(message) {
    this.emit('gameAction', message);
  }
  
  /**
   * ゲーム状態更新
   * @param {object} message - メッセージ
   */
  handleGameState(message) {
    this.emit('gameState', message);
  }
  
  /**
   * チャットメッセージ
   * @param {object} message - メッセージ
   */
  handleChat(message) {
    this.emit('chat', message);
  }
  
  /**
   * プレイヤー名変更
   * @param {object} message - メッセージ
   */
  handlePlayerNameChanged(message) {
    this.emit('playerNameChanged', message);
  }
  
  /**
   * ホスト変更
   * @param {object} message - メッセージ
   */
  handleHostChanged(message) {
    this.emit('hostChanged', message);
  }
  
  /**
   * 実績解除
   * @param {object} message - メッセージ
   */
  handleAchievementUnlocked(message) {
    this.emit('achievementUnlocked', message);
  }
  
  /**
   * ランキング受信
   * @param {object} message - メッセージ
   */
  handleRanking(message) {
    this.emit('ranking', message);
  }
  
  /**
   * エラー処理
   * @param {object} error - エラー
   */
  handleError(error) {
    console.error('WebSocket error:', error);
    this.emit('error', error.error || 'エラーが発生しました');
  }
  
  /**
   * 接続切断時の処理
   */
  handleClose() {
    console.log('WebSocket disconnected');
    this.isConnected = false;
    this.stopPing();
    
    this.emit('disconnected');
    
    // 再接続を試みる
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    }
  }
  
  /**
   * メッセージを送信
   * @param {object} message - メッセージ
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }
  
  /**
   * ルーム作成をリクエスト
   * @param {string} playerName - プレイヤー名
   */
  createRoom(playerName) {
    this.send({
      type: 'createRoom',
      data: {
        playerName: playerName
      }
    });
  }
  
  /**
   * ルーム参加をリクエスト
   * @param {string} roomCode - ルームコード
   * @param {string} playerName - プレイヤー名
   * @param {boolean} isSpectator - 観戦モードかどうか
   */
  joinRoom(roomCode, playerName, isSpectator = false) {
    this.send({
      type: 'joinRoom',
      data: {
        roomCode: roomCode,
        playerName: playerName,
        isSpectator: isSpectator
      }
    });
  }
  
  /**
   * ルームから退出
   */
  leaveRoom() {
    this.send({
      type: 'leaveRoom',
      data: {}
    });
  }
  
  /**
   * Ready状態を切り替え
   * @param {boolean} isReady - Ready状態
   */
  setReady(isReady) {
    this.send({
      type: 'ready',
      data: {
        isReady: isReady
      }
    });
  }
  
  /**
   * ゲーム開始をリクエスト
   */
  startGame() {
    this.send({
      type: 'startGame',
      data: {}
    });
  }
  
  /**
   * ゲームアクションを送信
   * @param {object} action - アクションデータ
   */
  sendGameAction(action) {
    this.send({
      type: 'gameAction',
      data: action
    });
  }
  
  /**
   * チャットメッセージを送信
   * @param {string} message - メッセージ
   */
  sendChat(message) {
    this.send({
      type: 'chat',
      data: {
        message: message
      }
    });
  }
  
  /**
   * 名前変更
   * @param {string} name - 新しい名前
   */
  changeName(name) {
    this.send({
      type: 'changeName',
      data: {
        name: name
      }
    });
  }
  
  /**
   * ランキングをリクエスト
   * @param {string} category - カテゴリ
   * @param {number} limit - 取得数
   */
  requestRanking(category, limit = 50) {
    this.send({
      type: 'getRanking',
      data: {
        category: category,
        limit: limit
      }
    });
  }
  
  /**
   * 実績解除を送信
   * @param {string} achievementId - 実績ID
   */
  unlockAchievement(achievementId) {
    this.send({
      type: 'unlockAchievement',
      data: {
        achievementId: achievementId
      }
    });
  }
  
  /**
   * Pingを開始
   */
  startPing() {
    this.pingInterval = setInterval(() => {
      this.lastPingTime = Date.now();
      this.send({
        type: 'ping',
        data: {}
      });
    }, 5000);
  }
  
  /**
   * Pingを停止
   */
  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  
  /**
   * Ping応答を処理
   */
  handlePong() {
    this.ping = Date.now() - this.lastPingTime;
    this.emit('ping', this.ping);
  }
  
  /**
   * 切断
   */
  disconnect() {
    this.stopPing();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.roomCode = null;
  }
  
  /**
   * 接続状態かどうか
   * @returns {boolean} 接続状態
   */
  isSocketConnected() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }
  
  /**
   * ゲームエンジンを設定
   * @param {GameEngine} gameEngine - ゲームエンジン
   */
  setGameEngine(gameEngine) {
    this.gameEngine = gameEngine;
  }
  
  /**
   * UIマネージャーを設定
   * @param {UIManager} uiManager - UIマネージャー
   */
  setUIManager(uiManager) {
    this.uiManager = uiManager;
  }
}
