"use client"

import { useState, useEffect } from "react"
import type { Project, PMTask } from "@/lib/types"
import { useProjects } from "@/hooks/use-projects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wand2,
  Target,
  Users,
  FileText,
  BarChart3
} from "lucide-react"
// import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProjectPMTasksProps {
  project: Project
}

export function ProjectPMTasks({ project }: ProjectPMTasksProps) {
  const { getProjectMembers } = useProjects()
  const [pmTasks, setPMTasks] = useState<PMTask[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<PMTask | null>(null)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as PMTask["priority"],
    dueDate: "",
    assignedTo: "",
  })

  const projectMembers = getProjectMembers(project.id)
  const memberUsernames = projectMembers.map(m => m.username)

  // Mock PM tasks for demonstration
  const mockPMTasks: PMTask[] = [
    {
      id: "1",
      title: "Invite team members",
      description: "Send invitations to all project stakeholders",
      status: "completed",
      priority: "high",
      dueDate: new Date(),
      assignedTo: "admin",
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(),
      projectId: project.id,
    },
    {
      id: "2",
      title: "Set project milestones",
      description: "Define key milestones and deadlines",
      status: "in-progress",
      priority: "high",
      dueDate: new Date(Date.now() + 86400000 * 2),
      assignedTo: "admin",
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(),
      projectId: project.id,
    },
    {
      id: "3",
      title: "Review progress weekly",
      description: "Schedule weekly progress review meetings",
      status: "todo",
      priority: "medium",
      dueDate: new Date(Date.now() + 86400000 * 7),
      assignedTo: "john_doe",
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
      projectId: project.id,
    },
    {
      id: "4",
      title: "Assign initial tasks",
      description: "Distribute tasks among team members",
      status: "todo",
      priority: "medium",
      dueDate: new Date(Date.now() + 86400000 * 3),
      assignedTo: "admin",
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
      projectId: project.id,
    },
  ]

  useEffect(() => {
    setPMTasks(mockPMTasks)
  }, [project.id])

  const completedTasks = pmTasks.filter(task => task.status === "completed").length
  const totalTasks = pmTasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const handleAddTask = () => {
    if (!newTask.title.trim()) return

    const task: PMTask = {
      id: crypto.randomUUID(),
      title: newTask.title,
      description: newTask.description,
      status: "todo",
      priority: newTask.priority,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      assignedTo: newTask.assignedTo || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: project.id,
    }

    setPMTasks(prev => [...prev, task])
    setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: "" })
    setShowAddDialog(false)
  }

  const handleEditTask = (task: PMTask) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : "",
      assignedTo: task.assignedTo || "",
    })
    setShowAddDialog(true)
  }

  const handleUpdateTask = () => {
    if (!editingTask || !newTask.title.trim()) return

    const updatedTask: PMTask = {
      ...editingTask,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      assignedTo: newTask.assignedTo || undefined,
      updatedAt: new Date(),
    }

    setPMTasks(prev => prev.map(task => task.id === editingTask.id ? updatedTask : task))
    setEditingTask(null)
    setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: "" })
    setShowAddDialog(false)
  }

  const handleDeleteTask = (id: string) => {
    setPMTasks(prev => prev.filter(task => task.id !== id))
  }

  const handleToggleStatus = (id: string) => {
    setPMTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newStatus: PMTask["status"] = task.status === "completed" ? "todo" : "completed"
        return { ...task, status: newStatus, updatedAt: new Date() }
      }
      return task
    }))
  }

  const generateAITasks = () => {
    const aiGeneratedTasks: PMTask[] = [
      {
        id: crypto.randomUUID(),
        title: "Schedule team meeting",
        description: "Organize weekly team sync based on project deadlines",
        status: "todo",
        priority: "medium",
        dueDate: new Date(Date.now() + 86400000 * 2),
        assignedTo: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId: project.id,
        isAIGenerated: true,
      },
      {
        id: crypto.randomUUID(),
        title: "Review task assignments",
        description: "Ensure balanced workload distribution among team members",
        status: "todo",
        priority: "low",
        dueDate: new Date(Date.now() + 86400000 * 5),
        assignedTo: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId: project.id,
        isAIGenerated: true,
      },
      {
        id: crypto.randomUUID(),
        title: "Update project documentation",
        description: "Keep project documentation up to date with latest changes",
        status: "todo",
        priority: "low",
        dueDate: new Date(Date.now() + 86400000 * 7),
        assignedTo: "jane_smith",
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId: project.id,
        isAIGenerated: true,
      },
    ]

    setPMTasks(prev => [...prev, ...aiGeneratedTasks])
  }

  const getPriorityColor = (priority: PMTask["priority"]) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground"
      case "medium": return "bg-secondary text-secondary-foreground"
      case "low": return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: PMTask["status"]) => {
    switch (status) {
      case "completed": return <CheckSquare className="h-5 w-5 text-green-500" />
      case "in-progress": return <Clock className="h-5 w-5 text-blue-500" />
      case "todo": return <Square className="h-5 w-5 text-muted-foreground" />
    }
  }

  const isOverdue = (dueDate?: Date) => {
    return dueDate && dueDate < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Công việc PM</h2>
          <p className="text-muted-foreground">Quản lý các nhiệm vụ quản lý dự án</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={generateAITasks}
            className="gap-2"
          >
            <Wand2 className="h-4 w-4" />
            AI Generate Tasks
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Chỉnh sửa PM Task" : "Thêm PM Task mới"}
                </DialogTitle>
                <DialogDescription>
                  {editingTask 
                    ? "Cập nhật thông tin task quản lý dự án"
                    : "Tạo task mới cho quản lý dự án"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Tiêu đề</Label>
                  <Input
                    id="task-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nhập tiêu đề task..."
                  />
                </div>
                <div>
                  <Label htmlFor="task-description">Mô tả</Label>
                  <Textarea
                    id="task-description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả chi tiết task..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="task-priority">Độ ưu tiên</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: PMTask["priority"]) => setNewTask(prev => ({ ...prev, priority: value }))}
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
                    <Label htmlFor="task-due-date">Due Date</Label>
                    <Input
                      id="task-due-date"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="task-assignee">Assign To</Label>
                  <Select
                    value={newTask.assignedTo}
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: value }))}
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
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => {
                    setShowAddDialog(false)
                    setEditingTask(null)
                    setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: "" })
                  }}>
                    Hủy
                  </Button>
                  <Button onClick={editingTask ? handleUpdateTask : handleAddTask}>
                    {editingTask ? "Cập nhật" : "Thêm task"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            PM Tasks Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm text-muted-foreground">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{totalTasks}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{completedTasks}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{totalTasks - completedTasks}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PM Tasks List */}
      <div className="space-y-4">
        {pmTasks.map((task) => (
          <Card key={task.id} className={`transition-all hover:shadow-md ${
            isOverdue(task.dueDate) && task.status !== "completed" ? "border-destructive" : ""
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto" 
                    onClick={() => handleToggleStatus(task.id)}
                  >
                    {getStatusIcon(task.status)}
                  </Button>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium ${
                        task.status === "completed" ? "line-through text-muted-foreground" : ""
                      }`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        {task.isAIGenerated && (
                          <Badge variant="outline" className="text-xs">
                            <Wand2 className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {task.dueDate && (
                        <div className={`flex items-center gap-1 ${
                          isOverdue(task.dueDate) && task.status !== "completed" ? "text-destructive" : ""
                        }`}>
                          <Calendar className="h-3 w-3" />
                          {task.dueDate.toLocaleDateString('vi-VN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      )}

                      {task.assignedTo && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignedTo}
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.createdAt.toLocaleDateString('vi-VN', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditTask(task)}
                    className="p-1 h-auto"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 h-auto text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {pmTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="rounded-full bg-muted p-4 w-fit mx-auto">
                <CheckSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Chưa có PM task nào</h3>
                <p className="text-muted-foreground mb-4">
                  Bắt đầu bằng cách tạo task quản lý dự án đầu tiên
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo task thủ công
                  </Button>
                  <Button variant="outline" onClick={generateAITasks} className="gap-2">
                    <Wand2 className="h-4 w-4" />
                    AI Generate
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
