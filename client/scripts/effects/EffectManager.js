/**
 * EffectManager - エフェクト管理クラス
 * パーティクル、視覚エフェクトの管理
 */

export class EffectManager {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    
    this.particles = [];
    this.activeEffects = [];
    
    this.isUniverseCollapsing = false;
    this.universeCollapseStage = 0;
  }
  
  /**
   * 更新処理
   * @param {number} deltaTime - デルタタイム（秒）
   */
  update(deltaTime) {
    // パーティクルを更新
    this.updateParticles(deltaTime);
    
    // アクティブなエフェクトを更新
    this.updateActiveEffects(deltaTime);
    
    // 宇宙崩壊演出を更新
    if (this.isUniverseCollapsing) {
      this.updateUniverseCollapse(deltaTime);
    }
  }
  
  /**
   * 描画処理
   */
  render() {
    // パーティクルを描画
    this.renderParticles();
    
    // アクティブなエフェクトを描画
    this.renderActiveEffects();
    
    // 宇宙崩壊演出を描画
    if (this.isUniverseCollapsing) {
      this.renderUniverseCollapse();
    }
  }
  
  /**
   * アクションエフェクトを追加
   * @param {string} actionType - アクションタイプ
   */
  addActionEffect(actionType) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    switch (actionType) {
      case 'heatUp':
        this.addFireParticles(centerX, centerY + 100, 10);
        break;
        
      case 'heatDown':
        this.addIceParticles(centerX, centerY + 100, 5);
        break;
        
      case 'addOil':
        this.addOilDrops(centerX, centerY, 8);
        break;
        
      case 'addSalt':
        this.addSaltParticles(centerX, centerY, 15);
        break;
        
      case 'addButter':
        this.addButterParticles(centerX, centerY, 6);
        break;
        
      case 'throwIce':
        this.addIceExplosion(centerX, centerY);
        break;
        
      case 'addWater':
        this.addWaterSplash(centerX, centerY + 100);
        break;
        
      case 'microwave':
        this.addMicrowaveEffect(centerX, centerY);
        break;
        
      case 'flamethrower':
        this.addFlamethrowerEffect(centerX, centerY + 100);
        break;
        
      case 'spaceLaser':
        this.addLaserEffect(centerX, centerY);
        break;
        
      case 'blackHole':
        this.addBlackHoleEffect(centerX, centerY);
        break;
    }
  }
  
  /**
   * 炎パーティクルを追加
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @param {number} count - 数
   */
  addFireParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'fire',
        x: x + (Math.random() - 0.5) * 50,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        life: 1.0,
        maxLife: 1.0,
        size: Math.random() * 10 + 5,
        color: `hsl(${Math.random() * 30 + 10}, 100%, 50%)`
      });
    }
  }
  
  /**
   * 氷パーティクルを追加
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @param {number} count - 数
   */
  addIceParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'ice',
        x: x + (Math.random() - 0.5) * 50,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2,
        life: 1.0,
        maxLife: 1.0,
        size: Math.random() * 8 + 3,
        color: '#00BFFF'
      });
    }
  }
  
  /**
   * 油滴を追加
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @param {number} count - 数
   */
  addOilDrops(x, y, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'oil',
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 1,
        vy: Math.random() * 2,
        life: 1.0,
        maxLife: 1.0,
        size: Math.random() * 6 + 2,
        color: '#FFD700'
      });
    }
  }
  
  /**
   * 塩パーティクルを追加
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @param {number} count - 数
   */
  addSaltParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'salt',
        x: x + (Math.random() - 0.5) * 150,
        y: y + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 1.0,
        maxLife: 1.0,
        size: Math.random() * 3 + 1,
        color: '#FFFFFF'
      });
    }
  }
  
  /**
   * バターパーティクルを追加
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @param {number} count - 数
   */
  addButterParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'butter',
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 1,
        vy: Math.random() * 1,
        life: 1.0,
        maxLife: 1.0,
        size: Math.random() * 10 + 5,
        color: '#FFAA00'
      });
    }
  }
  
  /**
   * 氷爆発エフェクト
   * @param {number} x - X座標
   * @param {number} y - Y座標
   */
  addIceExplosion(x, y) {
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      
      this.particles.push({
        type: 'ice',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 1.0,
        size: Math.random() * 8 + 4,
        color: '#00BFFF'
      });
    }
  }
  
  /**
   * 水しぶきエフェクト
   * @param {number} x - X座標
   * @param {number} y - Y座標
   */
  addWaterSplash(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI;
      const speed = Math.random() * 4 + 2;
      
      this.particles.push({
        type: 'water',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 1.0,
        size: Math.random() * 6 + 3,
        color: '#4169E1'
      });
    }
  }
  
  /**
   * 電子レンジエフェクト
   * @param {number} x - X座標
   * @param {number} y - Y座標
   */
  addMicrowaveEffect(x, y) {
    this.activeEffects.push({
      type: 'microwave',
      x: x,
      y: y,
      life: 0.5,
      maxLife: 0.5,
      radius: 0,
      maxRadius: 100
    });
  }
  
  /**
   * 火炎放射器エフェクト
   * @param {number} x - X座標
   * @param {number} y - Y座標
   */
  addFlamethrowerEffect(x, y) {
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        type: 'fire',
        x: x + (Math.random() - 0.5) * 30,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 8 - 5,
        life: 1.0,
        maxLife: 1.0,
        size: Math.random() * 15 + 5,
        color: `hsl(${Math.random() * 20 + 20}, 100%, 60%)`
      });
    }
  }
  
  /**
   * レーザーエフェクト
   * @param {number} x - X座標
   * @param {number} y - Y座標
   */
  addLaserEffect(x, y) {
    this.activeEffects.push({
      type: 'laser',
      x: x,
      y: y,
      life: 0.3,
      maxLife: 0.3,
      width: 5
    });
  }
  
  /**
   * ブラックホールエフェクト
   * @param {number} x - X座標
   * @param {number} y - Y座標
   */
  addBlackHoleEffect(x, y) {
    this.activeEffects.push({
      type: 'blackhole',
      x: x,
      y: y,
      life: 2.0,
      maxLife: 2.0,
      radius: 0,
      maxRadius: 80
    });
    
    // ブラックホールに吸い込まれるパーティクル
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      
      this.particles.push({
        type: 'blackhole_particle',
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        life: 2.0,
        maxLife: 2.0,
        size: Math.random() * 4 + 2,
        color: '#9400D3',
        targetX: x,
        targetY: y
      });
    }
  }
  
  /**
   * 宇宙崩壊演出を開始
   */
  triggerUniverseCollapse() {
    if (this.isUniverseCollapsing) return;
    
    this.isUniverseCollapsing = true;
    this.universeCollapseStage = 0;
  }
  
  /**
   * 宇宙崩壊演出を更新
   * @param {number} deltaTime - デルタタイム（秒）
   */
  updateUniverseCollapse(deltaTime) {
    this.universeCollapseStage += deltaTime;
    
    // ステージに応じた演出
    if (this.universeCollapseStage < 2) {
      // コンロ巨大化
    } else if (this.universeCollapseStage < 4) {
      // 家燃える
    } else if (this.universeCollapseStage < 6) {
      // 街燃える
    } else if (this.universeCollapseStage < 8) {
      // 地球燃える
    } else if (this.universeCollapseStage < 10) {
      // 銀河燃える
    } else if (this.universeCollapseStage < 12) {
      // 宇宙崩壊
    } else {
      // 終了
      this.isUniverseCollapsing = false;
      this.universeCollapseStage = 0;
    }
  }
  
  /**
   * 宇宙崩壊演出を描画
   */
  renderUniverseCollapse() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // ステージに応じた描画
    if (this.universeCollapseStage < 2) {
      // コンロ巨大化
      this.ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (this.universeCollapseStage < 4) {
      // 家燃える
      this.ctx.fillStyle = 'rgba(255, 50, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (this.universeCollapseStage < 6) {
      // 街燃える
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (this.universeCollapseStage < 8) {
      // 地球燃える
      const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.canvas.width);
      gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (this.universeCollapseStage < 10) {
      // 銀河燃える
      const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.canvas.width);
      gradient.addColorStop(0, 'rgba(255, 0, 100, 0.9)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      // 宇宙崩壊
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // 最後のメッセージ
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '32px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('まだ芯が冷たい。', centerX, centerY);
    }
  }
  
  /**
   * パーティクルを更新
   * @param {number} deltaTime - デルタタイム（秒）
   */
  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // 位置を更新
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // ブラックホールパーティクルは中心に向かう
      if (particle.type === 'blackhole_particle') {
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 5) {
          particle.vx += (dx / dist) * 2;
          particle.vy += (dy / dist) * 2;
        }
      }
      
      // 寿命を減らす
      particle.life -= deltaTime;
      
      // 死亡したパーティクルを削除
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  /**
   * アクティブなエフェクトを更新
   * @param {number} deltaTime - デルタタイム（秒）
   */
  updateActiveEffects(deltaTime) {
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      
      effect.life -= deltaTime;
      
      // エフェクト固有の更新
      if (effect.type === 'microwave' || effect.type === 'blackhole') {
        effect.radius = (1 - effect.life / effect.maxLife) * effect.maxRadius;
      }
      
      if (effect.life <= 0) {
        this.activeEffects.splice(i, 1);
      }
    }
  }
  
  /**
   * パーティクルを描画
   */
  renderParticles() {
    this.particles.forEach(particle => {
      this.ctx.globalAlpha = particle.life / particle.maxLife;
      this.ctx.fillStyle = particle.color;
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.globalAlpha = 1.0;
  }
  
  /**
   * アクティブなエフェクトを描画
   */
  renderActiveEffects() {
    this.activeEffects.forEach(effect => {
      this.ctx.globalAlpha = effect.life / effect.maxLife;
      
      switch (effect.type) {
        case 'microwave':
          this.ctx.strokeStyle = '#00FFFF';
          this.ctx.lineWidth = 3;
          this.ctx.beginPath();
          this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
          this.ctx.stroke();
          break;
          
        case 'laser':
          this.ctx.strokeStyle = '#FF00FF';
          this.ctx.lineWidth = effect.width;
          this.ctx.beginPath();
          this.ctx.moveTo(effect.x, 0);
          this.ctx.lineTo(effect.x, this.canvas.height);
          this.ctx.stroke();
          break;
          
        case 'blackhole':
          const gradient = this.ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius);
          gradient.addColorStop(0, '#000000');
          gradient.addColorStop(0.5, '#4B0082');
          gradient.addColorStop(1, 'transparent');
          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
          this.ctx.fill();
          break;
      }
    });
    
    this.ctx.globalAlpha = 1.0;
  }
  
  /**
   * クリーンアップ
   */
  cleanup() {
    this.particles = [];
    this.activeEffects = [];
    this.isUniverseCollapsing = false;
  }
}
