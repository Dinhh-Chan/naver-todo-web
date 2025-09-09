"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp
} from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"

interface SmartNotificationsProps {
  tasks: Task[]
  onTaskClick?: (taskId: string) => void
}

type NotificationItem = {
  id: string
  type: "warning" | "info" | "success" | "tip"
  title: string
  message: string
  taskId?: string
  timestamp: Date
  read: boolean
}

export function SmartNotifications({ tasks, onTaskClick }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    const generateNotifications = () => {
      const now = new Date()
      const items: NotificationItem[] = []

      const overdueTasks = tasks.filter(
        task => task.dueDate && task.dueDate < now && task.status !== "completed"
      )
      if (overdueTasks.length > 0) {
        items.push({
          id: "overdue-tasks",
          type: "warning",
          title: `${overdueTasks.length} Task quá hạn`,
          message: `Bạn có ${overdueTasks.length} task đã quá hạn. Hãy ưu tiên hoàn thành chúng.`,
          taskId: overdueTasks[0].id,
          timestamp: new Date(),
          read: false,
        })
      }

      const todayTasks = tasks.filter(
        task => task.dueDate && isToday(task.dueDate) && task.status !== "completed"
      )
      if (todayTasks.length > 0) {
        items.push({
          id: "today-tasks",
          type: "info",
          title: `${todayTasks.length} Task hôm nay`,
          message: `Bạn có ${todayTasks.length} task cần hoàn thành hôm nay.`,
          taskId: todayTasks[0].id,
          timestamp: new Date(),
          read: false,
        })
      }

      const tomorrowTasks = tasks.filter(
        task => task.dueDate && isTomorrow(task.dueDate) && task.status !== "completed"
      )
      if (tomorrowTasks.length > 0) {
        items.push({
          id: "tomorrow-tasks",
          type: "info",
          title: `${tomorrowTasks.length} Task ngày mai`,
          message: `Chuẩn bị cho ${tomorrowTasks.length} task sắp đến hạn.`,
          taskId: tomorrowTasks[0].id,
          timestamp: new Date(),
          read: false,
        })
      }

      const highPriorityTasks = tasks.filter(
        task => task.priority === "high" && task.status !== "completed"
      )
      if (highPriorityTasks.length > 3) {
        items.push({
          id: "high-priority",
          type: "tip",
          title: "Nhiều task ưu tiên cao",
          message: `Bạn có ${highPriorityTasks.length} task ưu tiên cao. Hãy tập trung hoàn thành chúng.`,
          timestamp: new Date(),
          read: false,
        })
      }

      const completedToday = tasks.filter(
        task => task.status === "completed" && task.completedAt && isToday(task.completedAt)
      ).length
      if (completedToday >= 3) {
        items.push({
          id: "productivity-boost",
          type: "success",
          title: "Tuyệt vời!",
          message: `Bạn đã hoàn thành ${completedToday} task hôm nay. Tiếp tục phát huy!`,
          timestamp: new Date(),
          read: false,
        })
      }

      setNotifications(items)
    }

    generateNotifications()
    const interval = setInterval(generateNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [tasks])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "info":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "tip":
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-primary" />
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] leading-4" variant="secondary">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 z-[60]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="text-sm">Thông báo</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={markAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Không có thông báo nào</div>
        ) : (
          <div className="max-h-96 overflow-auto">
            {notifications.map((n) => (
              <div key={n.id} className={`px-2 py-2 ${n.read ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-2">
                  {getNotificationIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{n.title}</span>
                      <span className="text-xs text-muted-foreground ml-2">{format(n.timestamp, 'HH:mm')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {n.taskId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => onTaskClick?.(n.taskId!)}
                        >
                          Xem
                        </Button>
                      )}
                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => markAsRead(n.id)}
                        >
                          Đã đọc
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
