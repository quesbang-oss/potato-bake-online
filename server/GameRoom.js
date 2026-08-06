/**
 * ゲームルームクラス
 * 個別のルームの状態を管理
 */
export class GameRoom {
  constructor(roomCode, hostId, options = {}) {
    this.code = roomCode;
    this.hostId = hostId;
    this.options = options;
    
    this.players = new Map();
    this.gameState = {
      running: false,
      potato: {
        temperature: 20, // 初期温度（摂氏）
        doneness: 0, // 焼き加減（0-100）
        status: 'raw', // raw, cooking, perfect, burnt, exploded
        health: 100 // ポテトのHP
      },
      heatLevel: 0, // 火力レベル（0-100）
      timer: 180, // 制限時間（秒）
      remainingTime: 180,
      events: [], // アクティブなイベント
      effects: [], // アクティブなエフェクト
      round: 1,
      score: 0
    };
    
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
  }
  
  /**
   * プレイヤーを追加
   * @param {string} playerId - プレイヤーID
   * @param {object} playerData - プレイヤーデータ
   */
  addPlayer(playerId, playerData) {
    this.players.set(playerId, {
      ...playerData,
      joinedAt: Date.now(),
      score: 0,
      actions: []
    });
    this.lastActivity = Date.now();
  }
  
  /**
   * プレイヤーを削除
   * @param {string} playerId - プレイヤーID
   */
  removePlayer(playerId) {
    this.players.delete(playerId);
    this.lastActivity = Date.now();
  }
  
  /**
   * プレイヤーを取得
   * @param {string} playerId - プレイヤーID
   * @returns {object|null} プレイヤーデータ
   */
  getPlayer(playerId) {
    return this.players.get(playerId) || null;
  }
  
  /**
   * ホストかどうかを確認
   * @param {string} playerId - プレイヤーID
   * @returns {boolean} ホストかどうか
   */
  isHost(playerId) {
    const player = this.players.get(playerId);
    return player && player.isHost;
  }
  
  /**
   * ホストが存在するか確認
   * @returns {boolean} ホストが存在するか
   */
  hasHost() {
    for (const player of this.players.values()) {
      if (player.isHost) return true;
    }
    return false;
  }
  
  /**
   * ホストを設定
   * @param {string} playerId - 新しいホストのプレイヤーID
   */
  setHost(playerId) {
    // 全プレイヤーのホストフラグを解除
    this.players.forEach(player => {
      player.isHost = false;
    });
    
    // 新しいホストを設定
    const player = this.players.get(playerId);
    if (player) {
      player.isHost = true;
      this.hostId = playerId;
    }
  }
  
  /**
   * プレイヤーのReady状態を設定
   * @param {string} playerId - プレイヤーID
   * @param {boolean} isReady - Ready状態
   */
  setPlayerReady(playerId, isReady) {
    const player = this.players.get(playerId);
    if (player && !player.isSpectator) {
      player.isReady = isReady;
      this.lastActivity = Date.now();
    }
  }
  
  /**
   * プレイヤー名を設定
   * @param {string} playerId - プレイヤーID
   * @param {string} name - 新しい名前
   */
  setPlayerName(playerId, name) {
    const player = this.players.get(playerId);
    if (player) {
      player.name = name;
      this.lastActivity = Date.now();
    }
  }
  
  /**
   * ゲーム開始可能か確認
   * @returns {boolean} ゲーム開始可能か
   */
  canStartGame() {
    if (this.players.size < 2) return false;
    
    let allReady = true;
    this.players.forEach(player => {
      if (!player.isSpectator && !player.isReady) {
        allReady = false;
      }
    });
    
    return allReady;
  }
  
  /**
   * ゲームを開始
   */
  startGame() {
    this.gameState.running = true;
    this.gameState.remainingTime = this.gameState.timer;
    this.gameState.round = 1;
    this.gameState.potato = {
      temperature: 20,
      doneness: 0,
      status: 'raw',
      health: 100
    };
    this.gameState.heatLevel = 0;
    this.gameState.events = [];
    this.gameState.effects = [];
    
    // 全プレイヤーのスコアをリセット
    this.players.forEach(player => {
      player.score = 0;
      player.actions = [];
    });
    
    this.lastActivity = Date.now();
    console.log(`Game started in room ${this.code}`);
  }
  
  /**
   * ゲームが実行中か確認
   * @returns {boolean} ゲーム実行中か
   */
  isGameRunning() {
    return this.gameState.running;
  }
  
  /**
   * ゲームアクションを処理
   * @param {string} playerId - プレイヤーID
   * @param {object} action - アクションデータ
   */
  handleGameAction(playerId, action) {
    const player = this.players.get(playerId);
    if (!player) return;
    
    // アクションを記録
    player.actions.push({
      type: action.type,
      timestamp: Date.now()
    });
    
    // アクションに応じてゲーム状態を更新
    this.processAction(action);
    
    this.lastActivity = Date.now();
  }
  
  /**
   * アクションを処理してゲーム状態を更新
   * @param {object} action - アクションデータ
   */
  processAction(action) {
    switch (action.type) {
      case 'heatUp':
        this.gameState.heatLevel = Math.min(100, this.gameState.heatLevel + (action.value || 10));
        break;
        
      case 'heatDown':
        this.gameState.heatLevel = Math.max(0, this.gameState.heatLevel - (action.value || 10));
        break;
        
      case 'addOil':
        this.gameState.potato.temperature += 5;
        break;
        
      case 'addSalt':
        this.gameState.potato.doneness += 2;
        break;
        
      case 'addButter':
        this.gameState.potato.temperature += 3;
        this.gameState.potato.doneness += 1;
        break;
        
      case 'throwIce':
        this.gameState.potato.temperature -= 15;
        break;
        
      case 'addWind':
        this.gameState.heatLevel = Math.max(0, this.gameState.heatLevel - 5);
        break;
        
      case 'addWater':
        this.gameState.potato.temperature -= 20;
        this.gameState.heatLevel = Math.max(0, this.gameState.heatLevel - 20);
        break;
        
      case 'microwave':
        this.gameState.potato.temperature += 30;
        this.gameState.potato.doneness += 5;
        break;
        
      case 'flamethrower':
        this.gameState.heatLevel = Math.min(100, this.gameState.heatLevel + 30);
        this.gameState.potato.temperature += 20;
        break;
        
      case 'fan':
        this.gameState.heatLevel = Math.max(0, this.gameState.heatLevel - 15);
        break;
        
      case 'spaceLaser':
        this.gameState.potato.temperature += 50;
        this.gameState.potato.health -= 10;
        break;
        
      case 'blackHole':
        this.gameState.potato.health -= 20;
        this.gameState.potato.temperature -= 30;
        break;
        
      default:
        console.log(`Unknown action type: ${action.type}`);
    }
    
    // ポテトの状態を更新
    this.updatePotatoState();
  }
  
  /**
   * ポテトの状態を更新
   */
  updatePotatoState() {
    const { potato, heatLevel } = this.gameState;
    
    // 火力に応じて温度が変化
    if (heatLevel > 0) {
      potato.temperature += heatLevel * 0.05;
    } else {
      potato.temperature -= 0.5; // 自然冷却
    }
    
    // 温度に応じて焼き加減が変化
    if (potato.temperature > 50) {
      potato.doneness += (potato.temperature - 50) * 0.01;
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
   * ゲーム状態を更新（タイマーなど）
   * @param {number} deltaTime - 経過時間（秒）
   */
  update(deltaTime) {
    if (!this.gameState.running) return;
    
    this.gameState.remainingTime -= deltaTime;
    
    // ポテトの状態を更新
    this.updatePotatoState();
    
    // ゲーム終了判定
    if (this.gameState.remainingTime <= 0) {
      this.endGame();
    }
    
    this.lastActivity = Date.now();
  }
  
  /**
   * ゲームを終了
   */
  endGame() {
    this.gameState.running = false;
    
    const { potato } = this.gameState;
    let result;
    
    if (potato.status === 'perfect' || potato.status === 'good') {
      result = 'win';
    } else {
      result = 'lose';
    }
    
    this.gameState.result = result;
    
    // プレイヤーの統計を更新
    this.players.forEach(player => {
      if (!player.isSpectator) {
        if (result === 'win') {
          if (potato.status === 'perfect') {
            player.perfectCount = (player.perfectCount || 0) + 1;
          }
        } else {
          if (potato.status === 'exploded') {
            player.explodedCount = (player.explodedCount || 0) + 1;
          } else if (potato.status === 'burnt') {
            player.burntCount = (player.burntCount || 0) + 1;
          }
        }
        player.totalGames = (player.totalGames || 0) + 1;
      }
    });
    
    console.log(`Game ended in room ${this.code}. Result: ${result}`);
  }
  
  /**
   * ランダムイベントを発生
   */
  triggerRandomEvent() {
    if (!this.gameState.running) return;
    
    const events = [
      'crowAttack',
      'catSteal',
      'ufoAbduction',
      'heavyRain',
      'volcanicEruption',
      'powerOutage',
      'gasOutage',
      'blackHole',
      'meteor',
      'giantPotato',
      'potatoMultiplication',
      'grillFall'
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    this.gameState.events.push({
      type: randomEvent,
      startTime: Date.now(),
      duration: 5000 // 5秒間
    });
    
    // イベントの効果を適用
    this.applyEventEffect(randomEvent);
  }
  
  /**
   * イベント効果を適用
   * @param {string} eventType - イベントタイプ
   */
  applyEventEffect(eventType) {
    switch (eventType) {
      case 'crowAttack':
        this.gameState.potato.doneness -= 5;
        break;
        
      case 'catSteal':
        this.gameState.potato.temperature -= 10;
        break;
        
      case 'ufoAbduction':
        this.gameState.potato.temperature -= 20;
        break;
        
      case 'heavyRain':
        this.gameState.potato.temperature -= 15;
        this.gameState.heatLevel = Math.max(0, this.gameState.heatLevel - 10);
        break;
        
      case 'volcanicEruption':
        this.gameState.heatLevel = Math.min(100, this.gameState.heatLevel + 30);
        break;
        
      case 'powerOutage':
        this.gameState.heatLevel = 0;
        break;
        
      case 'gasOutage':
        this.gameState.heatLevel = 0;
        break;
        
      case 'blackHole':
        this.gameState.potato.health -= 10;
        break;
        
      case 'meteor':
        this.gameState.potato.health -= 15;
        this.gameState.potato.temperature += 50;
        break;
        
      case 'giantPotato':
        this.gameState.potato.health += 20;
        break;
        
      case 'potatoMultiplication':
        // ポテトが増える演出用
        break;
        
      case 'grillFall':
        this.gameState.heatLevel = 0;
        this.gameState.potato.temperature -= 30;
        break;
    }
  }
  
  /**
   * 公開情報を取得
   * @returns {object} ルームの公開情報
   */
  getPublicInfo() {
    return {
      code: this.code,
      hostId: this.hostId,
      playerCount: this.players.size,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        isSpectator: p.isSpectator
      })),
      gameState: this.gameState.running ? this.getGameState() : null,
      createdAt: this.createdAt
    };
  }
  
  /**
   * ゲーム状態を取得
   * @returns {object} ゲーム状態
   */
  getGameState() {
    return {
      running: this.gameState.running,
      potato: this.gameState.potato,
      heatLevel: this.gameState.heatLevel,
      timer: this.gameState.timer,
      remainingTime: this.gameState.remainingTime,
      events: this.gameState.events,
      effects: this.gameState.effects,
      round: this.gameState.round,
      score: this.gameState.score,
      result: this.gameState.result
    };
  }
}
