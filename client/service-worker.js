/**
 * Service Worker - PWA対応
 * オフライン対応、キャッシュ管理
 */

const CACHE_NAME = 'potato-bake-online-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/ui.css',
  '/styles/game.css',
  '/styles/animations.css',
  '/scripts/main.js',
  '/scripts/utils/EventEmitter.js',
  '/scripts/game/GameEngine.js',
  '/scripts/game/PotatoRenderer.js',
  '/scripts/game/StoveRenderer.js',
  '/scripts/network/NetworkManager.js',
  '/scripts/ui/UIManager.js',
  '/scripts/audio/AudioManager.js',
  '/scripts/data/SaveManager.js',
  '/scripts/data/AchievementManager.js',
  '/scripts/effects/EffectManager.js',
  '/scripts/events/EventManager.js',
  '/manifest.json'
];

/**
 * インストールイベント
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  
  self.skipWaiting();
});

/**
 * アクティベートイベント
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
  
  self.clients.claim();
});

/**
 * フェッチイベント
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュがあれば返す
        if (response) {
          return response;
        }
        
        // キャッシュになければネットワークへ
        return fetch(event.request)
          .then((response) => {
            // レスポンスをクローンしてキャッシュ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            
            // オフラインフォールバック
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

/**
 * メッセージイベント
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * プッシュ通知イベント（将来の実装用）
 */
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '新しい通知があります',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('ポテト焼きオンライン', options)
  );
});

/**
 * 通知クリックイベント
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
