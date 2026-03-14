// Admin Panel Push Notification Service Worker
self.addEventListener('push', function(event) {
  let title = 'BajiCrick Notification';
  let body = 'You have a new notification';
  let icon = '/logo192.png';
  let tag = 'transaction-notification';
  let data = {};

  if (event.data) {
    const payload = event.data.json();
    title = payload.title || title;
    body = payload.body || body;
    icon = payload.icon || icon;
    data = payload.data || {};
    tag = payload.tag || tag;
  }

  const options = {
    body: body,
    icon: icon,
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    tag: tag,
    data: data,
    actions: [
      { action: 'view', title: 'View Transaction' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/transactions/deposits')
    );
  }
});
