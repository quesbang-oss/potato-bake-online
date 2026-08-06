/**
 * AchievementManager - 実績管理クラス
 * 実績の定義、解除、チェック
 */

export class AchievementManager {
  constructor(saveManager) {
    this.saveManager = saveManager;
    
    this.achievements = this.defineAchievements();
    this.unlockedAchievements = [];
  }
  
  /**
   * 初期化
   */
  async initialize() {
    console.log('Initializing AchievementManager...');
    this.unlockedAchievements = this.saveManager.getAchievements();
  }
  
  /**
   * 実績を定義
   * @returns {Array} 実績定義配列
   */
  defineAchievements() {
    return [
      // 基本実績
      { id: 'first_game', name: '初めてのポテト', description: '初めてゲームをプレイ', icon: '🥔' },
      { id: 'first_perfect', name: 'パーフェクト', description: '初めてPerfectを達成', icon: '⭐' },
      { id: 'first_burnt', name: '焦がしちゃった', description: '初めてポテトを焦がす', icon: '🔥' },
      { id: 'first_raw', name: 'まだ生', description: '時間切れで生のまま', icon: '🥶' },
      { id: 'first_explosion', name: '爆発', description: '初めてポテトを爆発させる', icon: '💥' },
      
      // 回数実績
      { id: 'perfect_10', name: '完璧主義者', description: 'Perfectを10回達成', icon: '🌟' },
      { id: 'perfect_50', name: 'ポテトマスター', description: 'Perfectを50回達成', icon: '👑' },
      { id: 'perfect_100', name: '伝説のシェフ', description: 'Perfectを100回達成', icon: '🏆' },
      { id: 'games_10', name: '常連', description: '10回ゲームをプレイ', icon: '🎮' },
      { id: 'games_50', name: '熱狂的ファン', description: '50回ゲームをプレイ', icon: '🎯' },
      { id: 'games_100', name: 'ポテト愛好家', description: '100回ゲームをプレイ', icon: '❤️' },
      
      // 特殊実績
      { id: 'world_burn', name: '世界を燃やした', description: '火力100%到達', icon: '🌍' },
      { id: 'galaxy_burn', name: '銀河を燃やした', description: '銀河崩壊演出を見る', icon: '🌌' },
      { id: 'black_hole', name: 'ブラックホール誕生', description: 'ブラックホールイベント発生', icon: '🕳️' },
      { id: 'cat_loss', name: '猫に負けた', description: '猫イベントで負ける', icon: '🐱' },
      { id: 'ufo_loss', name: 'UFOに連れ去られた', description: 'UFOイベント発生', icon: '🛸' },
      { id: 'crow_attack', name: 'カラスの襲撃', description: 'カラスイベント発生', icon: '🐦' },
      
      // イベント実績
      { id: 'all_events', name: 'フルコンボ', description: '全てのイベントを経験', icon: '🎪' },
      { id: 'volcano', name: '火山噴火', description: '火山噴火イベント発生', icon: '🌋' },
      { id: 'meteor', name: '隕石衝突', description: '隕石イベント発生', icon: '☄️' },
      { id: 'giant_potato', name: '巨大ポテト', description: '巨大ポテトイベント発生', icon: '🥔' },
      { id: 'power_outage', name: '停電', description: '停電イベント発生', icon: '💡' },
      { id: 'gas_outage', name: 'ガス切れ', description: 'ガス切レベント発生', icon: '⛽' },
      
      // アクション実績
      { id: 'heat_master', name: '火力調整名人', description: '火力UP/DOWNを100回使用', icon: '🔥' },
      { id: 'seasoning_master', name: '調味料マスター', description: '全ての調味料を使用', icon: '🧂' },
      { id: 'ice_cold', name: '氷の達人', description: '氷を50回使用', icon: '🧊' },
      { id: 'microwave_chef', name: '電子レンジ主義', description: '電子レンジを30回使用', icon: '📦' },
      { id: 'flamethrower', name: '火炎放射器', description: '火炎放射器を20回使用', icon: '🔫' },
      { id: 'space_laser', name: '宇宙レーザー', description: '宇宙レーザーを10回使用', icon: '🔦' },
      
      // コンボ実績
      { id: 'combo_10', name: '10コンボ', description: '10コンボ達成', icon: '🔢' },
      { id: 'combo_50', name: '50コンボ', description: '50コンボ達成', icon: '💯' },
      { id: 'combo_100', name: '100コンボ', description: '100コンボ達成', icon: '🎉' },
      
      // チーム実績
      { id: 'team_perfect', name: 'チームワーク', description: '全員Perfectで勝利', icon: '🤝' },
      { id: 'perfect_streak_5', name: '連勝記録', description: '5連続Perfect達成', icon: '📈' },
      { id: 'save_burnt', name: '救出劇', description: '焦げそうなのをPerfectに', icon: '🚒' },
      
      // シチュエーション実績
      { id: 'last_second', name: 'ギリギリセーフ', description: '残り1秒でPerfect', icon: '⏰' },
      { id: 'temperature_zero', name: '絶対零度', description: '温度を-30度以下に', icon: '❄️' },
      { id: 'temperature_max', name: '太陽より熱い', description: '温度を400度以上に', icon: '☀️' },
      { id: 'health_save', name: '瀕死の復活', description: 'HP1から復活', icon: '💚' },
      
      // マルチプレイ実績
      { id: 'max_players', name: '満員御礼', description: '10人でプレイ', icon: '👥' },
      { id: 'host_50', name: 'ホストの威厳', description: '50回ホストを務める', icon: '🎩' },
      { id: 'spectator', name: '観戦者', description: '観戦モードを使用', icon: '👀' },
      
      // その他実績
      { id: 'night_owl', name: '夜更かし', description: '深夜にプレイ', icon: '🦉' },
      { id: 'early_bird', name: '早起き', description: '早朝にプレイ', icon: '🐓' },
      { id: 'weekend_warrior', name: '週末戦士', description: '週末に10回プレイ', icon: '📅' },
      { id: 'chatter', name: 'おしゃべり', description: 'チャットを100回送信', icon: '💬' },
      { id: 'name_change', name: '名無しの権兵衛', description: '名前を10回変更', icon: '📝' },
      
      // 隠し実績
      { id: 'secret_potato', name: 'ポテトの秘密', description: 'ある操作を行う', icon: '🔮' },
      { id: 'secret_universe', name: '宇宙の真理', description: '宇宙崩壊後も操作', icon: '🌠' },
      { id: 'secret_cold', name: 'まだ芯が冷たい', description: '宇宙崩壊演出を見る', icon: '🧊' },
      
      // 統計実績
      { id: 'total_time_1h', name: '1時間プレイ', description: '総プレイ時間1時間達成', icon: '⏱️' },
      { id: 'total_time_10h', name: '10時間プレイ', description: '総プレイ時間10時間達成', icon: '🕰️' },
      { id: 'total_time_100h', name: '100時間プレイ', description: '総プレイ時間100時間達成', icon: '⌛' },
      
      // ランキング実績
      { id: 'rank_top_100', name: '上位100入り', description: '世界ランキング100位以内', icon: '🥇' },
      { id: 'rank_top_10', name: '上位10入り', description: '世界ランキング10位以内', icon: '🏅' },
      { id: 'rank_top_1', name: '世界一', description: '世界ランキング1位', icon: '👑' }
    ];
  }
  
  /**
   * 実績を解除
   * @param {string} achievementId - 実績ID
   * @returns {boolean} 解除成功かどうか
   */
  unlock(achievementId) {
    // 既に解除済みの場合
    if (this.unlockedAchievements.includes(achievementId)) {
      return false;
    }
    
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) {
      return false;
    }
    
    // 実績を解除
    this.unlockedAchievements.push(achievementId);
    this.saveManager.addAchievement(achievementId);
    
    console.log(`Achievement unlocked: ${achievement.name}`);
    
    // 通知を表示（UIマネージャー経由）
    // 実際の実装ではUIマネージャーを通じて通知を表示
    
    return true;
  }
  
  /**
   * 実績が解除済みかどうか
   * @param {string} achievementId - 実績ID
   * @returns {boolean} 解除済みかどうか
   */
  isUnlocked(achievementId) {
    return this.unlockedAchievements.includes(achievementId);
  }
  
  /**
   * プレイヤーの実績を取得
   * @returns {Array<string>} 実績ID配列
   */
  getPlayerAchievements() {
    return this.unlockedAchievements;
  }
  
  /**
   * 全実績定義を取得
   * @returns {Array} 実績定義配列
   */
  getAllAchievements() {
    return this.achievements;
  }
  
  /**
   * 実績解除条件をチェック
   * @param {string} playerId - プレイヤーID
   * @param {object} gameData - ゲームデータ
   * @returns {Array} 新しく解除された実績
   */
  checkAchievements(gameData) {
    const unlocked = [];
    
    // ゲーム結果に基づいて実績をチェック
    if (gameData.result === 'win') {
      if (gameData.potato.status === 'perfect') {
        if (this.unlock('first_perfect')) {
          unlocked.push('first_perfect');
        }
      }
    } else {
      if (gameData.potato.status === 'burnt') {
        if (this.unlock('first_burnt')) {
          unlocked.push('first_burnt');
        }
      }
      if (gameData.potato.status === 'exploded') {
        if (this.unlock('first_explosion')) {
          unlocked.push('first_explosion');
        }
      }
      if (gameData.potato.status === 'raw') {
        if (this.unlock('first_raw')) {
          unlocked.push('first_raw');
        }
      }
    }
    
    // 初回プレイ
    if (this.unlock('first_game')) {
      unlocked.push('first_game');
    }
    
    // 火力100%
    if (gameData.heatLevel >= 100) {
      if (this.unlock('world_burn')) {
        unlocked.push('world_burn');
      }
    }
    
    return unlocked;
  }
  
  /**
   * 解除率を取得
   * @returns {number} 解除率（0-100）
   */
  getCompletionRate() {
    return (this.unlockedAchievements.length / this.achievements.length) * 100;
  }
}
