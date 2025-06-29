import { ref } from 'vue'
import type { Notification } from '../types/Track'

export function useNotifications() {
  const notifications = ref<Notification[]>([])

  const showNotification = (type: 'success' | 'warning' | 'error', title: string, message: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message
    }
    notifications.value.push(notification)
    
    setTimeout(() => {
      removeNotification(notification.id)
    }, 5000)
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    notifications,
    showNotification,
    removeNotification
  }
}