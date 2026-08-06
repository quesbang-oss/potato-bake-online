import { v4 as uuidv4 } from 'uuid';
import { GameRoom } from './GameRoom.js';

/**
 * ゲームルーム管理クラス
 * 全てのルームの作成、管理、削除を行う
 */
export class GameRoomManager {
  constructor() {
    this.rooms = new Map();
    this.playerToRoom = new Map();
  }
  
  /**
   * 新しいルームを作成
   * @param {string} hostId - ホストプレイヤーID
   * @param {object} options - ルームオプション
   * @returns {string} ルームコード
   */
  createRoom(hostId, options = {}) {
    const roomCode = this.generateRoomCode();
    const room = new GameRoom(roomCode, hostId, options);
    
    this.rooms.set(roomCode, room);
    this.playerToRoom.set(hostId, roomCode);
    
    console.log(`Room created: ${roomCode} by ${hostId}`);
    return roomCode;
  }
  
  /**
   * ルームコードを生成
   * @returns {string} 6桁のルームコード
   */
  generateRoomCode() {
    let code;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.rooms.has(code));
    return code;
  }
  
  /**
   * ルームを取得
   * @param {string} roomCode - ルームコード
   * @returns {GameRoom|null} ルームオブジェクト
   */
  getRoom(roomCode) {
    return this.rooms.get(roomCode) || null;
  }
  
  /**
   * プレイヤーが所属するルームを取得
   * @param {string} playerId - プレイヤーID
   * @returns {GameRoom|null} ルームオブジェクト
   */
  getPlayerRoom(playerId) {
    const roomCode = this.playerToRoom.get(playerId);
    return roomCode ? this.getRoom(roomCode) : null;
  }
  
  /**
   * ルームを削除
   * @param {string} roomCode - ルームコード
   */
  deleteRoom(roomCode) {
    const room = this.rooms.get(roomCode);
    if (room) {
      // プレイヤーとルームのマッピングを削除
      room.players.forEach((player, playerId) => {
        this.playerToRoom.delete(playerId);
      });
      
      this.rooms.delete(roomCode);
      console.log(`Room deleted: ${roomCode}`);
    }
  }
  
  /**
   * 全ルームを取得
   * @returns {Map} 全ルームマップ
   */
  getAllRooms() {
    return this.rooms;
  }
  
  /**
   * アクティブなルーム数を取得
   * @returns {number} アクティブなルーム数
   */
  getActiveRoomCount() {
    return this.rooms.size;
  }
  
  /**
   * プレイヤーをルームにマッピング
   * @param {string} playerId - プレイヤーID
   * @param {string} roomCode - ルームコード
   */
  mapPlayerToRoom(playerId, roomCode) {
    this.playerToRoom.set(playerId, roomCode);
  }
  
  /**
   * プレイヤーのルームマッピングを削除
   * @param {string} playerId - プレイヤーID
   */
  unmapPlayerFromRoom(playerId) {
    this.playerToRoom.delete(playerId);
  }
}
