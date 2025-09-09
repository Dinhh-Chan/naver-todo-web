"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { AIEngine } from "@/lib/ai-engine"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  Target, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Zap,
  BarChart3,
  Lightbulb,
  ArrowLeft
} from "lucide-react"
import { format } from "date-fns"

interface AIDashboardProps {
  tasks: Task[]
  onApplySuggestion: (taskId: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void
  onBack?: () => void
}

export function AIDashboard({ tasks, onApplySuggestion, onBack }: AIDashboardProps) {
  const [prioritizedTasks, setPrioritizedTasks] = useState<Task[]>([])
  const [scheduleSuggestions, setScheduleSuggestions] = useState<Array<{
    taskId: string
    suggestedTime: Date
    reasoning: string
  }>>([])
  const [smartNotifications, setSmartNotifications] = useState<Array<{
    type: string
    message: string
    taskId?: string
  }>>([])

  useEffect(() => {
    // Generate AI-powered insights
    const prioritized = AIEngine.suggestTaskPrioritization(tasks)
    setPrioritizedTasks(prioritized.slice(0, 5))

    const schedule = AIEngine.suggestOptimalSchedule(tasks)
    setScheduleSuggestions(schedule.slice(0, 3))

    const notifications = AIEngine.generateSmartNotifications(tasks)
    setSmartNotifications(notifications)
  }, [tasks])

  const handleApplyPriority = (taskId: string, newPriority: Task["priority"]) => {
    onApplySuggestion(taskId, { priority: newPriority })
  }

  const handleApplySchedule = (taskId: string, suggestedTime: Date) => {
    onApplySuggestion(taskId, { dueDate: suggestedTime })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "info":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Brain className="h-4 w-4 text-primary" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-destructive/20 bg-destructive/5"
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
      case "info":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
      default:
        return "border-primary/20 bg-primary/5"
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <h2 className="text-xl font-semibold">AI Dashboard</h2>
        </div>
      )}

      {/* Smart Notifications */}
      {smartNotifications.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Smart Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {smartNotifications.map((notification, index) => (
                <div key={index} className={`p-3 border rounded-lg ${getNotificationColor(notification.type)}`}>
                  <div className="flex items-start gap-2">
                    {getNotificationIcon(notification.type)}
                    <span className="text-sm">{notification.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI-Prioritized Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              AI-Prioritized Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prioritizedTasks.map((task, index) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={
                            task.priority === "high"
                              ? "bg-destructive text-destructive-foreground"
                              : task.priority === "medium"
                                ? "bg-secondary text-secondary-foreground"
                                : "bg-muted text-muted-foreground"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due: {format(task.dueDate, "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplyPriority(task.id, "high")}
                      className="text-xs"
                    >
                      Prioritize
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Optimal Schedule Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Optimal Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduleSuggestions.map((suggestion) => {
                const task = tasks.find(t => t.id === suggestion.taskId)
                if (!task) return null

                return (
                  <div key={suggestion.taskId} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {suggestion.reasoning}
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {format(suggestion.suggestedTime, "MMM d, h:mm a")}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplySchedule(task.id, suggestion.suggestedTime)}
                        className="text-xs"
                      >
                        Schedule
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Productivity Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Procrastination Analysis */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">Procrastination Factor</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {tasks.filter(t => t.procrastinationFactor).length > 0 
                  ? (tasks.filter(t => t.procrastinationFactor).reduce((sum, t) => sum + (t.procrastinationFactor || 1), 0) / tasks.filter(t => t.procrastinationFactor).length).toFixed(1)
                  : "1.0"
                }x
              </div>
              <p className="text-xs text-muted-foreground">
                Average time vs estimate
              </p>
            </div>

            {/* Productivity Score */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-green-500" />
                <span className="font-medium text-sm">Productivity Score</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {tasks.length > 0 
                  ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100)
                  : 0
                }%
              </div>
              <Progress 
                value={tasks.length > 0 ? (tasks.filter(t => t.status === "completed").length / tasks.length) * 100 : 0} 
                className="mt-2" 
              />
            </div>

            {/* Time Accuracy */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Time Accuracy</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {tasks.filter(t => t.estimatedTime && t.actualTime).length > 0
                  ? Math.round(
                      tasks.filter(t => t.estimatedTime && t.actualTime)
                        .reduce((sum, t) => sum + Math.abs((t.actualTime || 0) - (t.estimatedTime || 0)), 0) /
                      tasks.filter(t => t.estimatedTime && t.actualTime).length
                    )
                  : 0
                }m
              </div>
              <p className="text-xs text-muted-foreground">
                Average estimation error
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {AIEngine.generateProductivityTips(tasks).map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
