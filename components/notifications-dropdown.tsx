"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, X, CheckCircle2, AlertTriangle, Clock, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'invite'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationsDropdownProps {
  onTaskClick?: (taskId: string) => void
}

export function NotificationsDropdown({ onTaskClick }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Task quá hạn',
      message: 'Bài tập Toán học đã quá hạn 2 ngày',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Task hoàn thành',
      message: 'Dự án Web Development đã được hoàn thành',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'invite',
      title: 'Lời mời dự án',
      message: 'Bạn được mời tham gia dự án "AI Research"',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false
    },
    {
      id: '4',
      type: 'info',
      title: 'Nhắc nhở',
      message: 'Có 3 task sắp đến hạn trong ngày mai',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: true
    },
    {
      id: '5',
      type: 'warning',
      title: 'Deadline sắp tới',
      message: 'Báo cáo cuối kỳ môn Lập trình Web còn 1 ngày',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '6',
      type: 'success',
      title: 'Điểm số mới',
      message: 'Bạn đã nhận được điểm 9.5 cho bài tập React',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '7',
      type: 'invite',
      title: 'Tham gia nhóm học',
      message: 'Nhóm "Frontend Developers" mời bạn tham gia',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '8',
      type: 'info',
      title: 'Lịch học tuần tới',
      message: 'Có 5 lớp học và 2 buổi thực hành trong tuần tới. Nhớ chuẩn bị bài tập và tài liệu học tập đầy đủ để có thể tham gia hiệu quả',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: true
    },
    {
      id: '9',
      type: 'warning',
      title: 'Nộp bài tập',
      message: 'Bài tập JavaScript cần nộp trước 23:59 hôm nay',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '10',
      type: 'success',
      title: 'Hoàn thành khóa học',
      message: 'Chúc mừng! Bạn đã hoàn thành khóa học React Advanced',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '11',
      type: 'warning',
      title: 'Cảnh báo hệ thống',
      message: 'Hệ thống sẽ bảo trì vào 2:00 AM ngày mai. Vui lòng lưu công việc trước đó',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: false
    },
    {
      id: '12',
      type: 'invite',
      title: 'Tham gia cuộc thi',
      message: 'Cuộc thi "AI Hackathon 2024" đang mở đăng ký. Hạn chót: 15/12/2024',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      read: false
    }
  ])

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'invite':
        return <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-600'
      case 'success':
        return 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-600'
      case 'invite':
        return 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-600'
      default:
        return 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 dark:border-gray-600'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    return `${days} ngày trước`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Mở thông báo"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
         <div className="absolute right-0 top-10 w-96 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[200] max-h-[500px] overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Thông báo
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Đánh dấu tất cả đã đọc
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Không có thông báo nào
              </div>
            ) : (
              notifications.map((notification) => (
                 <div
                   key={notification.id}
                   className={`p-3 border-b border-gray-100 dark:border-gray-800 hover:opacity-80 cursor-pointer transition-all duration-200 ${getNotificationColor(notification.type)} ${
                     !notification.read ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
                   }`}
                   onClick={() => {
                     markAsRead(notification.id)
                     if (notification.type === 'warning' && onTaskClick) {
                       onTaskClick('task-id') // Mock task ID
                     }
                   }}
                 >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </h4>
                         {!notification.read && (
                           <div className={`w-2 h-2 rounded-full ${
                             notification.type === 'warning' ? 'bg-orange-500' :
                             notification.type === 'success' ? 'bg-green-500' :
                             notification.type === 'invite' ? 'bg-blue-500' :
                             'bg-gray-500'
                           }`}></div>
                         )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả thông báo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
