"use client"

import { useState } from "react"
import type { Project } from "@/lib/types"
import { useProjects } from "@/hooks/use-projects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Users, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Settings,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"
import { format } from "date-fns"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProjectsViewProps {
  onProjectSelect?: (project: Project) => void
  tasks?: any[] // Add tasks prop for filtering
}

export function ProjectsView({ onProjectSelect, tasks = [] }: ProjectsViewProps) {
  const { projects, currentUser, addProject, deleteProject, getProjectStats } = useProjects()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#3b82f6"
  })

  const handleCreateProject = () => {
    if (!newProject.name.trim() || !currentUser) return

    const project = addProject({
      name: newProject.name,
      description: newProject.description,
      owner: currentUser.username,
      members: [currentUser.username],
      color: newProject.color,
    })

    if (project) {
      setNewProject({ name: "", description: "", color: "#3b82f6" })
      setShowCreateForm(false)
    }
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dự án này? Tất cả task liên quan cũng sẽ bị xóa.")) {
      deleteProject(projectId)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProjectColor = (color?: string) => {
    return color || "#3b82f6"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dự án của tôi</h2>
          <p className="text-muted-foreground">Quản lý và theo dõi tiến độ các dự án</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo dự án mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo dự án mới</DialogTitle>
              <DialogDescription>
                Tạo một dự án mới để bắt đầu quản lý công việc nhóm
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Tên dự án</Label>
                <Input
                  id="project-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên dự án..."
                />
              </div>
              <div>
                <Label htmlFor="project-description">Mô tả</Label>
                <Textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả ngắn về dự án..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="project-color">Màu chủ đạo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="project-color"
                    type="color"
                    value={newProject.color}
                    onChange={(e) => setNewProject(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <span className="text-sm text-muted-foreground">Chọn màu cho dự án</span>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateProject} disabled={!newProject.name.trim()}>
                  Tạo dự án
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Tìm kiếm dự án..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <FolderOpen className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="rounded-full bg-muted p-4 w-fit mx-auto">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "Không tìm thấy dự án" : "Chưa có dự án nào"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Bắt đầu bằng cách tạo dự án đầu tiên của bạn"
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo dự án đầu tiên
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id)
            const isOwner = currentUser?.username === project.owner

            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getProjectColor(project.color) }}
                      />
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description || "Không có mô tả"}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onProjectSelect?.(project)}>
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Mở dự án
                        </DropdownMenuItem>
                        {isOwner && (
                          <>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Cài đặt
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa dự án
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{stats.totalTasks}</div>
                        <div className="text-xs text-muted-foreground">Tổng task</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-500">{stats.completedTasks}</div>
                        <div className="text-xs text-muted-foreground">Hoàn thành</div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Tiến độ</span>
                        <span className="text-sm text-muted-foreground">{stats.completionRate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${stats.completionRate}%`,
                            backgroundColor: getProjectColor(project.color)
                          }}
                        />
                      </div>
                    </div>

                    {/* Members and Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{stats.memberCount} thành viên</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(project.createdAt, "dd/MM")}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onProjectSelect?.(project)}
                      >
                        <FolderOpen className="h-4 w-4 mr-1" />
                        Mở dự án
                      </Button>
                      {isOwner && (
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Stats Summary */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tổng quan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{projects.length}</div>
                <div className="text-sm text-muted-foreground">Tổng dự án</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-500">
                  {tasks.filter(task => task.status === "completed").length}
                </div>
                <div className="text-sm text-muted-foreground">Task hoàn thành</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-500">
                  {projects.reduce((sum, p) => sum + getProjectStats(p.id).memberCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Tổng thành viên</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-500">
                  {tasks.filter(task => task.dueDate && task.dueDate < new Date() && task.status !== "completed").length}
                </div>
                <div className="text-sm text-muted-foreground">Task quá hạn</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
