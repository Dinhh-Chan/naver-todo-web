"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { gmailService } from "@/lib/gmail-service"
import { slackService } from "@/lib/slack-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Mail, 
  MessageSquare, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Sync,
  Send,
  Users,
  Hash,
  Bell,
  Zap,
  Download,
  Upload,
  Link,
  Unlink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface IntegrationsPanelProps {
  tasks: Task[]
  onAddTasks?: (tasks: Task[]) => void
}

export function IntegrationsPanel({ tasks, onAddTasks }: IntegrationsPanelProps) {
  const { toast } = useToast()
  
  // Gmail State
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailLoading, setGmailLoading] = useState(false)
  const [gmailUser, setGmailUser] = useState<any>(null)
  const [syncKeywords, setSyncKeywords] = useState("deadline,assignment,homework,meeting,task")
  const [autoSync, setAutoSync] = useState(false)

  // Slack State
  const [slackConnected, setSlackConnected] = useState(false)
  const [slackLoading, setSlackLoading] = useState(false)
  const [slackUser, setSlackUser] = useState<any>(null)
  const [slackChannels, setSlackChannels] = useState<any[]>([])
  const [defaultChannel, setDefaultChannel] = useState("#tasks")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Dialog States
  const [showGmailSync, setShowGmailSync] = useState(false)
  const [showSlackSend, setShowSlackSend] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Initialize services
  useEffect(() => {
    checkConnections()
  }, [])

  const checkConnections = async () => {
    // Check Gmail connection
    try {
      const isGmailSignedIn = gmailService.isSignedIn()
      setGmailConnected(isGmailSignedIn)
      
      if (isGmailSignedIn) {
        const profile = await gmailService.getUserProfile()
        setGmailUser(profile)
      }
    } catch (error) {
      console.error('Error checking Gmail connection:', error)
    }

    // Check Slack connection
    slackService.initialize()
    const isSlackConnected = slackService.isConnected()
    setSlackConnected(isSlackConnected)
    
    if (isSlackConnected) {
      try {
        const userInfo = await slackService.getUserInfo()
        const channels = await slackService.getChannels()
        setSlackUser(userInfo)
        setSlackChannels(channels)
      } catch (error) {
        console.error('Error getting Slack info:', error)
      }
    }
  }

  // Gmail Functions
  const handleGmailConnect = async () => {
    setGmailLoading(true)
    try {
      const success = await gmailService.signIn()
      if (success) {
        setGmailConnected(true)
        const profile = await gmailService.getUserProfile()
        setGmailUser(profile)
        toast({
          title: "Gmail kết nối thành công!",
          description: "Bạn có thể sync email thành task.",
        })
      } else {
        toast({
          title: "Lỗi kết nối Gmail",
          description: "Không thể kết nối với Gmail. Vui lòng thử lại.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Gmail connect error:', error)
      toast({
        title: "Lỗi kết nối Gmail",
        description: "Đã xảy ra lỗi khi kết nối Gmail.",
        variant: "destructive",
      })
    }
    setGmailLoading(false)
  }

  const handleGmailDisconnect = async () => {
    try {
      await gmailService.signOut()
      setGmailConnected(false)
      setGmailUser(null)
      toast({
        title: "Đã ngắt kết nối Gmail",
        description: "Gmail đã được ngắt kết nối thành công.",
      })
    } catch (error) {
      console.error('Gmail disconnect error:', error)
    }
  }

  const handleGmailSync = async () => {
    if (!gmailConnected) return
    
    setGmailLoading(true)
    try {
      const keywords = syncKeywords.split(',').map(k => k.trim()).filter(Boolean)
      const gmailTasks = await gmailService.syncEmailsToTasks(keywords)
      
      // Convert Gmail tasks to app tasks
      const newTasks: Task[] = gmailTasks.map(gmailTask => ({
        id: gmailTask.id,
        title: gmailTask.title,
        description: gmailTask.description,
        priority: gmailTask.priority as Task["priority"],
        status: "todo" as Task["status"],
        dueDate: gmailTask.dueDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: gmailTask.category,
        tags: gmailTask.tags,
      }))

      if (onAddTasks && newTasks.length > 0) {
        onAddTasks(newTasks)
        toast({
          title: `Đã sync ${newTasks.length} task từ Gmail`,
          description: "Các email đã được chuyển thành task thành công.",
        })
      } else {
        toast({
          title: "Không có email nào để sync",
          description: "Không tìm thấy email phù hợp với từ khóa.",
        })
      }
    } catch (error) {
      console.error('Gmail sync error:', error)
      toast({
        title: "Lỗi sync Gmail",
        description: "Không thể sync email. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
    setGmailLoading(false)
    setShowGmailSync(false)
  }

  // Slack Functions
  const handleSlackConnect = async () => {
    setSlackLoading(true)
    try {
      // For POC, simulate connection
      const mockSuccess = await slackService.handleAuthCallback('mock_code')
      if (mockSuccess) {
        setSlackConnected(true)
        const userInfo = await slackService.getUserInfo()
        const channels = await slackService.getChannels()
        setSlackUser(userInfo)
        setSlackChannels(channels)
        toast({
          title: "Slack kết nối thành công!",
          description: "Bạn có thể gửi task và thông báo đến Slack.",
        })
      }
    } catch (error) {
      console.error('Slack connect error:', error)
      toast({
        title: "Lỗi kết nối Slack",
        description: "Không thể kết nối với Slack. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
    setSlackLoading(false)
  }

  const handleSlackDisconnect = () => {
    slackService.disconnect()
    setSlackConnected(false)
    setSlackUser(null)
    setSlackChannels([])
    toast({
      title: "Đã ngắt kết nối Slack",
      description: "Slack đã được ngắt kết nối thành công.",
    })
  }

  const handleSendTaskToSlack = async (task: Task) => {
    if (!slackConnected) return

    setSlackLoading(true)
    try {
      const slackTask = {
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate?.toISOString(),
        status: task.status,
        category: task.category,
        tags: task.tags,
      }

      const success = await slackService.sendTaskToSlack(slackTask, defaultChannel)
      if (success) {
        toast({
          title: "Task đã gửi đến Slack",
          description: `Task "${task.title}" đã được gửi đến ${defaultChannel}`,
        })
      }
    } catch (error) {
      console.error('Send to Slack error:', error)
      toast({
        title: "Lỗi gửi Slack",
        description: "Không thể gửi task đến Slack. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
    setSlackLoading(false)
    setShowSlackSend(false)
  }

  const handleSendProductivityUpdate = async () => {
    if (!slackConnected) return

    try {
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
      }

      const success = await slackService.sendProductivityUpdate(stats, defaultChannel)
      if (success) {
        toast({
          title: "Báo cáo năng suất đã gửi",
          description: `Báo cáo đã được gửi đến ${defaultChannel}`,
        })
      }
    } catch (error) {
      console.error('Send productivity update error:', error)
      toast({
        title: "Lỗi gửi báo cáo",
        description: "Không thể gửi báo cáo đến Slack.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-3">
      {/* Gmail Integration */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-red-500" />
              <CardTitle className="text-sm">Gmail</CardTitle>
              <Badge variant={gmailConnected ? "default" : "secondary"} className="text-xs">
                {gmailConnected ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" />Kết nối</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" />Chưa kết nối</>
                )}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          {gmailConnected ? (
            <div className="space-y-2">
              {gmailUser && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {gmailUser.emailAddress?.charAt(0).toUpperCase() || 'G'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{gmailUser.emailAddress}</p>
                    <p className="text-xs text-muted-foreground">Đã kết nối</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Dialog open={showGmailSync} onOpenChange={setShowGmailSync}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1 gap-2" disabled={gmailLoading}>
                      {gmailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sync className="h-4 w-4" />}
                      Sync Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sync Email thành Task</DialogTitle>
                      <DialogDescription>
                        Tự động tạo task từ email có chứa từ khóa quan trọng
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="sync-keywords">Từ khóa (phân cách bằng dấu phẩy)</Label>
                        <Input
                          id="sync-keywords"
                          value={syncKeywords}
                          onChange={(e) => setSyncKeywords(e.target.value)}
                          placeholder="deadline,assignment,homework,meeting"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email chứa các từ khóa này sẽ được chuyển thành task
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto-sync"
                          checked={autoSync}
                          onCheckedChange={setAutoSync}
                        />
                        <Label htmlFor="auto-sync" className="text-sm">
                          Tự động sync định kỳ
                        </Label>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowGmailSync(false)}>
                          Hủy
                        </Button>
                        <Button onClick={handleGmailSync} disabled={gmailLoading}>
                          {gmailLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Sync Ngay
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="outline" onClick={handleGmailDisconnect}>
                  <Unlink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleGmailConnect} disabled={gmailLoading} className="w-full gap-2">
              {gmailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
              Kết nối Gmail
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Slack Integration */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-sm">Slack</CardTitle>
              <Badge variant={slackConnected ? "default" : "secondary"} className="text-xs">
                {slackConnected ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" />Kết nối</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" />Chưa kết nối</>
                )}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          {slackConnected ? (
            <div className="space-y-2">
              {slackUser && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {slackUser.real_name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{slackUser.real_name}</p>
                    <p className="text-xs text-muted-foreground">@{slackUser.name}</p>
                  </div>
                </div>
              )}

              {/* Channel Selection */}
              <div>
                <Label htmlFor="slack-channel" className="text-xs">Kênh mặc định</Label>
                <Select value={defaultChannel} onValueChange={setDefaultChannel}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#tasks">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        tasks
                      </div>
                    </SelectItem>
                    <SelectItem value="#general">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        general
                      </div>
                    </SelectItem>
                    <SelectItem value="#productivity">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        productivity
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Dialog open={showSlackSend} onOpenChange={setShowSlackSend}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1 gap-2">
                      <Send className="h-4 w-4" />
                      Gửi Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Gửi Task đến Slack</DialogTitle>
                      <DialogDescription>
                        Chọn task để gửi đến kênh Slack
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Chọn Task</Label>
                        <Select onValueChange={(value) => {
                          const task = tasks.find(t => t.id === value)
                          setSelectedTask(task || null)
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn task..." />
                          </SelectTrigger>
                          <SelectContent>
                            {tasks.filter(t => t.status !== 'completed').map((task) => (
                              <SelectItem key={task.id} value={task.id}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    task.priority === 'high' ? 'bg-red-500' :
                                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`} />
                                  <span className="truncate">{task.title}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Kênh</Label>
                        <Select value={defaultChannel} onValueChange={setDefaultChannel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="#tasks">#tasks</SelectItem>
                            <SelectItem value="#general">#general</SelectItem>
                            <SelectItem value="#productivity">#productivity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowSlackSend(false)}>
                          Hủy
                        </Button>
                        <Button 
                          onClick={() => selectedTask && handleSendTaskToSlack(selectedTask)} 
                          disabled={!selectedTask || slackLoading}
                        >
                          {slackLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Gửi Task
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button size="sm" variant="outline" onClick={handleSendProductivityUpdate} disabled={slackLoading}>
                  <Zap className="h-4 w-4" />
                </Button>

                <Button size="sm" variant="outline" onClick={handleSlackDisconnect}>
                  <Unlink className="h-4 w-4" />
                </Button>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">Thông báo tự động</span>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </div>
          ) : (
            <Button onClick={handleSlackConnect} disabled={slackLoading} className="w-full gap-2">
              {slackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
              Kết nối Slack
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {(gmailConnected || slackConnected) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {gmailConnected && (
              <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={handleGmailSync}>
                <Download className="h-4 w-4" />
                Sync Email mới
              </Button>
            )}
            {slackConnected && (
              <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={handleSendProductivityUpdate}>
                <Upload className="h-4 w-4" />
                Gửi báo cáo năng suất
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}