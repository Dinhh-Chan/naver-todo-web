"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  Slack, 
  Mail, 
  CheckCircle2, 
  AlertTriangle,
  Settings,
  Send,
  ArrowUp,
  User,
  LogOut,
  ExternalLink
} from "lucide-react"
import { notificationService } from "@/lib/notification-service"
import { slackService } from "@/lib/slack-service"
import { gmailService } from "@/lib/gmail-service"

interface IntegrationsPanelProps {
  tasks: Task[]
  onAddTasks: (tasks: Task[]) => void
}

export function IntegrationsPanel({ tasks, onAddTasks }: IntegrationsPanelProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [slackConnected, setSlackConnected] = useState(false)
  const [gmailConnected, setGmailConnected] = useState(false)
  const [slackUser, setSlackUser] = useState<any>(null)
  const [gmailUser, setGmailUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Initialize services
    slackService.initialize()
    gmailService.initialize()
    
    // Check connection status
    setSlackConnected(slackService.isConnected())
    setGmailConnected(gmailService.isSignedIn())
    
    // Check notification permission
    checkNotificationPermission()
    
    // Load user info if connected
    loadUserInfo()
  }, [])

  const checkNotificationPermission = async () => {
    const permission = await notificationService.requestPermission()
    setNotificationsEnabled(permission === 'granted')
  }

  const loadUserInfo = async () => {
    try {
      if (slackService.isConnected()) {
        const user = await slackService.getUserInfo()
        setSlackUser(user)
      }
    } catch (error) {
      console.error('Error loading Slack user info:', error)
    }

    try {
      if (gmailService.isSignedIn()) {
        const profile = await gmailService.getUserProfile()
        setGmailUser(profile)
      }
    } catch (error) {
      console.error('Error loading Gmail user info:', error)
    }
  }

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const permission = await notificationService.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        // Schedule notifications for existing tasks
        notificationService.scheduleTaskReminders(tasks)
      } else {
        setNotificationsEnabled(false)
      }
    } else {
      setNotificationsEnabled(false)
      notificationService.clearAll()
    }
  }

  const handleSlackConnect = () => {
    const authUrl = slackService.getAuthUrl()
    window.open(authUrl, '_blank', 'width=600,height=600')
    
    // In a real app, you'd handle the callback
    // For POC, simulate connection
    setTimeout(() => {
      setSlackConnected(true)
      loadUserInfo()
    }, 2000)
  }

  const handleSlackDisconnect = () => {
    slackService.disconnect()
    setSlackConnected(false)
    setSlackUser(null)
  }

  const handleGmailConnect = async () => {
    setIsLoading(true)
    try {
      const success = await gmailService.signIn()
      if (success) {
        setGmailConnected(true)
        await loadUserInfo()
      }
    } catch (error) {
      console.error('Gmail connection error:', error)
    }
    setIsLoading(false)
  }

  const handleGmailDisconnect = async () => {
    await gmailService.signOut()
    setGmailConnected(false)
    setGmailUser(null)
  }

  const handleSendToSlack = async (task: Task) => {
    try {
      const taskToSend = {
        ...task,
        dueDate: task.dueDate?.toISOString()
      }
      const success = await slackService.sendTaskToSlack(taskToSend)
      if (success) {
        // Show success notification
        notificationService.showNotification({
          title: '✅ Đã gửi đến Slack',
          body: `Task "${task.title}" đã được gửi đến kênh #tasks`,
          type: 'ai_insight'
        })
      }
    } catch (error) {
      console.error('Error sending to Slack:', error)
    }
  }

  const handleSyncGmail = async () => {
    setIsLoading(true)
    try {
      const gmailTasks = await gmailService.syncEmailsToTasks()
      const convertedTasks = gmailTasks.map(gmailTask => ({
        ...gmailTask,
        status: 'todo' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
      
      onAddTasks(convertedTasks)
      
      notificationService.showNotification({
        title: '📧 Đồng bộ Gmail thành công',
        body: `Đã tạo ${convertedTasks.length} task từ email`,
        type: 'ai_insight'
      })
    } catch (error) {
      console.error('Error syncing Gmail:', error)
    }
    setIsLoading(false)
  }

  const handleSendAIInsightToSlack = async () => {
    const insights = [
      "Bạn đang làm việc hiệu quả! Hãy tiếp tục duy trì momentum này.",
      "Có vẻ như bạn đang trì hoãn một số task quan trọng. Hãy ưu tiên chúng!",
      "Thời gian ước tính của bạn đang cải thiện. Tuyệt vời!",
      "Bạn đã hoàn thành nhiều task hôm nay. Hãy nghỉ ngơi một chút!"
    ]
    
    const randomInsight = insights[Math.floor(Math.random() * insights.length)]
    
    try {
      await slackService.sendAIInsight(randomInsight)
      notificationService.showNotification({
        title: '🤖 AI Insight đã gửi',
        body: 'Insight đã được gửi đến Slack',
        type: 'ai_insight'
      })
    } catch (error) {
      console.error('Error sending AI insight to Slack:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Tích hợp & Thông báo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="font-medium">Thông báo trình duyệt</span>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Nhận thông báo về task sắp đến hạn và insights từ AI
          </p>
          {notificationsEnabled && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => notificationService.checkOverdueTasks(tasks)}
              >
                Kiểm tra task quá hạn
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => notificationService.checkApproachingDeadlines(tasks)}
              >
                Kiểm tra deadline
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Slack Integration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Slack className="h-4 w-4" />
              <span className="font-medium">Slack</span>
              {slackConnected && <Badge variant="secondary">Đã kết nối</Badge>}
            </div>
            {slackConnected ? (
              <Button size="sm" variant="outline" onClick={handleSlackDisconnect}>
                <LogOut className="h-3 w-3 mr-1" />
                Ngắt kết nối
              </Button>
            ) : (
              <Button size="sm" onClick={handleSlackConnect}>
                <ExternalLink className="h-3 w-3 mr-1" />
                Kết nối
              </Button>
            )}
          </div>
          
          {slackConnected && slackUser && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <User className="h-4 w-4" />
              <span className="text-sm">{slackUser.real_name || slackUser.name}</span>
            </div>
          )}
          
          {slackConnected && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Gửi task và AI insights đến Slack
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendAIInsightToSlack}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Gửi AI Insight
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
                    if (randomTask) {
                      handleSendToSlack(randomTask)
                    }
                  }}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Gửi Task mẫu
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Gmail Integration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Gmail</span>
              {gmailConnected && <Badge variant="secondary">Đã kết nối</Badge>}
            </div>
            {gmailConnected ? (
              <Button size="sm" variant="outline" onClick={handleGmailDisconnect}>
                <LogOut className="h-3 w-3 mr-1" />
                Ngắt kết nối
              </Button>
            ) : (
              <Button size="sm" onClick={handleGmailConnect} disabled={isLoading}>
                <ExternalLink className="h-3 w-3 mr-1" />
                {isLoading ? 'Đang kết nối...' : 'Kết nối'}
              </Button>
            )}
          </div>
          
          {gmailConnected && gmailUser && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <User className="h-4 w-4" />
              <span className="text-sm">{gmailUser.emailAddress}</span>
            </div>
          )}
          
          {gmailConnected && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Đồng bộ email để tạo task tự động
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSyncGmail}
                disabled={isLoading}
              >
                <ArrowUp className="h-3 w-3 mr-1" />
                {isLoading ? 'Đang đồng bộ...' : 'Đồng bộ Email'}
              </Button>
            </div>
          )}
        </div>

        {/* Integration Status */}
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">Trạng thái tích hợp</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              {notificationsEnabled ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-orange-500" />
              )}
              <span>Thông báo: {notificationsEnabled ? 'Bật' : 'Tắt'}</span>
            </div>
            <div className="flex items-center gap-2">
              {slackConnected ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-orange-500" />
              )}
              <span>Slack: {slackConnected ? 'Đã kết nối' : 'Chưa kết nối'}</span>
            </div>
            <div className="flex items-center gap-2">
              {gmailConnected ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-orange-500" />
              )}
              <span>Gmail: {gmailConnected ? 'Đã kết nối' : 'Chưa kết nối'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
