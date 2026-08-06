/**
 * ゲームエンジン - ポテト焼きオンライン
 * Canvas描画、ゲームループ、状態管理
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { PotatoRenderer } from './PotatoRenderer.js';
import { StoveRenderer } from './StoveRenderer.js';
import { EffectManager } from '../effects/EffectManager.js';
import { EventManager } from '../events/EventManager.js';

/**
 * ゲームエンジンクラス
 */
export class GameEngine extends EventEmitter {
  constructor(app) {
    super();
    this.app = app;
    
    this.canvas = null;
    this.ctx = null;
    
    this.potatoRenderer = null;
    this.stoveRenderer = null;
    this.effectManager = null;
    this.eventManager = null;
    
    this.isRunning = false;
    this.isPaused = false;
    
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fps = 60;
    this.frameCount = 0;
    this.fpsUpdateTime = 0;
    
    this.gameState = {
      running: false,
      potato: {
        temperature: 20,
        doneness: 0,
        status: 'raw',
        health: 100
      },
      heatLevel: 0,
      timer: 180,
      remainingTime: 180,
      events: [],
      effects: [],
      round: 1,
      score: 0
    };
    
    this.canvasSize = {
      width: 0,
      height: 0
    };
  }
  
  /**
   * 初期化
   */
  async initialize() {
    console.log('Initializing GameEngine...');
    
    // Canvasを取得
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not found');
    }
    
    // Canvasサイズを設定
    this.resizeCanvas();
    
    // レンダラーを初期化
    this.potatoRenderer = new PotatoRenderer(this.ctx);
    this.stoveRenderer = new StoveRenderer(this.ctx);
    this.effectManager = new EffectManager(this.ctx, this.canvas);
    this.eventManager = new EventManager(this);
    
    // イベントリスナーを設定
    this.setupEventListeners();
    
    console.log('GameEngine initialized');
  }
  
  /**
   * イベントリスナーを設定
   */
  setupEventListeners() {
    // アクションボタン
    const actionButtons = document.querySelectorAll('.action-btn[data-action]');
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleAction(action);
      });
      
      // タッチ対応
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const action = e.currentTarget.dataset.action;
        this.handleAction(action);
      });
    });
  }
  
  /**
   * Canvasサイズを調整
   */
  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvasSize.width = container.clientWidth;
    this.canvasSize.height = container.clientHeight;
    
    this.canvas.width = this.canvasSize.width;
    this.canvas.height = this.canvasSize.height;
    
    // 高DPI対応
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvasSize.width * dpr;
    this.canvas.height = this.canvasSize.height * dpr;
    this.ctx.scale(dpr, dpr);
  }
  
  /**
   * リサイズ処理
   */
  handleResize() {
    this.resizeCanvas();
  }
  
  /**
   * ゲームを開始
   * @param {object} initialState - 初期状態
   */
  startGame(initialState) {
    console.log('Starting game with state:', initialState);
    
    this.gameState = {
      ...this.gameState,
      ...initialState,
      running: true
    };
    
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    
    // ゲームループを開始
    this.gameLoop();
    
    this.emit('gameStarted');
  }
  
  /**
   * ゲームを停止
   */
  stopGame() {
    console.log('Stopping game');
    
    this.isRunning = false;
    this.gameState.running = false;
    
    this.emit('gameStopped');
  }
  
  /**
   * ゲームを一時停止
   */
  pauseGame() {
    this.isPaused = true;
  }
  
  /**
   * ゲームを再開
   */
  resumeGame() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }
  
  /**
   * ゲームループ
   */
  gameLoop(currentTime = performance.now()) {
    if (!this.isRunning) return;
    
    // デルタタイムを計算
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // FPSを計算
    this.frameCount++;
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
      this.updateFPSDisplay();
    }
    
    // 一時停止中は更新しない
    if (!this.isPaused) {
      this.update(this.deltaTime);
    }
    
    // 描画
    this.render();
    
    // 次のフレーム
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  /**
   * 更新処理
   * @param {number} deltaTime - デルタタイム（秒）
   */
  update(deltaTime) {
    // タイマーを更新
    if (this.gameState.running) {
      this.gameState.remainingTime -= deltaTime;
      
      if (this.gameState.remainingTime <= 0) {
        this.gameState.remainingTime = 0;
        this.endGame();
      }
    }
    
    // ポテトの状態を更新
    this.updatePotato(deltaTime);
    
    // エフェクトを更新
    this.effectManager.update(deltaTime);
    
    // イベントを更新
    this.eventManager.update(deltaTime);
    
    // UIを更新
    this.updateUI();
  }
  
  /**
   * ポテトの状態を更新
   * @param {number} deltaTime - デルタタイム（秒）
   */
  updatePotato(deltaTime) {
    const { potato, heatLevel } = this.gameState;
    
    // 火力に応じて温度が変化
    if (heatLevel > 0) {
      potato.temperature += heatLevel * 0.05 * deltaTime * 60;
    } else {
      potato.temperature -= 0.5 * deltaTime * 60;
    }
    
    // 温度に応じて焼き加減が変化
    if (potato.temperature > 50) {
      potato.doneness += (potato.temperature - 50) * 0.01 * deltaTime * 60;
    }
    
    // 状態判定
    if (potato.health <= 0) {
      potato.status = 'exploded';
    } else if (potato.temperature > 300) {
      potato.status = 'burnt';
    } else if (potato.doneness >= 100) {
      potato.status = 'perfect';
    } else if (potato.doneness >= 80) {
      potato.status = 'good';
    } else if (potato.doneness >= 20) {
      potato.status = 'cooking';
    } else {
      potato.status = 'raw';
    }
    
    // 温度と焼き加減の制限
    potato.temperature = Math.max(-50, Math.min(500, potato.temperature));
    potato.doneness = Math.max(0, Math.min(100, potato.doneness));
  }
  
  /**
   * 描画処理
   */
  render() {
    // Canvasをクリア
    this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    
    // 背景を描画
    this.renderBackground();
    
    // コンロを描画
    this.stoveRenderer.render(this.gameState.heatLevel, this.canvasSize);
    
    // ポテトを描画
    this.potatoRenderer.render(this.gameState.potato, this.canvasSize);
    
    // エフェクトを描画
    this.effectManager.render();
    
    // イベントを描画
    this.eventManager.render();
  }
  
  /**
   * 背景を描画
   */
  renderBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasSize.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#2a2a4e');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    
    // グリッドを描画
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = 0; x < this.canvasSize.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasSize.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < this.canvasSize.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasSize.width, y);
      this.ctx.stroke();
    }
  }
  
  /**
   * アクションを処理
   * @param {string} actionType - アクションタイプ
   */
  handleAction(actionType) {
    if (!this.gameState.running) return;
    
    console.log('Action:', actionType);
    
    // アクションに応じたエフェクトを追加
    this.effectManager.addActionEffect(actionType);
    
    // ネットワーク経由で送信
    const networkManager = this.app.getNetworkManager();
    if (networkManager && networkManager.isConnected()) {
      networkManager.sendGameAction({
        type: actionType,
        timestamp: Date.now()
      });
    }
    
    // ローカルでも処理
    this.processAction(actionType);
  }
  
  /**
   * アクションを処理
   * @param {string} actionType - アクションタイプ
   */
  processAction(actionType) {
    const { potato } = this.gameState;
    
    switch (actionType) {
      case 'heatUp':
        this.gameState.heatLevel = Math.min(100, this.gameState.heatLevel + 10);
        break;
        
      case 'heatDown':
        this.gameState.heatLevel = Math.max(0, this.gameState.heatLevel - 10);
        break;
        
      case 'addOil':
        potato.temperature += 5;
        break;
        
      case 'addSalt':
        potato.doneness += 2;
        break;
        
      case 'addButter':
        potato.temperature += 3;
        potato.doneness += 1;
        break;
        
      case 'throwIce':
        potato.temperature -= 15;
        break;
        
      case 'addWind':
        this.gameState.heatLevel = Math.max(0, this.gameState.heatLevel - 5);
        break;
        
      case 'addWater':
        potato.temperature -= 20;
        this.gameState.heatLevel = Math.max(0, this.gameState.heatLevel - 20);
        break;
        
      case 'microwave':
        potato.temperature += 30;
        potato.doneness += 5;
        break;
        
      case 'flamethrower':
        this.gameState.heatLevel = Math.min(100, this.gameState.heatLevel + 30);
        potato.temperature += 20;
        break;
        
      case 'fan':
        this.gameState.heatLevel = Math.max(0, this.gameState.heatLevel - 15);
        break;
        
      case 'spaceLaser':
        potato.temperature += 50;
        potato.health -= 10;
        break;
        
      case 'blackHole':
        potato.health -= 20;
        potato.temperature -= 30;
        break;
    }
    
    // 火力100%到達時の演出
    if (this.gameState.heatLevel >= 100) {
      this.triggerHeat100Effect();
    }
  }
  
  /**
   * 火力100%到達時の演出
   */
  triggerHeat100Effect() {
    console.log('Heat level 100% reached!');
    
    // 実績チェック
    const achievementManager = this.app.getAchievementManager();
    achievementManager.unlock('world_burn');
    
    // 演出を開始
    this.effectManager.triggerUniverseCollapse();
  }
  
  /**
   * ゲーム状態を更新（ネットワークから受信）
   * @param {object} newState - 新しいゲーム状態
   */
  updateGameState(newState) {
    this.gameState = {
      ...this.gameState,
      ...newState
    };
  }
  
  /**
   * UIを更新
   */
  updateUI() {
    // 温度表示
    const tempEl = document.getElementById('potato-temperature');
    if (tempEl) {
      tempEl.textContent = `${Math.round(this.gameState.potato.temperature)}°C`;
    }
    
    // 焼き加減表示
    const donenessEl = document.getElementById('potato-doneness');
    if (donenessEl) {
      donenessEl.textContent = `${Math.round(this.gameState.potato.doneness)}%`;
    }
    
    // 火力表示
    const heatEl = document.getElementById('heat-level');
    if (heatEl) {
      heatEl.textContent = `${Math.round(this.gameState.heatLevel)}%`;
    }
    
    // 状態表示
    const statusEl = document.getElementById('potato-status');
    if (statusEl) {
      const statusMap = {
        'raw': '生',
        'cooking': '調理中',
        'good': 'Good',
        'perfect': 'Perfect',
        'burnt': '焦げ',
        'exploded': '爆発'
      };
      statusEl.textContent = statusMap[this.gameState.potato.status] || this.gameState.potato.status;
    }
    
    // タイマー表示
    const timerEl = document.getElementById('game-timer');
    if (timerEl) {
      timerEl.textContent = Math.ceil(this.gameState.remainingTime);
      
      // 残り30秒でアラート
      if (this.gameState.remainingTime <= 30) {
        timerEl.classList.add('timer-alert');
      } else {
        timerEl.classList.remove('timer-alert');
      }
    }
  }
  
  /**
   * FPS表示を更新
   */
  updateFPSDisplay() {
    const fpsEl = document.getElementById('fps-display');
    if (fpsEl) {
      fpsEl.textContent = `${this.fps} FPS`;
    }
  }
  
  /**
   * ゲームを終了
   */
  endGame() {
    console.log('Game ended');
    
    this.stopGame();
    
    // 結果を判定
    const { potato } = this.gameState;
    let result;
    
    if (potato.status === 'perfect' || potato.status === 'good') {
      result = 'win';
    } else {
      result = 'lose';
    }
    
    this.gameState.result = result;
    
    // 実績チェック
    const achievementManager = this.app.getAchievementManager();
    if (result === 'win') {
      if (potato.status === 'perfect') {
        achievementManager.unlock('first_perfect');
      }
    } else {
      if (potato.status === 'exploded') {
        achievementManager.unlock('first_explosion');
      } else if (potato.status === 'burnt') {
        achievementManager.unlock('first_burnt');
      } else if (potato.status === 'raw') {
        achievementManager.unlock('first_raw');
      }
    }
    
    this.emit('gameEnded', {
      result: result,
      potato: potato,
      gameState: this.gameState
    });
  }
  
  /**
   * UIマネージャーを設定
   * @param {UIManager} uiManager - UIマネージャー
   */
  setUIManager(uiManager) {
    this.uiManager = uiManager;
  }
  
  /**
   * ネットワークマネージャーを設定
   * @param {NetworkManager} networkManager - ネットワークマネージャー
   */
  setNetworkManager(networkManager) {
    this.networkManager = networkManager;
  }
  
  /**
   * クリーンアップ
   */
  cleanup() {
    this.stopGame();
    
    if (this.effectManager) {
      this.effectManager.cleanup();
    }
    
    if (this.eventManager) {
      this.eventManager.cleanup();
    }
  }
}
