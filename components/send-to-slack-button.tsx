"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slack, Send, CheckCircle2, AlertTriangle } from "lucide-react"
import { slackService } from "@/lib/slack-service"
import { notificationService } from "@/lib/notification-service"

interface SendToSlackButtonProps {
  task: Task
  trigger?: React.ReactNode
}

export function SendToSlackButton({ task, trigger }: SendToSlackButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState('#tasks')
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const channels = [
    { id: '#tasks', name: 'tasks', description: 'Kênh chính cho tasks' },
    { id: '#general', name: 'general', description: 'Kênh chung' },
    { id: '#projects', name: 'projects', description: 'Kênh dự án' },
    { id: '#ai-insights', name: 'ai-insights', description: 'AI insights và tips' }
  ]

  const handleSend = async () => {
    if (!slackService.isConnected()) {
      setSendStatus('error')
      return
    }

    setIsSending(true)
    setSendStatus('idle')
    try {
      // Convert task.dueDate to string if it exists
      const taskToSend = {
        ...task,
        dueDate: task.dueDate?.toISOString()
      }
      const success = await slackService.sendTaskToSlack(taskToSend, selectedChannel)
      
      if (success) {
        setSendStatus('success')
        notificationService.showNotification({
          title: '✅ Đã gửi đến Slack',
          body: `Task "${task.title}" đã được gửi đến ${selectedChannel}`,
          type: 'ai_insight'
        })
        
        // Auto close after success
        setTimeout(() => {
          setIsOpen(false)
          setSendStatus('idle')
        }, 2000)
      } else {
        setSendStatus('error')
      }
    } catch (error) {
      console.error('Error sending to Slack:', error)
      setSendStatus('error')
    }

    setIsSending(false)
  }

  const getPriorityEmoji = (priority: Task["priority"]) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const getStatusEmoji = (status: Task["status"]) => {
    switch (status) {
      case 'todo': return '📝'
      case 'in-progress': return '🔄'
      case 'completed': return '✅'
      default: return '❓'
    }
  }

  if (!slackService.isConnected()) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-2">
            <Slack className="h-3 w-3" />
            Gửi Slack
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Slack className="h-5 w-5" />
            Gửi Task đến Slack
          </DialogTitle>
          <DialogDescription>
            Chọn kênh để gửi task này đến Slack
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Preview */}
          <div className="p-3 border rounded-lg bg-muted/30">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-sm">{task.title}</h4>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">
                  {getPriorityEmoji(task.priority)} {task.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getStatusEmoji(task.status)} {task.status}
                </Badge>
              </div>
            </div>
            
            {task.description && (
              <p className="text-xs text-muted-foreground mb-2">
                {task.description.length > 100 
                  ? `${task.description.substring(0, 100)}...` 
                  : task.description
                }
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {task.dueDate && (
                <span>📅 {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
              )}
              {task.category && (
                <span>📁 {task.category}</span>
              )}
              {task.tags && task.tags.length > 0 && (
                <span>🏷️ {task.tags.slice(0, 2).join(', ')}</span>
              )}
            </div>
          </div>

          {/* Channel Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn kênh</label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    <div className="flex flex-col">
                      <span>{channel.id}</span>
                      <span className="text-xs text-muted-foreground">
                        {channel.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Send Status */}
          {sendStatus === 'success' && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Đã gửi thành công!</span>
            </div>
          )}

          {sendStatus === 'error' && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Lỗi khi gửi. Vui lòng thử lại.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 gap-2"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Đang gửi...' : 'Gửi đến Slack'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSending}
            >
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
