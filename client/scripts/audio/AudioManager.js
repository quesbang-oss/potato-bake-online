/**
 * AudioManager - 音声管理クラス
 * BGM、SEの再生と音量管理
 */

export class AudioManager {
  constructor(saveManager) {
    this.saveManager = saveManager;
    
    this.audioContext = null;
    this.bgmVolume = 0.5;
    this.seVolume = 0.5;
    
    this.bgmNodes = new Map();
    this.seNodes = new Map();
    
    this.isInitialized = false;
  }
  
  /**
   * 初期化
   */
  async initialize() {
    console.log('Initializing AudioManager...');
    
    try {
      // AudioContextを作成
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // 設定をロード
      const settings = this.saveManager.loadSettings();
      if (settings) {
        this.bgmVolume = (settings.volumeBgm || 50) / 100;
        this.seVolume = (settings.volumeSe || 50) / 100;
      }
      
      this.isInitialized = true;
      console.log('AudioManager initialized');
      
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
    }
  }
  
  /**
   * 音量を更新
   * @param {object} settings - 設定
   */
  updateVolumes(settings) {
    if (settings.volumeBgm !== undefined) {
      this.bgmVolume = settings.volumeBgm / 100;
    }
    if (settings.volumeSe !== undefined) {
      this.seVolume = settings.volumeSe / 100;
    }
  }
  
  /**
   * 音量を設定
   * @param {string} type - タイプ（bgm/se）
   * @param {number} volume - 音量（0-1）
   */
  setVolume(type, volume) {
    if (type === 'bgm') {
      this.bgmVolume = volume;
    } else if (type === 'se') {
      this.seVolume = volume;
    }
  }
  
  /**
   * BGMを再生
   * @param {string} bgmName - BGM名
   * @param {boolean} loop - ループするかどうか
   */
  playBGM(bgmName, loop = true) {
    if (!this.isInitialized) return;
    
    // 既に再生中の場合は停止
    this.stopBGM(bgmName);
    
    // Web Audio APIでシンセサイザー音を生成（デモ用）
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = this.getBGMFrequency(bgmName);
    gainNode.gain.value = this.bgmVolume * 0.3;
    
    if (loop) {
      oscillator.start();
      this.bgmNodes.set(bgmName, { oscillator, gainNode });
    } else {
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 2);
    }
  }
  
  /**
   * BGMを停止
   * @param {string} bgmName - BGM名
   */
  stopBGM(bgmName) {
    const bgmNode = this.bgmNodes.get(bgmName);
    if (bgmNode) {
      bgmNode.oscillator.stop();
      this.bgmNodes.delete(bgmName);
    }
  }
  
  /**
   * 全BGMを停止
   */
  stopAllBGM() {
    this.bgmNodes.forEach((node, name) => {
      this.stopBGM(name);
    });
  }
  
  /**
   * SEを再生
   * @param {string} seName - SE名
   */
  playSE(seName) {
    if (!this.isInitialized) return;
    
    // Web Audio APIで効果音を生成（デモ用）
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    const seConfig = this.getSEConfig(seName);
    oscillator.type = seConfig.type;
    oscillator.frequency.value = seConfig.frequency;
    gainNode.gain.value = this.seVolume * seConfig.volume;
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + seConfig.duration);
  }
  
  /**
   * BGMの周波数を取得
   * @param {string} bgmName - BGM名
   * @returns {number} 周波数
   */
  getBGMFrequency(bgmName) {
    const frequencies = {
      'menu': 440,
      'lobby': 523.25,
      'game': 659.25,
      'result': 783.99
    };
    return frequencies[bgmName] || 440;
  }
  
  /**
   * SEの設定を取得
   * @param {string} seName - SE名
   * @returns {object} SE設定
   */
  getSEConfig(seName) {
    const configs = {
      'button': { type: 'sine', frequency: 800, volume: 0.3, duration: 0.1 },
      'ready': { type: 'square', frequency: 1000, volume: 0.2, duration: 0.2 },
      'start': { type: 'sawtooth', frequency: 1200, volume: 0.3, duration: 0.5 },
      'action': { type: 'triangle', frequency: 600, volume: 0.2, duration: 0.15 },
      'heatUp': { type: 'sawtooth', frequency: 200, volume: 0.4, duration: 0.3 },
      'heatDown': { type: 'sine', frequency: 150, volume: 0.3, duration: 0.3 },
      'perfect': { type: 'sine', frequency: 1000, volume: 0.5, duration: 0.5 },
      'explosion': { type: 'sawtooth', frequency: 100, volume: 0.6, duration: 1.0 },
      'event': { type: 'square', frequency: 400, volume: 0.4, duration: 0.4 },
      'achievement': { type: 'sine', frequency: 880, volume: 0.5, duration: 0.8 }
    };
    return configs[seName] || { type: 'sine', frequency: 440, volume: 0.3, duration: 0.2 };
  }
  
  /**
   * 全てを一時停止
   */
  pauseAll() {
    if (this.audioContext) {
      this.audioContext.suspend();
    }
  }
  
  /**
   * 全てを再開
   */
  resumeAll() {
    if (this.audioContext) {
      this.audioContext.resume();
    }
  }
  
  /**
   * クリーンアップ
   */
  cleanup() {
    this.stopAllBGM();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
