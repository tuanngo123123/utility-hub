// Service worker CHỈ cho Bàn giáo viên (/giao-vien/lop-hoc/).
// File này là MẪU: build.mjs thay __CACHE_NAME__ và __PRECACHE_URLS__
// rồi ghi ra dist/giao-vien/lop-hoc/sw.js (sau versionAssets, để danh
// sách cache dùng đúng URL ?v=<hash> của style.css/app.js).
// Phạm vi: file nằm trong /giao-vien/lop-hoc/ nên chỉ điều khiển trang
// Bàn giáo viên — các trang khác của site không bị đụng tới.
// Chiến lược:
//  - Cài đặt: cache trước app shell (trang + CSS/JS + font + icon).
//  - Điều hướng trong /giao-vien/lop-hoc/ (kể cả ?tab=...): thử mạng
//    trước, mất mạng thì trả trang đã cache (tab chọn bằng JS nên 1 bản
//    HTML dùng cho mọi deep-link).
//  - Tài nguyên cùng origin (font, thư viện nạp lười như xlsx): cache
//    trước, chưa có thì tải về rồi lưu lại.
//  - Ngoài origin (beacon Cloudflare...): không chặn, để trình duyệt
//    tự tải — mất mạng thì tự lỗi, không ảnh hưởng app.
'use strict';

var CACHE_NAME = '__CACHE_NAME__';
var PRECACHE_URLS = __PRECACHE_URLS__;
var APP_URL = '/giao-vien/lop-hoc/';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(PRECACHE_URLS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (key) {
          // Chỉ xóa cache của chính Bàn giáo viên, không đụng cache khác.
          if (key !== CACHE_NAME && key.indexOf('gv-app-') === 0) {
            return caches.delete(key);
          }
          return Promise.resolve(false);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // Ngoài origin: không can thiệp (beacon phân tích, ...).
  if (url.origin !== self.location.origin) return;

  // Điều hướng trong Bàn giáo viên: mạng trước, cache sau.
  if (req.mode === 'navigate' && url.pathname.indexOf(APP_URL) === 0) {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(APP_URL, copy);
            });
          }
          return res;
        })
        .catch(function () {
          return caches.match(APP_URL);
        })
    );
    return;
  }

  // Tài nguyên cùng origin: cache trước, chưa có thì tải + lưu lại.
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(req, copy);
          });
        }
        return res;
      });
    })
  );
});
