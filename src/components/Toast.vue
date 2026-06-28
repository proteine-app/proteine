<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['toast', `toast--${notification.type}`]"
        role="alert"
        aria-live="polite"
      >
        <div class="toast-icon">
          <span v-if="notification.type === 'success'">✓</span>
          <span v-else-if="notification.type === 'error'">✕</span>
          <span v-else-if="notification.type === 'warning'">⚠</span>
          <span v-else>ℹ</span>
        </div>
        <div class="toast-message">{{ notification.message }}</div>
        <button
          class="toast-close"
          @click="closeNotification(notification.id)"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { subscribeToNotifications } from '../services/notifications'

export default {
  name: 'Toast',
  setup() {
    const notifications = ref([])
    let unsubscribe = null

    onMounted(() => {
      unsubscribe = subscribeToNotifications((notification) => {
        if (notification.remove) {
          notifications.value = notifications.value.filter(n => n.id !== notification.id)
        } else {
          notifications.value.push(notification)
        }
      })
    })

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })

    const closeNotification = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }

    return {
      notifications,
      closeNotification,
    }
  },
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  min-width: 300px;
  max-width: 500px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(400px);
  opacity: 0;
}

.toast--success {
  background-color: #4caf50;
  color: white;
}

.toast--error {
  background-color: #f44336;
  color: white;
}

.toast--warning {
  background-color: #ff9800;
  color: white;
}

.toast--info {
  background-color: #2196f3;
  color: white;
}

.toast-icon {
  font-weight: bold;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  min-height: auto;
  min-width: auto;
  opacity: 0.8;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  opacity: 1;
}

.toast-close:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

@media (max-width: 600px) {
  .toast {
    min-width: 280px;
    max-width: calc(100vw - 2rem);
  }

  .toast-container {
    left: 1rem;
    right: 1rem;
  }
}
</style>
