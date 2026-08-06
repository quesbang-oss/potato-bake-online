/**
 * StoveRenderer - コンロ描画クラス
 */

export class StoveRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }
  
  /**
   * コンロを描画
   * @param {number} heatLevel - 火力レベル（0-100）
   * @param {object} canvasSize - Canvasサイズ
   */
  render(heatLevel, canvasSize) {
    const centerX = canvasSize.width / 2;
    const bottomY = canvasSize.height - 50;
    const stoveWidth = 300;
    const stoveHeight = 100;
    
    this.ctx.save();
    this.ctx.translate(centerX, bottomY);
    
    // コンロの本体
    this.drawStoveBody(stoveWidth, stoveHeight);
    
    // 火を描画
    this.drawFire(heatLevel, stoveWidth, stoveHeight);
    
    // 焼き網
    this.drawGrill(stoveWidth, stoveHeight);
    
    this.ctx.restore();
  }
  
  /**
   * コンロの本体を描画
   * @param {number} width - 幅
   * @param {number} height - 高さ
   */
  drawStoveBody(width, height) {
    // コンロのベース
    this.ctx.fillStyle = '#2A2A2A';
    this.ctx.fillRect(-width / 2, -height, width, height);
    
    // コンロの枠
    this.ctx.strokeStyle = '#4A4A4A';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(-width / 2, -height, width, height);
    
    // コンロの脚
    this.ctx.fillStyle = '#3A3A3A';
    const legWidth = 20;
    const legHeight = 30;
    
    this.ctx.fillRect(-width / 2 - legWidth, 0, legWidth, legHeight);
    this.ctx.fillRect(width / 2, 0, legWidth, legHeight);
  }
  
  /**
   * 火を描画
   * @param {number} heatLevel - 火力レベル（0-100）
   * @param {number} width - 幅
   * @param {number} height - 高さ
   */
  drawFire(heatLevel, width, height) {
    if (heatLevel <= 0) return;
    
    const fireHeight = (heatLevel / 100) * 150;
    const fireCount = Math.floor(heatLevel / 10) + 3;
    
    this.ctx.globalAlpha = 0.8;
    
    for (let i = 0; i < fireCount; i++) {
      const x = (i - fireCount / 2) * (width / fireCount);
      const baseY = -height * 0.5;
      const flameHeight = fireHeight * (0.8 + Math.random() * 0.4);
      
      // 炎のグラデーション
      const gradient = this.ctx.createLinearGradient(x, baseY, x, baseY - flameHeight);
      gradient.addColorStop(0, '#FF4500'); // オレンジレッド
      gradient.addColorStop(0.5, '#FF8C00'); // ダークオレンジ
      gradient.addColorStop(1, '#FFD700'); // ゴールド
      
      this.ctx.fillStyle = gradient;
      
      // 炎の形
      this.ctx.beginPath();
      this.ctx.moveTo(x - 15, baseY);
      this.ctx.quadraticCurveTo(x - 10, baseY - flameHeight * 0.5, x, baseY - flameHeight);
      this.ctx.quadraticCurveTo(x + 10, baseY - flameHeight * 0.5, x + 15, baseY);
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1.0;
  }
  
  /**
   * 焼き網を描画
   * @param {number} width - 幅
   * @param {number} height - 高さ
   */
  drawGrill(width, height) {
    const grillY = -height * 0.3;
    const wireCount = 10;
    const wireSpacing = width / wireCount;
    
    this.ctx.strokeStyle = '#5A5A5A';
    this.ctx.lineWidth = 2;
    
    // 横線
    for (let i = 0; i <= wireCount; i++) {
      const x = -width / 2 + i * wireSpacing;
      this.ctx.beginPath();
      this.ctx.moveTo(x, grillY - 5);
      this.ctx.lineTo(x, grillY + 5);
      this.ctx.stroke();
    }
    
    // 縦線
    for (let i = 0; i <= 5; i++) {
      const xOffset = (i - 2.5) * (width / 5);
      this.ctx.beginPath();
      this.ctx.moveTo(xOffset - 20, grillY - 5);
      this.ctx.lineTo(xOffset + 20, grillY + 5);
      this.ctx.stroke();
    }
  }
}
