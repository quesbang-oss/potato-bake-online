/**
 * EventManager - ランダムイベント管理クラス
 * ゲーム中のランダムイベントを管理
 */

export class EventManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    
    this.events = [];
    this.activeEvent = null;
    this.eventTimer = 0;
    this.eventInterval = 10; // 10秒ごとにイベント
  }
  
  /**
   * 更新処理
   * @param {number} deltaTime - デルタタイム（秒）
   */
  update(deltaTime) {
    if (!this.gameEngine.gameState.running) return;
    
    this.eventTimer += deltaTime;
    
    // イベント間隔経過でランダムイベント発生
    if (this.eventTimer >= this.eventInterval) {
      this.eventTimer = 0;
      this.triggerRandomEvent();
    }
    
    // アクティブなイベントを更新
    if (this.activeEvent) {
      this.activeEvent.duration -= deltaTime;
      
      if (this.activeEvent.duration <= 0) {
        this.endEvent();
      }
    }
  }
  
  /**
   * 描画処理
   */
  render() {
    if (this.activeEvent) {
      this.renderEvent();
    }
  }
  
  /**
   * ランダムイベントを発生
   */
  triggerRandomEvent() {
    const eventTypes = [
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
    
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    this.startEvent(randomType);
  }
  
  /**
   * イベントを開始
   * @param {string} eventType - イベントタイプ
   */
  startEvent(eventType) {
    const eventConfig = this.getEventConfig(eventType);
    
    this.activeEvent = {
      type: eventType,
      name: eventConfig.name,
      message: eventConfig.message,
      icon: eventConfig.icon,
      duration: eventConfig.duration,
      effect: eventConfig.effect
    };
    
    // イベント効果を適用
    this.applyEventEffect(this.activeEvent.effect);
    
    // UI通知を表示
    const uiManager = this.gameEngine.app.getUIManager();
    if (uiManager) {
      uiManager.showEventNotification(`${this.activeEvent.icon} ${this.activeEvent.name}`);
    }
    
    // 実績チェック
    const achievementManager = this.gameEngine.app.getAchievementManager();
    if (achievementManager) {
      const achievementMap = {
        'crowAttack': 'crow_attack',
        'catSteal': 'cat_loss',
        'ufoAbduction': 'ufo_loss',
        'blackHole': 'black_hole',
        'volcanicEruption': 'volcano',
        'meteor': 'meteor',
        'giantPotato': 'giant_potato',
        'powerOutage': 'power_outage',
        'gasOutage': 'gas_outage'
      };
      
      const achievementId = achievementMap[eventType];
      if (achievementId) {
        achievementManager.unlock(achievementId);
      }
    }
    
    console.log(`Event started: ${this.activeEvent.name}`);
  }
  
  /**
   * イベントを終了
   */
  endEvent() {
    if (!this.activeEvent) return;
    
    console.log(`Event ended: ${this.activeEvent.name}`);
    this.activeEvent = null;
  }
  
  /**
   * イベント設定を取得
   * @param {string} eventType - イベントタイプ
   * @returns {object} イベント設定
   */
  getEventConfig(eventType) {
    const configs = {
      crowAttack: {
        name: 'カラス来襲',
        message: 'カラスがポテトを狙っている！',
        icon: '🐦',
        duration: 5,
        effect: { doneness: -5 }
      },
      catSteal: {
        name: '猫が奪う',
        message: '猫がポテトを持ち去ろうとしている！',
        icon: '🐱',
        duration: 5,
        effect: { temperature: -10 }
      },
      ufoAbduction: {
        name: 'UFO誘拐',
        message: 'UFOが現れた！',
        icon: '🛸',
        duration: 5,
        effect: { temperature: -20 }
      },
      heavyRain: {
        name: '巨大雨',
        message: '激しい雨が降ってきた！',
        icon: '🌧️',
        duration: 5,
        effect: { temperature: -15, heatLevel: -10 }
      },
      volcanicEruption: {
        name: '火山噴火',
        message: '近くで火山が噴火した！',
        icon: '🌋',
        duration: 5,
        effect: { heatLevel: 30 }
      },
      powerOutage: {
        name: '停電',
        message: '停電した！',
        icon: '💡',
        duration: 3,
        effect: { heatLevel: -100 }
      },
      gasOutage: {
        name: 'ガス切れ',
        message: 'ガスが止まった！',
        icon: '⛽',
        duration: 3,
        effect: { heatLevel: -100 }
      },
      blackHole: {
        name: 'ブラックホール',
        message: 'ブラックホールが現れた！',
        icon: '🕳️',
        duration: 5,
        effect: { health: -10, temperature: -30 }
      },
      meteor: {
        name: '隕石',
        message: '隕石が落ちてきた！',
        icon: '☄️',
        duration: 5,
        effect: { health: -15, temperature: 50 }
      },
      giantPotato: {
        name: '巨大ポテト',
        message: '巨大なポテトが現れた！',
        icon: '🥔',
        duration: 5,
        effect: { health: 20 }
      },
      potatoMultiplication: {
        name: 'ポテト増殖',
        message: 'ポテトが増えた！',
        icon: '🥔',
        duration: 5,
        effect: {}
      },
      grillFall: {
        name: '焼き網落下',
        message: '焼き網が落ちた！',
        icon: '🔥',
        duration: 5,
        effect: { heatLevel: -100, temperature: -30 }
      }
    };
    
    return configs[eventType] || { name: 'Unknown', message: '', icon: '❓', duration: 5, effect: {} };
  }
  
  /**
   * イベント効果を適用
   * @param {object} effect - 効果
   */
  applyEventEffect(effect) {
    const { potato } = this.gameEngine.gameState;
    
    if (effect.doneness !== undefined) {
      potato.doneness += effect.doneness;
    }
    if (effect.temperature !== undefined) {
      potato.temperature += effect.temperature;
    }
    if (effect.health !== undefined) {
      potato.health += effect.health;
    }
    if (effect.heatLevel !== undefined) {
      this.gameEngine.gameState.heatLevel = Math.max(0, 
        this.gameEngine.gameState.heatLevel + effect.heatLevel);
    }
  }
  
  /**
   * イベントを描画
   */
  renderEvent() {
    if (!this.activeEvent) return;
    
    const ctx = this.gameEngine.ctx;
    const canvasSize = this.gameEngine.canvasSize;
    
    // イベントアイコンを描画
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY - 100);
    
    // アイコン
    ctx.font = '64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.activeEvent.icon, 0, 0);
    
    // 名前
    ctx.font = '24px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(this.activeEvent.name, 0, 50);
    
    ctx.restore();
  }
  
  /**
   * クリーンアップ
   */
  cleanup() {
    this.activeEvent = null;
    this.events = [];
  }
}
