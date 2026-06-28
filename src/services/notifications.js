/**
 * Notification Service - Manages toast notifications
 * Uses a simple pub/sub pattern for cross-component communication
 */

const listeners = new Set()

export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
}

/**
 * Show a toast notification
 * @param {string} message - the notification message
 * @param {string} type - notification type (success, error, warning, info)
 * @param {number} duration - how long to show in ms (0 = permanent)
 */
export function showNotification(message, type = NotificationType.INFO, duration = 5000) {
  const notification = {
    id: Math.random().toString(36).substr(2, 9),
    message,
    type,
    duration,
    timestamp: Date.now(),
  }

  // Notify all listeners
  listeners.forEach(listener => {
    listener(notification)
  })

  // Auto-remove after duration (if duration > 0)
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(notification.id)
    }, duration)
  }

  return notification.id
}

/**
 * Remove a notification by ID
 * @param {string} id - the notification ID
 */
export function removeNotification(id) {
  listeners.forEach(listener => {
    listener({ id, remove: true })
  })
}

/**
 * Subscribe to notification changes
 * @param {Function} callback - function to call when notifications change
 * @returns {Function} unsubscribe function
 */
export function subscribeToNotifications(callback) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

/**
 * Convenience functions
 */
export function success(message, duration = 3000) {
  return showNotification(message, NotificationType.SUCCESS, duration)
}

export function error(message, duration = 5000) {
  return showNotification(message, NotificationType.ERROR, duration)
}

export function warning(message, duration = 4000) {
  return showNotification(message, NotificationType.WARNING, duration)
}

export function info(message, duration = 3000) {
  return showNotification(message, NotificationType.INFO, duration)
}
