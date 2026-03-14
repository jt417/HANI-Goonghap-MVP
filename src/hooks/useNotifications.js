import { useState, useCallback, useEffect } from 'react';

const MAX_NOTIFICATIONS = 50;

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'denied');

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const addNotification = useCallback(({ title, body, type = 'info', tab = null, onClick = null }) => {
    const entry = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      body,
      type,
      tab,
      onClick,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [entry, ...prev].slice(0, MAX_NOTIFICATIONS));

    // Browser notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico', tag: entry.id });
      } catch (_) {
        // Silent fail for environments that don't support Notification constructor
      }
    }

    return entry;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, requestPermission, permission };
}
