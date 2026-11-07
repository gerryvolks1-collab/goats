// Mountain Goats: receives notifications while the app is closed.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var p = {};
  try { p = e.data ? e.data.json() : {}; } catch (err) { p = { data: { body: e.data ? e.data.text() : '' } }; }
  var d = p.data || {}, n = p.notification || {};
  var title = d.title || n.title || 'Mountain Goats';
  var opts = { body: d.body || n.body || 'Open the app to see what’s new.', icon: 'icon-192.png', data: { url: './' } };
  if (d.tag) { opts.tag = d.tag; opts.renotify = true; }
  try { if (self.navigator && self.navigator.setAppBadge) self.navigator.setAppBadge(); } catch (err) {}   // a dot on the icon until the app is opened
  e.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].url.indexOf(self.registration.scope) === 0 && 'focus' in list[i]) {
        list[i].postMessage({ goat: 'refresh' });
        return list[i].focus();
      }
    }
    return self.clients.openWindow(target);
  }));
});
