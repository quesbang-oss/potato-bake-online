/**
 * SaveManager - セーブ管理クラス
 * ユーザーデータ、設定、実績の保存と読み込み
 */

export class SaveManager {
  constructor() {
    this.saveKey = 'potatoBakeOnline_save';
    this.saveData = {
      name: 'Player',
      totalGames: 0,
      perfectCount: 0,
      explodedCount: 0,
      burntCount: 0,
      achievements: [],
      settings: {
        volumeBgm: 50,
        volumeSe: 50,
        quality: 'high',
        language: 'ja'
      },
      lastPlayed: null
    };
  }
  
  /**
   * 初期化
   */
  async initialize() {
    console.log('Initializing SaveManager...');
    this.load();
  }
  
  /**
   * データをロード
   */
  load() {
    try {
      const saved = localStorage.getItem(this.saveKey);
      if (saved) {
        this.saveData = {
          ...this.saveData,
          ...JSON.parse(saved)
        };
        console.log('Save data loaded');
      }
    } catch (error) {
      console.error('Failed to load save data:', error);
    }
  }
  
  /**
   * データを保存
   */
  save() {
    try {
      this.saveData.lastPlayed = new Date().toISOString();
      localStorage.setItem(this.saveKey, JSON.stringify(this.saveData));
      console.log('Save data saved');
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }
  
  /**
   * ユーザーデータを取得
   * @returns {object} ユーザーデータ
   */
  loadUserData() {
    return {
      name: this.saveData.name,
      totalGames: this.saveData.totalGames,
      perfectCount: this.saveData.perfectCount,
      explodedCount: this.saveData.explodedCount,
      burntCount: this.saveData.burntCount
    };
  }
  
  /**
   * 設定を取得
   * @returns {object} 設定
   */
  loadSettings() {
    return this.saveData.settings;
  }
  
  /**
   * 設定を保存
   * @param {object} settings - 設定
   */
  saveSettings(settings) {
    this.saveData.settings = {
      ...this.saveData.settings,
      ...settings
    };
    this.save();
  }
  
  /**
   * 名前を更新
   * @param {string} name - 名前
   */
  updateName(name) {
    this.saveData.name = name;
    this.save();
  }
  
  /**
   * ゲーム統計を更新
   * @param {object} stats - 統計データ
   */
  updateStats(stats) {
    if (stats.totalGames !== undefined) {
      this.saveData.totalGames = stats.totalGames;
    }
    if (stats.perfectCount !== undefined) {
      this.saveData.perfectCount = stats.perfectCount;
    }
    if (stats.explodedCount !== undefined) {
      this.saveData.explodedCount = stats.explodedCount;
    }
    if (stats.burntCount !== undefined) {
      this.saveData.burntCount = stats.burntCount;
    }
    this.save();
  }
  
  /**
   * 実績を追加
   * @param {string} achievementId - 実績ID
   */
  addAchievement(achievementId) {
    if (!this.saveData.achievements.includes(achievementId)) {
      this.saveData.achievements.push(achievementId);
      this.save();
    }
  }
  
  /**
   * 実績を取得
   * @returns {Array<string>} 実績ID配列
   */
  getAchievements() {
    return this.saveData.achievements;
  }
  
  /**
   * 全データを削除
   */
  clearAll() {
    localStorage.removeItem(this.saveKey);
    this.saveData = {
      name: 'Player',
      totalGames: 0,
      perfectCount: 0,
      explodedCount: 0,
      burntCount: 0,
      achievements: [],
      settings: {
        volumeBgm: 50,
        volumeSe: 50,
        quality: 'high',
        language: 'ja'
      },
      lastPlayed: null
    };
  }
}
