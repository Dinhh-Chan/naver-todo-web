"use client"

import { useMemo } from "react"
import type { Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  Brain, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BarChart3
} from "lucide-react"
import { format, subDays, isSameDay, differenceInDays } from "date-fns"
import { AIEngine } from "@/lib/ai-engine"

interface AnalyticsViewProps {
  tasks: Task[]
  stats: any
}

export function AnalyticsView({ tasks, stats }: AnalyticsViewProps) {
  const analyticsData = useMemo(() => {
    const now = new Date()
    
    // Daily completions for last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      return date
    }).reverse()

    const dailyCompletions = last30Days.map((date) => {
      const completed = tasks.filter(
        (task) => task.status === "completed" && task.completedAt && isSameDay(task.completedAt, date)
      ).length

      return {
        date: format(date, "MMM d"),
        completed,
        day: format(date, "EEE"),
      }
    })

    // Weekly productivity trends
    const weeklyData = Array.from({ length: 12 }, (_, i) => {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const weekTasks = tasks.filter(task => 
        task.createdAt >= weekStart && task.createdAt <= weekEnd
      )
      
      const completed = weekTasks.filter(task => task.status === "completed").length
      const total = weekTasks.length

      return {
        week: `Week ${12 - i}`,
        completed,
        total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    }).reverse()

    // Priority distribution
    const priorityDistribution = [
      { name: "High", value: tasks.filter((t) => t.priority === "high").length, color: "#ef4444" },
      { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length, color: "#f97316" },
      { name: "Low", value: tasks.filter((t) => t.priority === "low").length, color: "#84cc16" },
    ]

    // Category breakdown
    const categoryData = tasks.reduce(
      (acc, task) => {
        if (task.category) {
          acc[task.category] = (acc[task.category] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )

    const categoryChart = Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Time analysis
    const tasksWithTime = tasks.filter(t => t.estimatedTime && t.actualTime)
    const timeAccuracy = tasksWithTime.length > 0 
      ? tasksWithTime.reduce((sum, t) => sum + Math.abs((t.actualTime || 0) - (t.estimatedTime || 0)), 0) / tasksWithTime.length
      : 0

    // Procrastination analysis
    const procrastinationData = tasks
      .filter(t => t.procrastinationFactor)
      .map(t => ({
        title: t.title.slice(0, 20) + (t.title.length > 20 ? "..." : ""),
        factor: t.procrastinationFactor || 1,
        priority: t.priority,
      }))
      .sort((a, b) => b.factor - a.factor)
      .slice(0, 10)

    // Productivity patterns
    const productivityPatterns = {
      mostProductiveDay: getMostProductiveDay(tasks),
      averageTaskDuration: Math.round(tasks.filter(t => t.actualTime).reduce((sum, t) => sum + (t.actualTime || 0), 0) / Math.max(tasks.filter(t => t.actualTime).length, 1)),
      completionStreak: getCompletionStreak(tasks),
    }

    return {
      dailyCompletions,
      weeklyData,
      priorityDistribution,
      categoryChart,
      timeAccuracy: Math.round(timeAccuracy),
      procrastinationData,
      productivityPatterns,
    }
  }, [tasks])

  const aiInsights = useMemo(() => {
    return AIEngine.analyzeTasks(tasks)
  }, [tasks])

  const productivityTips = useMemo(() => {
    return AIEngine.generateProductivityTips(tasks)
  }, [tasks])

  return (
    <div className="space-y-6">
      {/* AI Insights Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.slice(0, 4).map((insight) => (
              <div key={insight.id} className="p-3 border rounded-lg bg-background">
                <div className="flex items-start gap-2">
                  {insight.type === "warning" && <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />}
                  {insight.type === "achievement" && <Award className="h-4 w-4 text-primary mt-0.5" />}
                  {insight.type === "suggestion" && <Zap className="h-4 w-4 text-secondary mt-0.5" />}
                  {insight.type === "tip" && <Target className="h-4 w-4 text-muted-foreground mt-0.5" />}
                  <div>
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Overall productivity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procrastination Factor</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProcrastinationFactor}x</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.averageProcrastinationFactor > 1.2 ? "Above average delay" : 
               stats.averageProcrastinationFactor < 0.8 ? "Faster than estimated" : "On track"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Accuracy</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.timeAccuracy}m</div>
            <p className="text-xs text-muted-foreground mt-1">Avg. estimation error</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Level</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.completionRate >= 80 ? "Excellent" : 
               stats.completionRate >= 60 ? "Good" : 
               stats.completionRate >= 40 ? "Fair" : "Needs Improvement"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Completions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Daily Completions (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.dailyCompletions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="completed" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Weekly Productivity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completionRate" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Task Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.priorityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {analyticsData.priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tasks by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.categoryChart} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Procrastination Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Procrastination Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.procrastinationData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={
                    item.priority === "high" ? "bg-destructive" :
                    item.priority === "medium" ? "bg-secondary" : "bg-muted"
                  }>
                    {item.priority}
                  </Badge>
                  <span className="font-medium">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {item.factor > 1 ? "Took longer" : "Completed faster"}
                  </span>
                  <Badge variant={item.factor > 1.2 ? "destructive" : item.factor < 0.8 ? "default" : "secondary"}>
                    {item.factor}x
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">AI Productivity Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productivityTips.map((tip, index) => (
              <div key={index} className="p-3 border rounded-lg bg-muted/30">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function getMostProductiveDay(tasks: Task[]): string {
  const dayCounts: Record<string, number> = {}
  
  tasks
    .filter(task => task.completedAt)
    .forEach(task => {
      const day = format(task.completedAt!, "EEEE")
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })

  return Object.entries(dayCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "No data"
}

function getCompletionStreak(tasks: Task[]): number {
  const completedTasks = tasks
    .filter(task => task.completedAt)
    .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))

  if (completedTasks.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  
  for (const task of completedTasks) {
    if (task.completedAt && isSameDay(task.completedAt, currentDate)) {
      streak++
      currentDate = subDays(currentDate, 1)
    } else {
      break
    }
  }

  return streak
}
