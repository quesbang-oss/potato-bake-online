/**
 * プレイヤー管理クラス
 * 全プレイヤーの情報を管理
 */
export class PlayerManager {
  constructor() {
    this.players = new Map();
    this.webSockets = new Map();
  }
  
  /**
   * プレイヤーを追加
   * @param {string} playerId - プレイヤーID
   * @param {object} playerData - プレイヤーデータ
   */
  addPlayer(playerId, playerData) {
    this.players.set(playerId, {
      ...playerData,
      profile: {
        name: playerData.name || 'Player',
        totalGames: 0,
        perfectCount: 0,
        explodedCount: 0,
        burntCount: 0,
        achievements: [],
        settings: {
          volume: 0.5,
          quality: 'high',
          language: 'ja'
        }
      },
      createdAt: Date.now()
    });
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
   * プレイヤーを更新
   * @param {string} playerId - プレイヤーID
   * @param {object} playerData - 更新するプレイヤーデータ
   */
  updatePlayer(playerId, playerData) {
    const existing = this.players.get(playerId);
    if (existing) {
      this.players.set(playerId, {
        ...existing,
        ...playerData
      });
    }
  }
  
  /**
   * プロフィールを更新
   * @param {string} playerId - プレイヤーID
   * @param {object} profileData - プロフィールデータ
   */
  updateProfile(playerId, profileData) {
    const player = this.players.get(playerId);
    if (player) {
      player.profile = {
        ...player.profile,
        ...profileData
      };
      this.players.set(playerId, player);
    }
  }
  
  /**
   * WebSocketを設定
   * @param {string} playerId - プレイヤーID
   * @param {WebSocket} ws - WebSocket接続
   */
  setWebSocket(playerId, ws) {
    this.webSockets.set(playerId, ws);
  }
  
  /**
   * WebSocketを取得
   * @param {string} playerId - プレイヤーID
   * @returns {WebSocket|null} WebSocket接続
   */
  getWebSocket(playerId) {
    return this.webSockets.get(playerId) || null;
  }
  
  /**
   * WebSocketを削除
   * @param {string} playerId - プレイヤーID
   */
  removeWebSocket(playerId) {
    this.webSockets.delete(playerId);
  }
  
  /**
   * 全プレイヤーを取得
   * @returns {Map} 全プレイヤーマップ
   */
  getAllPlayers() {
    return this.players;
  }
  
  /**
   * プレイヤーを削除
   * @param {string} playerId - プレイヤーID
   */
  removePlayer(playerId) {
    this.players.delete(playerId);
    this.removeWebSocket(playerId);
  }
  
  /**
   * 接続中のプレイヤー数を取得
   * @returns {number} 接続中のプレイヤー数
   */
  getConnectedPlayerCount() {
    let count = 0;
    this.players.forEach(player => {
      if (player.connected) count++;
    });
    return count;
  }
  
  /**
   * 統計情報を取得
   * @returns {object} 統計情報
   */
  getStatistics() {
    const stats = {
      totalPlayers: this.players.size,
      connectedPlayers: this.getConnectedPlayerCount(),
      totalGames: 0,
      totalPerfects: 0,
      totalExplosions: 0
    };
    
    this.players.forEach(player => {
      if (player.profile) {
        stats.totalGames += player.profile.totalGames || 0;
        stats.totalPerfects += player.profile.perfectCount || 0;
        stats.totalExplosions += player.profile.explodedCount || 0;
      }
    });
    
    return stats;
  }
}
