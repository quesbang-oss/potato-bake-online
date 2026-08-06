/**
 * EventEmitter - イベント発行・購読クラス
 */

export class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  /**
   * イベントリスナーを追加
   * @param {string} event - イベント名
   * @param {Function} listener - リスナー関数
   * @returns {EventEmitter} this
   */
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(listener);
    return this;
  }
  
  /**
   * 一度だけ実行されるリスナーを追加
   * @param {string} event - イベント名
   * @param {Function} listener - リスナー関数
   * @returns {EventEmitter} this
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    this.on(event, onceWrapper);
    return this;
  }
  
  /**
   * イベントリスナーを削除
   * @param {string} event - イベント名
   * @param {Function} listener - リスナー関数
   * @returns {EventEmitter} this
   */
  off(event, listener) {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }
  
  /**
   * イベントを発行
   * @param {string} event - イベント名
   * @param {...any} args - 引数
   * @returns {EventEmitter} this
   */
  emit(event, ...args) {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
    return this;
  }
  
  /**
   * 全てのリスナーを削除
   * @param {string} [event] - イベント名（指定しない場合は全て）
   * @returns {EventEmitter} this
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }
  
  /**
   * イベントのリスナー数を取得
   * @param {string} event - イベント名
   * @returns {number} リスナー数
   */
  listenerCount(event) {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }
  
  /**
   * イベント名のリストを取得
   * @returns {Array<string>} イベント名配列
   */
  eventNames() {
    return Array.from(this.events.keys());
  }
}
