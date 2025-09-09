"use client"

import { useState, useEffect } from "react"
import type { Task, ViewMode, Project } from "@/lib/types"
import { AIEngine } from "@/lib/ai-engine"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  X, 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  BarChart3, 
  Lightbulb, 
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Languages,
  Bell,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Folder
} from "lucide-react"
import { format, addDays } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AIAutoScheduleModal } from "@/components/ai-auto-schedule-modal"
import { IntegrationsPanel } from "@/components/integrations-panel"

interface LeftSidebarProps {
  isOpen: boolean
  onToggle: () => void
  tasks: Task[]
  projects: Project[]
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  onAddTasks: (tasks: Task[]) => void
  onUpdateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void
  onFilterTasks: (filters: any) => void
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  onProjectSelect: (project: Project) => void
}

export function LeftSidebar({ 
  isOpen, 
  onToggle, 
  tasks, 
  projects,
  onAddTask, 
  onAddTasks,
  onUpdateTask, 
  onFilterTasks,
  currentView,
  onViewChange,
  onProjectSelect
}: LeftSidebarProps) {
  // Quick Add Task State
  const [quickAdd, setQuickAdd] = useState({
    title: "",
    dueDate: "",
    priority: "medium" as Task["priority"],
    tags: "",
    estimatedTime: 0
  })

  // Filters State
  const [filters, setFilters] = useState({
    status: [] as Task["status"][],
    priority: [] as Task["priority"][],
    tags: [] as string[],
    dateRange: { start: "", end: "" },
    search: ""
  })

  // Settings State
  const [settings, setSettings] = useState({
    theme: "system",
    language: "vi",
    notifications: true,
    timeFormat: "24h"
  })

  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    quickAdd: true,
    projects: true,
    filters: false,
    aiTips: false,
    settings: false,
    analytics: false,
    integrations: false
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("anyf-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save settings to localStorage
  const updateSettings = (newSettings: Partial<typeof settings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem("anyf-settings", JSON.stringify(updated))
  }

  // Quick Add Task
  const handleQuickAdd = () => {
    if (!quickAdd.title.trim()) return

    const tags = quickAdd.tags.split(",").map(tag => tag.trim()).filter(Boolean)
    
    onAddTask({
      title: quickAdd.title,
      description: "",
      priority: quickAdd.priority,
      dueDate: quickAdd.dueDate ? new Date(quickAdd.dueDate) : undefined,
      tags,
      estimatedTime: quickAdd.estimatedTime || undefined,
      status: "todo"
    })

    // Reset form
    setQuickAdd({
      title: "",
      dueDate: "",
      priority: "medium",
      tags: "",
      estimatedTime: 0
    })
  }

  // AI Time Estimation
  const getAITimeEstimate = (title: string, tags: string) => {
    const suggestion = AIEngine.suggestTaskProperties(title, "", tasks)
    return suggestion.estimatedTime || 60
  }

  // Apply Filters
  const applyFilters = () => {
    onFilterTasks(filters)
  }

  // Clear Filters
  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      tags: [],
      dateRange: { start: "", end: "" },
      search: ""
    })
    onFilterTasks({})
  }

  // Get unique tags from tasks
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags || [])))

  // AI Tips
  const aiTips = AIEngine.generateProductivityTips(tasks)
  const insights = AIEngine.analyzeTasks(tasks)

  // Analytics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== "completed").length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) : 0,
    avgProcrastination: tasks.filter(t => t.procrastinationFactor).length > 0 
      ? (tasks.filter(t => t.procrastinationFactor).reduce((sum, t) => sum + (t.procrastinationFactor || 1), 0) / tasks.filter(t => t.procrastinationFactor).length).toFixed(1)
      : "1.0"
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed left-4 top-20 z-50"
      >
        <Settings className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-background border-r shadow-lg z-40 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Sidebar</h3>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Add Task */}
        <Collapsible open={openSections.quickAdd} onOpenChange={() => toggleSection("quickAdd")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Thêm Task Nhanh</span>
              </div>
              {openSections.quickAdd ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label htmlFor="quick-title" className="text-primary font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Tiêu đề
                  </Label>
                  <Input
                    id="quick-title"
                    value={quickAdd.title}
                    onChange={(e) => setQuickAdd(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nhập tiêu đề task..."
                    className="border-primary/30 focus-visible:ring-primary/40 bg-primary/5"
                  />
                </div>

                <div>
                  <Label htmlFor="quick-due" className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Hạn chót
                  </Label>
                  <Input
                    id="quick-due"
                    type="date"
                    value={quickAdd.dueDate}
                    onChange={(e) => setQuickAdd(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="border-blue-300 focus-visible:ring-blue-400 bg-blue-50 dark:bg-blue-950/20"
                  />
                </div>

                <div>
                  <Label htmlFor="quick-priority" className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" /> Độ ưu tiên
                  </Label>
                  <Select value={quickAdd.priority} onValueChange={(value: Task["priority"]) => setQuickAdd(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="border-amber-300 focus-visible:ring-amber-400 bg-amber-50 dark:bg-amber-950/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <span className="inline-flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-3 w-3" /> Thấp
                        </span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className="inline-flex items-center gap-2 text-amber-600">
                          <TrendingUp className="h-3 w-3" /> Trung bình
                        </span>
                      </SelectItem>
                      <SelectItem value="high">
                        <span className="inline-flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-3 w-3" /> Cao
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quick-tags" className="text-purple-600 dark:text-purple-400 font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Tags (phân cách bằng dấu phẩy)
                  </Label>
                  <Input
                    id="quick-tags"
                    value={quickAdd.tags}
                    onChange={(e) => {
                      setQuickAdd(prev => ({ ...prev, tags: e.target.value }))
                      // AI time estimation
                      const estimated = getAITimeEstimate(quickAdd.title, e.target.value)
                      setQuickAdd(prev => ({ ...prev, estimatedTime: estimated }))
                    }}
                    placeholder="Class, Project, Study..."
                    className="border-purple-300 focus-visible:ring-purple-400 bg-purple-50 dark:bg-purple-950/20"
                  />
                  {quickAdd.estimatedTime > 0 && (
                    <p className="text-xs mt-1 text-purple-700 dark:text-purple-300">
                      AI gợi ý: <span className="font-semibold">{quickAdd.estimatedTime} phút</span>
                    </p>
                  )}
                </div>

                <Button onClick={handleQuickAdd} className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white" disabled={!quickAdd.title.trim()}>
                  <Plus className="h-4 w-4 mr-2" /> Thêm Task
                </Button>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Projects Section */}
        <Collapsible open={openSections.projects} onOpenChange={() => toggleSection("projects")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>Dự án</span>
              </div>
              {openSections.projects ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <Card>
              <CardContent className="p-4 space-y-3">
                {projects.length === 0 ? (
                  <div className="text-center py-4">
                    <Folder className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chưa có dự án nào</p>
                    <Button 
                      size="sm" 
                      className="mt-2 gap-2"
                      onClick={() => onViewChange("projects")}
                    >
                      <Plus className="h-4 w-4" />
                      Tạo dự án
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projects.slice(0, 5).map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => onProjectSelect(project)}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Folder className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{project.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {tasks.filter(task => task.projectId === project.id).length} tasks
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {project.isArchived ? "Đã lưu trữ" : "Đang hoạt động"}
                        </Badge>
                      </div>
                    ))}
                    {projects.length > 5 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={() => onViewChange("projects")}
                      >
                        <FolderOpen className="h-4 w-4" />
                        Xem tất cả ({projects.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Filters and Search */}
        <Collapsible open={openSections.filters} onOpenChange={() => toggleSection("filters")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Bộ lọc & Tìm kiếm</span>
              </div>
              {openSections.filters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label htmlFor="search">Tìm kiếm</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      placeholder="Tìm kiếm task..."
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label>Trạng thái</Label>
                  <div className="space-y-2 mt-2">
                    {(["todo", "in-progress", "completed"] as Task["status"][]).map((status) => (
                      <div key={status} className="flex items-center gap-2 p-2 rounded-md border hover:bg-accent/30 transition-colors">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filters.status.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ ...prev, status: [...prev.status, status] }))
                            } else {
                              setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }))
                            }
                          }}
                          className={status === "completed" ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" : status === "in-progress" ? "data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" : "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"}
                        />
                        <Label htmlFor={`status-${status}`} className={`text-sm inline-flex items-center gap-2 ${status === "completed" ? "text-green-700 dark:text-green-400" : status === "in-progress" ? "text-amber-700 dark:text-amber-400" : "text-blue-700 dark:text-blue-400"}`}>
                          {status === "todo" && <Clock className="h-3.5 w-3.5" />}
                          {status === "in-progress" && <TrendingUp className="h-3.5 w-3.5" />}
                          {status === "completed" && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {status === "todo" ? "Chưa làm" : status === "in-progress" ? "Đang làm" : "Hoàn thành"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Độ ưu tiên</Label>
                  <div className="space-y-2 mt-2">
                    {(["low", "medium", "high"] as Task["priority"][]).map((priority) => (
                      <div key={priority} className="flex items-center gap-2 p-2 rounded-md border hover:bg-accent/30 transition-colors">
                        <Checkbox
                          id={`priority-${priority}`}
                          checked={filters.priority.includes(priority)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ ...prev, priority: [...prev.priority, priority] }))
                            } else {
                              setFilters(prev => ({ ...prev, priority: prev.priority.filter(p => p !== priority) }))
                            }
                          }}
                          className={priority === "high" ? "data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600" : priority === "medium" ? "data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" : "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"}
                        />
                        <Label htmlFor={`priority-${priority}`} className={`text-sm inline-flex items-center gap-2 ${priority === "high" ? "text-red-700 dark:text-red-400" : priority === "medium" ? "text-amber-700 dark:text-amber-400" : "text-green-700 dark:text-green-400"}`}>
                          {priority === "low" && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {priority === "medium" && <TrendingUp className="h-3.5 w-3.5" />}
                          {priority === "high" && <AlertTriangle className="h-3.5 w-3.5" />}
                          {priority === "low" ? "Thấp" : priority === "medium" ? "Trung bình" : "Cao"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <Select onValueChange={(value) => {
                    if (!filters.tags.includes(value)) {
                      setFilters(prev => ({ ...prev, tags: [...prev.tags, value] }))
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tag..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filters.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filters.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={applyFilters} size="sm" className="flex-1">
                    Áp dụng
                  </Button>
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* AI Productivity Tips */}
        <Collapsible open={openSections.aiTips} onOpenChange={() => toggleSection("aiTips")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span>AI Tips</span>
              </div>
              {openSections.aiTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <Card>
              <CardContent className="p-4 space-y-3">
                {aiTips.slice(0, 3).map((tip, index) => (
                  <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  </div>
                ))}
                
                {insights.slice(0, 2).map((insight) => (
                  <div key={insight.id} className={`p-3 rounded-lg ${
                    insight.type === "warning" ? "bg-red-50 dark:bg-red-950" :
                    insight.type === "achievement" ? "bg-green-50 dark:bg-green-950" :
                    "bg-yellow-50 dark:bg-yellow-950"
                  }`}>
                    <div className="flex items-start gap-2">
                      {insight.type === "warning" && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />}
                      {insight.type === "achievement" && <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />}
                      {insight.type === "suggestion" && <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />}
                      <div>
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Settings */}
        <Collapsible open={openSections.settings} onOpenChange={() => toggleSection("settings")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Cài đặt</span>
              </div>
              {openSections.settings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label>Chế độ xem</Label>
                  <Select value={currentView} onValueChange={(value: ViewMode) => onViewChange(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">Danh sách</SelectItem>
                      <SelectItem value="kanban">Bảng Kanban</SelectItem>
                      <SelectItem value="calendar">Lịch</SelectItem>
                      <SelectItem value="analytics">Phân tích</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSettings({ theme: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Sáng</SelectItem>
                      <SelectItem value="dark">Tối</SelectItem>
                      <SelectItem value="system">Hệ thống</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ngôn ngữ</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSettings({ language: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Thông báo</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) => updateSettings({ notifications: !!checked })}
                    />
                    <Label htmlFor="notifications" className="text-sm">
                      Bật thông báo
                    </Label>
                  </div>
                </div>

                <div>
                  <Label>Định dạng thời gian</Label>
                  <Select value={settings.timeFormat} onValueChange={(value) => updateSettings({ timeFormat: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 giờ</SelectItem>
                      <SelectItem value="24h">24 giờ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Analytics Snapshot */}
        <Collapsible open={openSections.analytics} onOpenChange={() => toggleSection("analytics")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Thống kê</span>
              </div>
              {openSections.analytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">Tổng task</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
                    <div className="text-xs text-muted-foreground">Hoàn thành</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
                    <div className="text-xs text-muted-foreground">Quá hạn</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">{stats.avgProcrastination}x</div>
                    <div className="text-xs text-muted-foreground">Trì hoãn</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tỷ lệ hoàn thành</span>
                    <span className="text-sm text-muted-foreground">{stats.completionRate}%</span>
                  </div>
                  <Progress value={stats.completionRate} className="h-2" />
                </div>

                <AIAutoScheduleModal
                  tasks={tasks}
                  onApplySchedule={(suggestions) => {
                    suggestions.forEach(suggestion => {
                      onUpdateTask(suggestion.taskId, { dueDate: suggestion.suggestedTime })
                    })
                  }}
                  trigger={
                    <Button className="w-full gap-2">
                      <Zap className="h-4 w-4" />
                      AI Tự động lên lịch
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Integrations Panel */}
        <Collapsible open={openSections.integrations} onOpenChange={() => toggleSection("integrations")}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Tích hợp</span>
              </div>
              {openSections.integrations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <IntegrationsPanel tasks={tasks} onAddTasks={onAddTasks} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
