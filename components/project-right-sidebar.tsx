"use client"

import { useState } from "react"
import type { Project } from "@/lib/types"
import { useProjects } from "@/hooks/use-projects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Users, 
  UserPlus, 
  Plus, 
  Settings, 
  Bell, 
  Share2,
  Download,
  Upload,
  MessageSquare,
  Calendar,
  Target,
  BarChart3,
  FileText,
  Link,
  Mail,
  Slack
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProjectRightSidebarProps {
  project: Project
  isOpen: boolean
  onToggle: () => void
}

export function ProjectRightSidebar({ project, isOpen, onToggle }: ProjectRightSidebarProps) {
  const { getProjectMembers, inviteMember } = useProjects()
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showQuickTaskDialog, setShowQuickTaskDialog] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: "",
    message: "",
  })
  const [quickTask, setQuickTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium" as "low" | "medium" | "high",
  })

  const projectMembers = getProjectMembers(project.id)
  const memberUsernames = projectMembers.map(m => m.username)

  const handleInviteMember = () => {
    if (!inviteData.email.trim()) return

    inviteMember(project.id, inviteData.email)
    setInviteData({ email: "", message: "" })
    setShowInviteDialog(false)
  }

  const handleCreateQuickTask = () => {
    if (!quickTask.title.trim()) return

    // This would integrate with the main task creation system
    console.log("Creating quick task:", quickTask)
    setQuickTask({ title: "", description: "", assignedTo: "", priority: "medium" as "low" | "medium" | "high" })
    setShowQuickTaskDialog(false)
  }

  const quickActions = [
    {
      icon: UserPlus,
      label: "Mời thành viên",
      description: "Thêm thành viên mới vào dự án",
      onClick: () => setShowInviteDialog(true),
      color: "text-blue-500"
    },
    {
      icon: Plus,
      label: "Tạo task nhanh",
      description: "Tạo task mới cho dự án",
      onClick: () => setShowQuickTaskDialog(true),
      color: "text-green-500"
    },
    {
      icon: Share2,
      label: "Chia sẻ dự án",
      description: "Chia sẻ dự án với người khác",
      onClick: () => console.log("Share project"),
      color: "text-purple-500"
    },
    {
      icon: Download,
      label: "Export dữ liệu",
      description: "Xuất dữ liệu dự án",
      onClick: () => console.log("Export project"),
      color: "text-orange-500"
    },
  ]

  const integrations = [
    {
      icon: Mail,
      label: "Gmail",
      description: "Sync email attachments",
      connected: false,
      onClick: () => console.log("Connect Gmail"),
    },
    {
      icon: Slack,
      label: "Slack",
      description: "Share updates in channels",
      connected: false,
      onClick: () => console.log("Connect Slack"),
    },
    {
      icon: Calendar,
      label: "Calendar",
      description: "Sync project deadlines",
      connected: false,
      onClick: () => console.log("Connect Calendar"),
    },
  ]

  if (!isOpen) {
    return (
      <div className="fixed right-0 top-0 h-full w-12 bg-card border-l border-border z-40">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full h-12 rounded-none"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border z-40 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Project Actions</h3>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            ×
          </Button>
        </div>

        {/* Project Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dự án hiện tại</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color || "#3b82f6" }}
              />
              <span className="font-medium text-sm">{project.name}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {project.description || "Không có mô tả"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{projectMembers.length} thành viên</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto p-3"
                onClick={action.onClick}
              >
                <div className="flex items-center gap-3">
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                  <div className="text-left">
                    <div className="text-sm font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Thành viên nhóm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {projectMembers.map((member) => (
              <div key={member.username} className="flex items-center gap-2 p-2 bg-muted rounded">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {member.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{member.username}</div>
                  <div className="text-xs text-muted-foreground">
                    {member.username === project.owner ? "Chủ dự án" : "Thành viên"}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tích hợp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {integrations.map((integration, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <integration.icon className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-medium">{integration.label}</div>
                    <div className="text-xs text-muted-foreground">{integration.description}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={integration.onClick}
                  className="text-xs"
                >
                  {integration.connected ? "Connected" : "Connect"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-muted-foreground text-center py-4">
              Không có hoạt động gần đây
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mời thành viên</DialogTitle>
            <DialogDescription>
              Mời thành viên mới tham gia dự án "{project.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="invite-message">Lời nhắn (tùy chọn)</Label>
              <Textarea
                id="invite-message"
                value={inviteData.message}
                onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Lời nhắn cho người được mời..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleInviteMember} disabled={!inviteData.email.trim()}>
                Gửi lời mời
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Task Dialog */}
      <Dialog open={showQuickTaskDialog} onOpenChange={setShowQuickTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo task nhanh</DialogTitle>
            <DialogDescription>
              Tạo task mới cho dự án "{project.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quick-task-title">Tiêu đề</Label>
              <Input
                id="quick-task-title"
                value={quickTask.title}
                onChange={(e) => setQuickTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tiêu đề task..."
              />
            </div>
            <div>
              <Label htmlFor="quick-task-description">Mô tả</Label>
              <Textarea
                id="quick-task-description"
                value={quickTask.description}
                onChange={(e) => setQuickTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả task..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quick-task-priority">Độ ưu tiên</Label>
                <Select
                  value={quickTask.priority}
                  onValueChange={(value: "low" | "medium" | "high") => 
                    setQuickTask(prev => ({ ...prev, priority: value as "low" | "medium" | "high" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quick-task-assignee">Assign To</Label>
                <Select
                  value={quickTask.assignedTo}
                  onValueChange={(value) => setQuickTask(prev => ({ ...prev, assignedTo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {memberUsernames.map((member) => (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowQuickTaskDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateQuickTask} disabled={!quickTask.title.trim()}>
                Tạo task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
