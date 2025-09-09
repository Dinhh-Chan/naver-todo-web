// Notification Service for AnyF Time Manager
// Handles browser notifications, scheduling, and permission management

export interface NotificationData {
  id: string
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  timestamp: Date
  scheduledFor?: Date
  type: 'task_reminder' | 'overdue' | 'ai_insight' | 'deadline_approaching'
}

export class NotificationService {
  private static instance: NotificationService
  private notifications: Map<string, NotificationData> = new Map()
  private scheduledNotifications: Map<string, number> = new Map() // timeout IDs

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  // Check if notifications are supported and enabled
  isSupported(): boolean {
    return 'Notification' in window && Notification.permission === 'granted'
  }

  // Show immediate notification
  showNotification(data: Omit<NotificationData, 'id' | 'timestamp'>): string {
    if (!this.isSupported()) {
      console.warn('Notifications not supported or permission denied')
      return ''
    }

    const id = crypto.randomUUID()
    const notificationData: NotificationData = {
      ...data,
      id,
      timestamp: new Date()
    }

    this.notifications.set(id, notificationData)

    const notification = new Notification(data.title, {
      body: data.body,
      icon: data.icon || '/placeholder-logo.png',
      badge: data.badge || '/placeholder-logo.png',
      tag: data.tag,
      data: data.data
    })

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)

    // Handle click
    notification.onclick = () => {
      window.focus()
      notification.close()
      
      // Trigger custom event for app to handle
      window.dispatchEvent(new CustomEvent('notification-clicked', {
        detail: notificationData
      }))
    }

    return id
  }

  // Schedule notification for later
  scheduleNotification(data: Omit<NotificationData, 'id' | 'timestamp'>, scheduledFor: Date): string {
    const now = new Date()
    const delay = scheduledFor.getTime() - now.getTime()

    if (delay <= 0) {
      return this.showNotification(data)
    }

    const id = crypto.randomUUID()
    const notificationData: NotificationData = {
      ...data,
      id,
      timestamp: new Date(),
      scheduledFor
    }

    this.notifications.set(id, notificationData)

    const timeoutId = window.setTimeout(() => {
      this.showNotification(data)
      this.scheduledNotifications.delete(id)
    }, delay)

    this.scheduledNotifications.set(id, timeoutId)
    return id
  }

  // Cancel scheduled notification
  cancelNotification(id: string): boolean {
    const timeoutId = this.scheduledNotifications.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.scheduledNotifications.delete(id)
      this.notifications.delete(id)
      return true
    }
    return false
  }

  // Get all notifications
  getNotifications(): NotificationData[] {
    return Array.from(this.notifications.values())
  }

  // Clear all notifications
  clearAll(): void {
    this.scheduledNotifications.forEach(timeoutId => {
      clearTimeout(timeoutId)
    })
    this.scheduledNotifications.clear()
    this.notifications.clear()
  }

  // Task-specific notification methods
  showTaskReminder(task: any): string {
    return this.showNotification({
      title: '⏰ Nhắc nhở Task',
      body: `"${task.title}" sắp đến hạn!`,
      type: 'task_reminder',
      data: { taskId: task.id },
      tag: `task-${task.id}`
    })
  }

  showOverdueTask(task: any): string {
    return this.showNotification({
      title: '🚨 Task quá hạn',
      body: `"${task.title}" đã quá hạn! Hãy ưu tiên hoàn thành.`,
      type: 'overdue',
      data: { taskId: task.id },
      tag: `overdue-${task.id}`
    })
  }

  showAIInsight(insight: string): string {
    return this.showNotification({
      title: '🤖 AI Insight',
      body: insight,
      type: 'ai_insight',
      tag: 'ai-insight'
    })
  }

  showDeadlineApproaching(task: any, hoursLeft: number): string {
    return this.showNotification({
      title: '⏳ Deadline sắp đến',
      body: `"${task.title}" còn ${hoursLeft} giờ nữa!`,
      type: 'deadline_approaching',
      data: { taskId: task.id },
      tag: `deadline-${task.id}`
    })
  }

  // Schedule task reminders
  scheduleTaskReminders(tasks: any[]): void {
    const now = new Date()
    
    tasks.forEach(task => {
      if (!task.dueDate || task.status === 'completed') return

      const dueDate = new Date(task.dueDate)
      const timeDiff = dueDate.getTime() - now.getTime()

      // Schedule reminder 1 hour before due date
      const reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000)
      if (reminderTime > now) {
        this.scheduleNotification({
          title: '⏰ Nhắc nhở Task',
          body: `"${task.title}" sắp đến hạn trong 1 giờ!`,
          type: 'task_reminder',
          data: { taskId: task.id },
          tag: `reminder-${task.id}`
        }, reminderTime)
      }

      // Schedule overdue notification
      if (dueDate < now) {
        this.showOverdueTask(task)
      }
    })
  }

  // Check for overdue tasks and show notifications
  checkOverdueTasks(tasks: any[]): void {
    const now = new Date()
    
    tasks.forEach(task => {
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed') {
        this.showOverdueTask(task)
      }
    })
  }

  // Check for tasks approaching deadline
  checkApproachingDeadlines(tasks: any[]): void {
    const now = new Date()
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    
    tasks.forEach(task => {
      if (task.dueDate && task.status !== 'completed') {
        const dueDate = new Date(task.dueDate)
        if (dueDate > now && dueDate <= twoHoursFromNow) {
          const hoursLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (60 * 60 * 1000))
          this.showDeadlineApproaching(task, hoursLeft)
        }
      }
    })
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()
