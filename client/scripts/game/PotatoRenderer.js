/**
 * PotatoRenderer - ポテト描画クラス
 */

export class PotatoRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }
  
  /**
   * ポテトを描画
   * @param {object} potato - ポテト状態
   * @param {object} canvasSize - Canvasサイズ
   */
  render(potato, canvasSize) {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2 - 50;
    const baseSize = 150;
    
    // 状態に応じて色を変える
    const color = this.getPotatoColor(potato);
    
    // ポテトを描画
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    
    // 影
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetY = 10;
    
    // ポテトの本体
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, baseSize, baseSize * 0.7, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    
    // ポテトのテクスチャ
    this.drawPotatoTexture(baseSize);
    
    // 状態に応じたエフェクト
    this.drawPotatoEffects(potato, baseSize);
    
    this.ctx.restore();
  }
  
  /**
   * ポテトの色を取得
   * @param {object} potato - ポテト状態
   * @returns {string} 色
   */
  getPotatoColor(potato) {
    const { temperature, doneness, status } = potato;
    
    switch (status) {
      case 'raw':
        return '#C4A484'; // 生の色
      case 'cooking':
        return '#D4A574'; // 調理中
      case 'good':
        return '#E4B564'; // Good
      case 'perfect':
        return '#F4C654'; // Perfect（黄金色）
      case 'burnt':
        return '#4A3020'; // 焦げた色
      case 'exploded':
        return '#2A1010'; // 爆発後
      default:
        return '#C4A484';
    }
  }
  
  /**
   * ポテトのテクスチャを描画
   * @param {number} size - サイズ
   */
  drawPotatoTexture(size) {
    // ポテトの凹凸
    this.ctx.globalAlpha = 0.1;
    this.ctx.fillStyle = '#000000';
    
    for (let i = 0; i < 10; i++) {
      const x = (Math.random() - 0.5) * size * 1.5;
      const y = (Math.random() - 0.5) * size;
      const radius = Math.random() * 20 + 5;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1.0;
  }
  
  /**
   * ポテトのエフェクトを描画
   * @param {object} potato - ポテト状態
   * @param {number} size - サイズ
   */
  drawPotatoEffects(potato, size) {
    const { status, temperature } = potato;
    
    // 蒸気エフェクト
    if (temperature > 50 && status !== 'burnt' && status !== 'exploded') {
      this.drawSteam(size);
    }
    
    // 焦げエフェクト
    if (status === 'burnt') {
      this.drawBurntEffect(size);
    }
    
    // 爆発エフェクト
    if (status === 'exploded') {
      this.drawExplosionEffect(size);
    }
    
    // Perfectエフェクト
    if (status === 'perfect') {
      this.drawPerfectEffect(size);
    }
  }
  
  /**
   * 蒸気を描画
   * @param {number} size - サイズ
   */
  drawSteam(size) {
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = '#FFFFFF';
    
    for (let i = 0; i < 5; i++) {
      const x = (Math.random() - 0.5) * size;
      const y = -size * 0.5 - Math.random() * 50;
      const radius = Math.random() * 20 + 10;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1.0;
  }
  
  /**
   * 焦げエフェクトを描画
   * @param {number} size - サイズ
   */
  drawBurntEffect(size) {
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = '#000000';
    
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * size * 1.5;
      const y = (Math.random() - 0.5) * size;
      const radius = Math.random() * 15 + 5;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1.0;
  }
  
  /**
   * 爆発エフェクトを描画
   * @param {number} size - サイズ
   */
  drawExplosionEffect(size) {
    // 爆発の光
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
    gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    this.ctx.globalAlpha = 0.8;
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.globalAlpha = 1.0;
  }
  
  /**
   * Perfectエフェクトを描画
   * @param {number} size - サイズ
   */
  drawPerfectEffect(size) {
    // キラキラエフェクト
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = '#FFD700';
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * size * 0.8;
      const y = Math.sin(angle) * size * 0.6;
      const radius = 5;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1.0;
  }
}
