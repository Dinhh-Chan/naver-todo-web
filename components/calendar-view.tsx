"use client"

import { useState, useMemo } from "react"
import type { Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Target, Clock, Award } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface CalendarViewProps {
  tasks: Task[]
  onEdit: (task: Task) => void
}

export function CalendarView({ tasks, onEdit }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return days.map((day) => {
      const dayTasks = tasks.filter((task) => task.dueDate && isSameDay(task.dueDate, day))

      return {
        date: day,
        tasks: dayTasks,
        isCurrentMonth: day >= monthStart && day <= monthEnd,
        isToday: isToday(day),
      }
    })
  }, [currentDate, tasks])

  const analyticsData = useMemo(() => {
    const now = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      return date
    }).reverse()

    const dailyCompletions = last7Days.map((date) => {
      const completed = tasks.filter(
        (task) => task.status === "completed" && task.updatedAt && isSameDay(task.updatedAt, date),
      ).length

      return {
        date: format(date, "MMM d"),
        completed,
      }
    })

    const priorityDistribution = [
      { name: "High", value: tasks.filter((t) => t.priority === "high").length, color: "#ef4444" },
      { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length, color: "#f97316" },
      { name: "Low", value: tasks.filter((t) => t.priority === "low").length, color: "#84cc16" },
    ]

    const categoryData = tasks.reduce(
      (acc, task) => {
        if (task.category) {
          acc[task.category] = (acc[task.category] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const categoryChart = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value,
    }))

    const completionRate =
      tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100) : 0
    const avgTimePerTask =
      tasks.filter((t) => t.estimatedTime).reduce((sum, t) => sum + (t.estimatedTime || 0), 0) /
      Math.max(tasks.filter((t) => t.estimatedTime).length, 1)
    const overdueCount = tasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== "completed").length

    return {
      dailyCompletions,
      priorityDistribution,
      categoryChart,
      completionRate,
      avgTimePerTask: Math.round(avgTimePerTask),
      overdueCount,
    }
  }, [tasks])

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)))
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-destructive"
      case "medium":
        return "bg-secondary"
      case "low":
        return "bg-muted"
    }
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgTimePerTask}m</div>
            <p className="text-xs text-muted-foreground">Per task estimate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{analyticsData.overdueCount}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {analyticsData.completionRate >= 80 ? "High" : analyticsData.completionRate >= 60 ? "Good" : "Low"}
            </div>
            <p className="text-xs text-muted-foreground">Current level</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {format(currentDate, "MMMM yyyy")}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[80px] p-1 border rounded-md ${
                    day.isCurrentMonth ? "bg-background" : "bg-muted/30"
                  } ${day.isToday ? "ring-2 ring-primary" : ""}`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      day.isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {format(day.date, "d")}
                  </div>

                  <div className="space-y-1">
                    {day.tasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getPriorityColor(task.priority)} text-white`}
                        onClick={() => onEdit(task)}
                        title={task.title}
                      >
                        {task.title.length > 12 ? `${task.title.slice(0, 12)}...` : task.title}
                      </div>
                    ))}
                    {day.tasks.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{day.tasks.length - 2} more</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="space-y-6">
          {/* Daily Completions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Daily Completions (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analyticsData.dailyCompletions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analyticsData.priorityDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
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
        </div>
      </div>

      {/* Category Breakdown */}
      {analyticsData.categoryChart.length > 0 && (
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
      )}

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks
              .filter((task) => task.dueDate && task.dueDate >= new Date() && task.status !== "completed")
              .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0))
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {task.dueDate && format(task.dueDate, "MMM d, yyyy")}
                  </span>
                </div>
              ))}
            {tasks.filter((task) => task.dueDate && task.dueDate >= new Date() && task.status !== "completed")
              .length === 0 && <p className="text-muted-foreground text-center py-4">No upcoming deadlines</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
