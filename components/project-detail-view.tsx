"use client"

import { useState, useEffect } from "react"
import type { Project, Task, ProjectStats } from "@/lib/types"
import { useProjects } from "@/hooks/use-projects"
import { useTasks } from "@/hooks/use-tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Settings, 
  UserPlus, 
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Calendar,
  BarChart3,
  FileText,
  CheckSquare,
  PanelRight
} from "lucide-react"
// import { format } from "date-fns"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { KanbanView } from "./kanban-view"
import { ListView } from "./list-view"
import { CalendarView } from "./calendar-view"
import { AnalyticsView } from "./analytics-view"
import { TaskForm } from "./task-form"
import { ProjectOverview } from "./project-overview"
import { ProjectDocuments } from "./project-documents"
import { ProjectPMTasks } from "./project-pm-tasks"
import { ProjectRightSidebar } from "./project-right-sidebar"

interface ProjectDetailViewProps {
  project: Project
  onBack: () => void
}

export function ProjectDetailView({ project, onBack }: ProjectDetailViewProps) {
  const { currentUser, getProjectStats, getProjectMembers, inviteMember, removeMemberFromProject } = useProjects()
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useTasks()
  const [currentView, setCurrentView] = useState<"kanban" | "list" | "calendar" | "analytics">("kanban")
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "pm-tasks" | "tasks">("overview")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)

  // Filter tasks for this project
  const projectTasks = tasks.filter(task => task.projectId === project.id)
  const projectMembers = getProjectMembers(project.id)
  const stats = getProjectStats(project.id)
  const isOwner = currentUser?.username === project.owner

  const handleCreateTask = () => {
    setEditingTask(null)
    setShowTaskForm(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleSubmitTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData)
    } else {
      addTask({
        ...taskData,
        projectId: project.id,
      })
    }
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleCancelForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return

    inviteMember(project.id, inviteEmail)
    setInviteEmail("")
    setShowInviteForm(false)
  }

  const handleRemoveMember = (username: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${username} khỏi dự án?`)) {
      removeMemberFromProject(project.id, username)
    }
  }

  const viewButtons = [
    { mode: "kanban" as const, icon: "📋", label: "Kanban" },
    { mode: "list" as const, icon: "📝", label: "Danh sách" },
    { mode: "calendar" as const, icon: "📅", label: "Lịch" },
    { mode: "analytics" as const, icon: "📊", label: "Phân tích" },
  ]

  if (showTaskForm) {
    return (
      <div className="min-h-screen bg-background p-4">
        <TaskForm 
          task={editingTask || undefined} 
          onSubmit={handleSubmitTask} 
          onCancel={handleCancelForm}
          projectMembers={projectMembers.map(m => m.username)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: project.color || "#3b82f6" }}
                />
                <div>
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="gap-2"
              >
                <PanelRight className="h-4 w-4" />
                Actions
              </Button>
              <Button className="gap-2" onClick={handleCreateTask}>
                <Plus className="h-4 w-4" />
                Thêm Task
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className={`container mx-auto px-4 py-6 transition-all duration-300 ${
        isRightSidebarOpen ? 'mr-80' : ''
      }`}>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              Tài liệu
            </TabsTrigger>
            <TabsTrigger value="pm-tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              PM Tasks
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProjectOverview project={project} />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <ProjectDocuments project={project} />
          </TabsContent>

          <TabsContent value="pm-tasks" className="space-y-6">
            <ProjectPMTasks project={project} />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            {/* View Toggle for Tasks */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Chế độ xem:</span>
              {viewButtons.map(({ mode, icon, label }) => (
                <Button
                  key={mode}
                  variant={currentView === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView(mode)}
                  className="gap-2"
                >
                  <span>{icon}</span>
                  {label}
                </Button>
              ))}
            </div>

            {/* Tasks Content */}
            {projectTasks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="rounded-full bg-muted p-4 w-fit mx-auto">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Chưa có task nào</h3>
                      <p className="text-muted-foreground mb-4">
                        Bắt đầu bằng cách tạo task đầu tiên cho dự án này
                      </p>
                      <Button onClick={handleCreateTask} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tạo Task Đầu Tiên
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                {currentView === "kanban" && (
                  <KanbanView 
                    tasks={projectTasks} 
                    onEdit={handleEditTask} 
                    onDelete={deleteTask} 
                    onUpdateTask={updateTask} 
                  />
                )}

                {currentView === "list" && (
                  <ListView 
                    tasks={projectTasks} 
                    onToggleStatus={toggleTaskStatus} 
                    onEdit={handleEditTask} 
                    onDelete={deleteTask} 
                  />
                )}

                {currentView === "calendar" && (
                  <CalendarView 
                    tasks={projectTasks} 
                    onEdit={handleEditTask} 
                  />
                )}

                {currentView === "analytics" && (
                  <AnalyticsView 
                    tasks={projectTasks} 
                    stats={{
                      total: stats.totalTasks,
                      completed: stats.completedTasks,
                      inProgress: stats.inProgressTasks,
                      overdue: stats.overdueTasks,
                      completionRate: stats.completionRate,
                      averageProcrastinationFactor: 1,
                      totalEstimatedTime: 0,
                      totalActualTime: 0
                    }} 
                  />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Sidebar */}
      <ProjectRightSidebar
        project={project}
        isOpen={isRightSidebarOpen}
        onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
      />
    </div>
  )
}
