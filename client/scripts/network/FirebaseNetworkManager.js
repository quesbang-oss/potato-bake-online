/**
 * FirebaseNetworkManager - Firebase Realtime Databaseを使用したネットワーク管理クラス
 * WebSocketの代わりにFirebaseを使用したリアルタイム通信
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, onDisconnect, remove, get, update } from 'firebase/database';
import { config } from '../config.js';

export class FirebaseNetworkManager extends EventEmitter {
  constructor() {
    super();
    
    this.db = null;
    this.playerId = null;
    this.roomCode = null;
    this.isConnected = false;
    this.isOfflineMode = false;
    
    this.playerRef = null;
    this.roomRef = null;
    
    // Firebase設定（config.jsから取得）
    this.firebaseConfig = config.firebase;
  }
  
  /**
   * 初期化
   */
  initialize() {
    console.log('Initializing FirebaseNetworkManager...');
    console.log('Firebase config:', this.firebaseConfig);
    
    // Firebase設定が不足している場合でも接続を試みる
    if (!this.firebaseConfig.databaseURL) {
      console.warn('Firebase configuration incomplete, but will try anyway');
    }
    
    try {
      // Firebase初期化
      const app = initializeApp(this.firebaseConfig);
      this.db = getDatabase(app);
      
      // プレイヤーID生成
      this.playerId = 'player-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      this.isConnected = true;
      this.isOfflineMode = false;
      this.emit('connected', { playerId: this.playerId });
      
      console.log('Firebase initialized successfully');
      
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      console.error('Error details:', error.message, error.code);
      
      // オフラインモードに切り替え
      this.isOfflineMode = true;
      this.playerId = 'offline-player-' + Date.now();
      this.emit('offlineMode', true);
    }
  }
  
  /**
   * 接続（強制再接続）
   */
  connect() {
    console.log('Connect called, current mode:', this.isOfflineMode ? 'offline' : 'online');
    
    // オフラインモードでも再試行
    if (this.isOfflineMode) {
      console.log('Attempting to reinitialize Firebase...');
      this.isOfflineMode = false;
      this.initialize();
      return;
    }
    
    if (!this.db) {
      console.log('Firebase not initialized, initializing...');
      this.initialize();
      return;
    }
    
    console.log('Firebase connection already established');
  }
  
  /**
   * 切断
   */
  disconnect() {
    if (this.playerRef) {
      set(this.playerRef, null);
      this.playerRef = null;
    }
    
    if (this.roomRef) {
      off(this.roomRef);
      this.roomRef = null;
    }
    
    this.isConnected = false;
    this.emit('disconnected');
  }
  
  /**
   * ルーム作成
   */
  async createRoom(data) {
    if (this.isOfflineMode) {
      this.emit('roomCreated', { 
        roomCode: 'OFFLINE-' + Date.now(),
        roomInfo: this.createOfflineRoomInfo(data)
      });
      return;
    }
    
    try {
      const roomCode = this.generateRoomCode();
      const roomRef = ref(this.db, `rooms/${roomCode}`);
      
      // ルームデータ作成
      await set(roomRef, {
        code: roomCode,
        host: this.playerId,
        status: 'waiting',
        createdAt: Date.now(),
        players: {
          [this.playerId]: {
            id: this.playerId,
            name: data.playerName || 'Player',
            isHost: true,
            isReady: false,
            isSpectator: false,
            joinedAt: Date.now()
          }
        }
      });
      
      // ルーム変更監視
      this.setupRoomListener(roomCode);
      
      this.emit('roomCreated', {
        roomCode: roomCode,
        roomInfo: await this.getRoomInfo(roomCode)
      });
      
    } catch (error) {
      console.error('Failed to create room:', error);
      this.emit('error', 'ルーム作成に失敗しました');
    }
  }
  
  /**
   * ルーム参加
   */
  async joinRoom(data) {
    if (this.isOfflineMode) {
      this.emit('roomJoined', {
        roomCode: 'OFFLINE',
        roomInfo: this.createOfflineRoomInfo(data)
      });
      return;
    }
    
    try {
      const { roomCode, playerName, isSpectator } = data;
      const roomRef = ref(this.db, `rooms/${roomCode}`);
      
      // ルーム存在確認
      const roomSnapshot = await get(roomRef);
      if (!roomSnapshot.exists()) {
        this.emit('error', 'ルームが見つかりません');
        return;
      }
      
      const roomData = roomSnapshot.val();
      
      // プレイヤー追加
      await update(roomRef, {
        [`players/${this.playerId}`]: {
          id: this.playerId,
          name: playerName || 'Player',
          isHost: false,
          isReady: false,
          isSpectator: isSpectator || false,
          joinedAt: Date.now()
        }
      });
      
      // ルーム変更監視
      this.setupRoomListener(roomCode);
      
      this.emit('roomJoined', {
        roomCode: roomCode,
        roomInfo: roomData
      });
      
    } catch (error) {
      console.error('Failed to join room:', error);
      this.emit('error', 'ルーム参加に失敗しました');
    }
  }
  
  /**
   * ルーム退出
   */
  async leaveRoom() {
    if (this.isOfflineMode) {
      this.emit('offlineMode', true);
      return;
    }
    
    try {
      if (this.roomCode && this.playerId) {
        const playerRef = ref(this.db, `rooms/${this.roomCode}/players/${this.playerId}`);
        await set(playerRef, null);
        
        // ルーム監視解除
        if (this.roomRef) {
          off(this.roomRef);
          this.roomRef = null;
        }
        
        this.roomCode = null;
        this.emit('disconnected');
      }
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  }
  
  /**
   * Ready切り替え
   */
  async setReady(isReady) {
    if (this.isOfflineMode || !this.roomCode) return;
    
    try {
      const readyRef = ref(this.db, `rooms/${this.roomCode}/players/${this.playerId}/isReady`);
      await set(readyRef, isReady);
    } catch (error) {
      console.error('Failed to set ready:', error);
    }
  }
  
  /**
   * ゲーム開始
   */
  async startGame() {
    if (this.isOfflineMode || !this.roomCode) return;
    
    try {
      const statusRef = ref(this.db, `rooms/${this.roomCode}/status`);
      await set(statusRef, 'playing');
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  }
  
  /**
   * ゲームアクション送信
   */
  async sendGameAction(action) {
    if (this.isOfflineMode || !this.roomCode) return;
    
    try {
      const actionRef = ref(this.db, `rooms/${this.roomCode}/actions`);
      await push(actionRef, {
        playerId: this.playerId,
        action: action,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to send game action:', error);
    }
  }
  
  /**
   * チャット送信
   */
  async sendChat(message) {
    if (this.isOfflineMode || !this.roomCode) return;
    
    try {
      const chatRef = ref(this.db, `rooms/${this.roomCode}/chat`);
      await push(chatRef, {
        playerId: this.playerId,
        message: message,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to send chat:', error);
    }
  }
  
  /**
   * 名前変更
   */
  async changeName(name) {
    if (this.isOfflineMode || !this.roomCode) return;
    
    try {
      const nameRef = ref(this.db, `rooms/${this.roomCode}/players/${this.playerId}/name`);
      await set(nameRef, name);
    } catch (error) {
      console.error('Failed to change name:', error);
    }
  }
  
  /**
   * ルーム監視設定
   */
  setupRoomListener(roomCode) {
    this.roomCode = roomCode;
    this.roomRef = ref(this.db, `rooms/${roomCode}`);
    
    onValue(this.roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.handleRoomUpdate(data);
      }
    });
    
    // プレイヤー切断時の処理
    const playerRef = ref(this.db, `rooms/${roomCode}/players/${this.playerId}`);
    onDisconnect(playerRef).set(null);
  }
  
  /**
   * ルーム更新処理
   */
  handleRoomUpdate(data) {
    // プレイヤー参加イベント
    if (data.players) {
      Object.keys(data.players).forEach(playerId => {
        if (playerId !== this.playerId) {
          // 新しいプレイヤー検出（簡易実装）
          this.emit('playerJoined', data.players[playerId]);
        }
      });
    }
    
    // ゲームステータス変更
    if (data.status === 'playing') {
      this.emit('gameStarted', { gameState: data });
    }
    
    // チャットメッセージ
    if (data.chat) {
      Object.values(data.chat).forEach(chat => {
        this.emit('chat', chat);
      });
    }
  }
  
  /**
   * ルーム情報取得
   */
  async getRoomInfo(roomCode) {
    const roomRef = ref(this.db, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    return snapshot.val();
  }
  
  /**
   * ルームコード生成
   */
  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  /**
   * オフラインモード用ルーム情報
   */
  createOfflineRoomInfo(data) {
    return {
      code: 'OFFLINE',
      host: this.playerId,
      status: 'waiting',
      players: {
        [this.playerId]: {
          id: this.playerId,
          name: data.playerName || 'Player',
          isHost: true,
          isReady: false,
          isSpectator: false
        }
      }
    };
  }
  
  /**
   * ゲームエンジン設定
   */
  setGameEngine(gameEngine) {
    this.gameEngine = gameEngine;
  }
  
  /**
   * UIマネージャー設定
   */
  setUIManager(uiManager) {
    this.uiManager = uiManager;
  }
  
  /**
   * プレイヤーID取得
   */
  getPlayerId() {
    return this.playerId;
  }
  
  /**
   * 接続状態確認
   */
  isOnline() {
    return this.isConnected && !this.isOfflineMode;
  }
}