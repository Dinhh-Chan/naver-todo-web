"use client"

import { useState, useEffect } from "react"
import type { ViewMode, Task, Project } from "@/lib/types"
import { useTasks } from "@/hooks/use-tasks"
import { useProjects } from "@/hooks/use-projects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TaskForm } from "@/components/task-form"
import { ListView } from "@/components/list-view"
import { KanbanView } from "@/components/kanban-view"
import { CalendarView } from "@/components/calendar-view"
import { AnalyticsView } from "@/components/analytics-view"
import { ProjectsView } from "@/components/projects-view"
import { ProjectDetailView } from "@/components/project-detail-view"
import { AIInsights } from "@/components/ai-insights"
import { SmartNotifications } from "@/components/smart-notifications"
import { AIDashboard } from "@/components/ai-dashboard"
import { ThemeToggle } from "@/components/theme-toggle"
import { SyncStatus } from "@/components/sync-status"
import { LeftSidebar } from "@/components/left-sidebar"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { Kanban, Calendar, List, Plus, CheckCircle2, Clock, AlertTriangle, BarChart3, FolderOpen, Menu } from "lucide-react"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<ViewMode>("list")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Start closed on mobile
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false) // Sidebar expanded state
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { tasks, stats, addTask, addTasks, updateTask, deleteTask, toggleTaskStatus } = useTasks()
  const { projects, currentUser } = useProjects()

  // Update filtered tasks when tasks change
  useEffect(() => {
    setFilteredTasks(tasks)
  }, [tasks])

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsSidebarOpen(true)
        setIsSidebarExpanded(true) // Start expanded on desktop
      } else {
        setIsSidebarOpen(false)
        setIsSidebarExpanded(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Handle sidebar collapse
  const handleSidebarCollapse = () => {
    setIsSidebarExpanded(false)
  }

  // Handle sidebar expand
  const handleSidebarExpand = () => {
    setIsSidebarExpanded(true)
  }

  const viewButtons = [
    { mode: "list" as ViewMode, icon: List, label: "Danh sách" },
    { mode: "kanban" as ViewMode, icon: Kanban, label: "Bảng Kanban" },
    { mode: "calendar" as ViewMode, icon: Calendar, label: "Lịch" },
    { mode: "analytics" as ViewMode, icon: BarChart3, label: "Phân tích" },
  ]

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
      addTask(taskData)
    }
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleCancelForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleFilterTasks = (filters: any) => {
    let filtered = [...tasks]

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status))
    }

    // Apply priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority))
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(task => 
        task.tags && task.tags.some(tag => filters.tags.includes(tag))
      )
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)
      filtered = filtered.filter(task => 
        task.dueDate && task.dueDate >= startDate && task.dueDate <= endDate
      )
    }

    setFilteredTasks(filtered)
  }

  const handleBackFromAI = () => {
    // This will be handled by the parent component
    // For now, just close the AI dashboard
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    setCurrentView("projects") // Switch to projects view when opening a project
  }

  const handleBackFromProject = () => {
    setSelectedProject(null)
    setCurrentView("projects")
  }

  if (showTaskForm) {
    return (
      <div className="min-h-screen p-4 bg-black">
        <TaskForm task={editingTask || undefined} onSubmit={handleSubmitTask} onCancel={handleCancelForm} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-[100] h-16">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AnyF Time Manager</h1>
                <p className="text-sm text-muted-foreground">Quản lý công việc học tập thông minh với AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsDropdown onTaskClick={(taskId) => {
                const task = tasks.find(t => t.id === taskId)
                if (task) {
                  handleEditTask(task)
                }
              }} />
              <SmartNotifications tasks={tasks} onTaskClick={(taskId) => {
                const task = tasks.find(t => t.id === taskId)
                if (task) {
                  handleEditTask(task)
                }
              }} />
              <ThemeToggle />
              <Button className="gap-2" onClick={handleCreateTask}>
                <Plus className="h-4 w-4" />
                Thêm Task
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className={`transition-all duration-300 ease-in-out ${
        isSidebarOpen 
          ? (isSidebarExpanded ? 'lg:ml-[250px] md:ml-[250px] ml-0' : 'lg:ml-[50px] md:ml-[50px] ml-0') 
          : 'ml-0'
      }`}>
        <div className="container mx-auto px-4 py-6">
        
        {/* AI Dashboard for analytics view */}
        {currentView === "analytics" && (
          <AIDashboard tasks={filteredTasks} onApplySuggestion={updateTask} onBack={handleBackFromAI} />
        )}

        {/* Sync Status */}
        <SyncStatus />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Tổng Task</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400">{stats.total === 0 ? "Chưa có task nào" : "Tất cả task"}</p>
            </CardContent>
          </Card>

          <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Đang làm</CardTitle>
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.inProgress}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400">Task đang thực hiện</p>
            </CardContent>
          </Card>

          <Card className="border-green-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Hoàn thành</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.completed}</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                {stats.total > 0 ? `${stats.completionRate}% hoàn thành` : "Task đã xong"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-300 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 dark:border-red-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Quá hạn</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.overdue}</div>
              <p className="text-xs text-red-600 dark:text-red-400">Quá thời hạn</p>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium text-muted-foreground">Chế độ xem:</span>
          {viewButtons.map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={currentView === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentView(mode)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Main Content Area */}
        {selectedProject ? (
          <ProjectDetailView project={selectedProject} onBack={handleBackFromProject} />
        ) : currentView === "projects" ? (
          <ProjectsView onProjectSelect={handleProjectSelect} tasks={tasks} />
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Chào mừng đến với AnyF Time Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Chưa có task nào</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Bắt đầu bằng cách tạo task đầu tiên của bạn. Quản lý công việc học tập hiệu quả với nhiều chế độ xem khác nhau.
                </p>
                <Button className="gap-2" onClick={handleCreateTask}>
                  <Plus className="h-4 w-4" />
                  Tạo Task Đầu Tiên
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            {currentView === "list" && (
              <ListView tasks={filteredTasks} onToggleStatus={toggleTaskStatus} onEdit={handleEditTask} onDelete={deleteTask} />
            )}

            {currentView === "kanban" && (
              <KanbanView tasks={filteredTasks} onEdit={handleEditTask} onDelete={deleteTask} onUpdateTask={updateTask} />
            )}

            {currentView === "calendar" && <CalendarView tasks={filteredTasks} onEdit={handleEditTask} />}

            {currentView === "analytics" && <AnalyticsView tasks={filteredTasks} stats={stats} />}
          </div>
        )}
        </div>
      </div>

      {/* Left Sidebar */}
      <LeftSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        tasks={tasks}
        projects={projects}
        onAddTask={addTask}
        onAddTasks={addTasks}
        onUpdateTask={updateTask}
        onFilterTasks={handleFilterTasks}
        currentView={currentView}
        onViewChange={setCurrentView}
        onProjectSelect={handleProjectSelect}
        onCollapse={handleSidebarCollapse}
        onExpand={handleSidebarExpand}
      />
    </div>
  )
}
