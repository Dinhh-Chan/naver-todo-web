"use client"

import { useState, useEffect } from "react"
import type { Project, ProjectOverviewData, ProjectWidget } from "@/lib/types"
import { useProjects } from "@/hooks/use-projects"
import { useTasks } from "@/hooks/use-tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Settings
} from "lucide-react"
// import { format } from "date-fns"
import { AIEngine } from "@/lib/ai-engine"

interface ProjectOverviewProps {
  project: Project
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const { getProjectStats, getProjectMembers, getProjectActivities } = useProjects()
  const { tasks } = useTasks()
  const [overviewData, setOverviewData] = useState<ProjectOverviewData | null>(null)
  const [widgets, setWidgets] = useState<ProjectWidget[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const projectTasks = tasks.filter(task => task.projectId === project.id)
  const projectMembers = getProjectMembers(project.id)
  const stats = getProjectStats(project.id)
  const activities = getProjectActivities(project.id)

  useEffect(() => {
    generateOverviewData()
    initializeWidgets()
  }, [project.id, projectTasks])

  const generateOverviewData = () => {
    setIsRefreshing(true)
    
    // Calculate metrics
    const totalTasks = projectTasks.length
    const completedTasks = projectTasks.filter(t => t.status === "completed").length
    const overdueTasks = projectTasks.filter(t => 
      t.dueDate && t.dueDate < new Date() && t.status !== "completed"
    ).length
    const memberCount = projectMembers.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate average task time
    const tasksWithTime = projectTasks.filter(t => t.actualTime && t.estimatedTime)
    const averageTaskTime = tasksWithTime.length > 0 
      ? Math.round(tasksWithTime.reduce((sum, t) => sum + (t.actualTime || 0), 0) / tasksWithTime.length)
      : 0

    // Priority distribution
    const priorityDistribution = {
      high: projectTasks.filter(t => t.priority === "high").length,
      medium: projectTasks.filter(t => t.priority === "medium").length,
      low: projectTasks.filter(t => t.priority === "low").length,
    }

    // Weekly trends (mock data for last 7 days)
    const weeklyTrends = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('vi-VN', { month: 'short', day: '2-digit' }),
        completed: Math.floor(Math.random() * 5),
        created: Math.floor(Math.random() * 3),
      }
    })

    // AI Insights
    const aiInsights = AIEngine.generateProjectInsights(project, projectTasks)

    const data: ProjectOverviewData = {
      metrics: {
        totalTasks,
        completedTasks,
        overdueTasks,
        memberCount,
        completionRate,
        averageTaskTime,
      },
      priorityDistribution,
      weeklyTrends,
      recentActivity: activities.slice(0, 5),
      aiInsights,
    }

    setOverviewData(data)
    setIsRefreshing(false)
  }

  const initializeWidgets = () => {
    const defaultWidgets: ProjectWidget[] = [
      {
        id: "metrics",
        type: "metrics",
        title: "Key Metrics",
        position: { x: 0, y: 0, w: 2, h: 1 },
      },
      {
        id: "progress",
        type: "chart",
        title: "Progress Overview",
        position: { x: 2, y: 0, w: 2, h: 1 },
      },
      {
        id: "priority",
        type: "chart",
        title: "Priority Distribution",
        position: { x: 0, y: 1, w: 2, h: 1 },
      },
      {
        id: "trends",
        type: "chart",
        title: "Weekly Trends",
        position: { x: 2, y: 1, w: 2, h: 1 },
      },
      {
        id: "members",
        type: "members",
        title: "Team Members",
        position: { x: 0, y: 2, w: 2, h: 1 },
      },
      {
        id: "insights",
        type: "insights",
        title: "AI Insights",
        position: { x: 2, y: 2, w: 2, h: 1 },
      },
    ]
    setWidgets(defaultWidgets)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground"
      case "medium": return "bg-secondary text-secondary-foreground"
      case "low": return "bg-muted text-muted-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return "🖼️"
      case "pdf": return "📄"
      case "document": return "📝"
      case "link": return "🔗"
      default: return "📁"
    }
  }

  if (!overviewData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading project overview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tổng quan Dự án</h2>
          <p className="text-muted-foreground">Thống kê và phân tích dự án {project.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateOverviewData}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Tùy chỉnh
          </Button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Key Metrics Widget */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{overviewData.metrics.totalTasks}</div>
                <div className="text-sm text-muted-foreground">Tổng Task</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{overviewData.metrics.completedTasks}</div>
                <div className="text-sm text-muted-foreground">Hoàn thành</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{overviewData.metrics.overdueTasks}</div>
                <div className="text-sm text-muted-foreground">Quá hạn</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{overviewData.metrics.memberCount}</div>
                <div className="text-sm text-muted-foreground">Thành viên</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tiến độ dự án</span>
                <span className="text-sm text-muted-foreground">{overviewData.metrics.completionRate}%</span>
              </div>
              <Progress value={overviewData.metrics.completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Hoàn thành</span>
                <span className="text-sm font-medium">{overviewData.metrics.completedTasks}</span>
              </div>
              <Progress value={(overviewData.metrics.completedTasks / overviewData.metrics.totalTasks) * 100} />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Đang làm</span>
                <span className="text-sm font-medium">{overviewData.metrics.totalTasks - overviewData.metrics.completedTasks}</span>
              </div>
              <Progress value={((overviewData.metrics.totalTasks - overviewData.metrics.completedTasks) / overviewData.metrics.totalTasks) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span className="text-sm">High</span>
                </div>
                <span className="text-sm font-medium">{overviewData.priorityDistribution.high}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span className="text-sm">Medium</span>
                </div>
                <span className="text-sm font-medium">{overviewData.priorityDistribution.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted"></div>
                  <span className="text-sm">Low</span>
                </div>
                <span className="text-sm font-medium">{overviewData.priorityDistribution.low}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectMembers.map((member) => (
                <div key={member.username} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {member.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{member.username}</div>
                    <div className="text-xs text-muted-foreground">
                      {member.username === project.owner ? "Chủ dự án" : "Thành viên"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trends Widget */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overviewData.weeklyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{trend.date}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-muted-foreground">+{trend.completed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-muted-foreground">+{trend.created}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Widget */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overviewData.aiInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overviewData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {activity.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleDateString('vi-VN', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
