/**
 * メインJavaScript - ポテト焼きオンライン
 * ゲームのエントリーポイント
 */

// Import CSS files
import '../styles/main.css';
import '../styles/ui.css';
import '../styles/game.css';
import '../styles/animations.css';

import { GameEngine } from './game/GameEngine.js';
import { NetworkManager } from './network/NetworkManager.js';
import { UIManager } from './ui/UIManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { SaveManager } from './data/SaveManager.js';
import { AchievementManager } from './data/AchievementManager.js';

/**
 * アプリケーションクラス
 * 全体の初期化と管理を行う
 */
class Application {
  constructor() {
    this.gameEngine = null;
    this.networkManager = null;
    this.uiManager = null;
    this.audioManager = null;
    this.saveManager = null;
    this.achievementManager = null;
    
    this.isInitialized = false;
    this.isLoading = true;
  }
  
  /**
   * アプリケーションを初期化
   */
  async initialize() {
    try {
      console.log('Initializing Potato Bake Online...');
      
      // セーブマネージャー初期化
      this.saveManager = new SaveManager();
      await this.saveManager.initialize();
      
      // 実績マネージャー初期化
      this.achievementManager = new AchievementManager(this.saveManager);
      await this.achievementManager.initialize();
      
      // オーディオマネージャー初期化
      this.audioManager = new AudioManager(this.saveManager);
      await this.audioManager.initialize();
      
      // ネットワークマネージャー初期化
      this.networkManager = new NetworkManager();
      this.networkManager.initialize();
      
      // UIマネージャー初期化
      this.uiManager = new UIManager(this);
      await this.uiManager.initialize();
      
      // ゲームエンジン初期化
      this.gameEngine = new GameEngine(this);
      await this.gameEngine.initialize();
      
      // マネージャー間の参照を設定
      this.setupManagerReferences();
      
      // イベントリスナーを設定
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('Application initialized successfully');
      
      // ロード画面を非表示
      this.hideLoadingScreen();
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showError('初期化に失敗しました');
    }
  }
  
  /**
   * マネージャー間の参照を設定
   */
  setupManagerReferences() {
    this.networkManager.setGameEngine(this.gameEngine);
    this.networkManager.setUIManager(this.uiManager);
    this.uiManager.setNetworkManager(this.networkManager);
    this.uiManager.setGameEngine(this.gameEngine);
    this.gameEngine.setUIManager(this.uiManager);
    this.gameEngine.setNetworkManager(this.networkManager);
  }
  
  /**
   * イベントリスナーを設定
   */
  setupEventListeners() {
    // ネットワークイベント
    this.networkManager.on('connected', (data) => {
      console.log('Connected to server:', data);
    });
    
    this.networkManager.on('disconnected', () => {
      console.log('Disconnected from server');
      this.uiManager.showNotification('サーバーから切断されました', 'error');
    });
    
    this.networkManager.on('error', (error) => {
      console.error('Network error:', error);
      this.uiManager.showNotification(error, 'error');
    });
    
    this.networkManager.on('offlineMode', (isOffline) => {
      console.log('Offline mode:', isOffline);
      if (isOffline) {
        this.uiManager.showNotification('オフラインモードで動作中（マルチプレイは利用できません）', 'info');
      }
    });
    
    // ゲームイベント
    this.gameEngine.on('gameStarted', () => {
      console.log('Game started');
      this.uiManager.showScreen('game-screen');
    });
    
    this.gameEngine.on('gameEnded', (result) => {
      console.log('Game ended:', result);
      this.uiManager.showGameResult(result);
    });
    
    // ウィンドウイベント
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
    
    window.addEventListener('resize', () => {
      if (this.gameEngine) {
        this.gameEngine.handleResize();
      }
    });
    
    // ページの可視性変更
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.audioManager.pauseAll();
      } else {
        this.audioManager.resumeAll();
      }
    });
  }
  
  /**
   * ロード画面を非表示
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const progress = document.getElementById('loading-progress');
    
    progress.style.width = '100%';
    
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      this.isLoading = false;
      
      // メインメニューを表示
      this.uiManager.showScreen('main-menu');
      
      // ユーザーデータをロード
      this.loadUserData();
      
    }, 500);
  }
  
  /**
   * ユーザーデータをロード
   */
  loadUserData() {
    const userData = this.saveManager.loadUserData();
    if (userData) {
      this.uiManager.updatePlayerInfo(userData);
    }
  }
  
  /**
   * エラーを表示
   * @param {string} message - エラーメッセージ
   */
  showError(message) {
    const loadingText = document.getElementById('loading-text');
    loadingText.textContent = message;
    loadingText.style.color = '#ff0000';
  }
  
  /**
   * クリーンアップ
   */
  cleanup() {
    console.log('Cleaning up application...');
    
    if (this.networkManager) {
      this.networkManager.disconnect();
    }
    
    if (this.audioManager) {
      this.audioManager.cleanup();
    }
    
    if (this.gameEngine) {
      this.gameEngine.cleanup();
    }
    
    if (this.saveManager) {
      this.saveManager.save();
    }
  }
  
  /**
   * マネージャーを取得
   */
  getGameEngine() {
    return this.gameEngine;
  }
  
  getNetworkManager() {
    return this.networkManager;
  }
  
  getUIManager() {
    return this.uiManager;
  }
  
  getAudioManager() {
    return this.audioManager;
  }
  
  getSaveManager() {
    return this.saveManager;
  }
  
  getAchievementManager() {
    return this.achievementManager;
  }
}

// アプリケーションインスタンスを作成
const app = new Application();

// DOM読み込み後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
  });
} else {
  app.initialize();
}

// グローバルにエクスポート（デバッグ用）
window.app = app;

export default app;
