"use client"

import type { Task } from "@/lib/types"
import { AIAutoScheduleModal } from "@/components/ai-auto-schedule-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Target,
  Calendar,
  Activity
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface AnalyticsPanelProps {
  tasks: Task[]
  onUpdateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void
  isOpen: boolean
  onToggle: () => void
}

export function AnalyticsPanel({ tasks, onUpdateTask, isOpen, onToggle }: AnalyticsPanelProps) {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== "completed").length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) : 0,
    avgProcrastination: tasks.filter(t => t.procrastinationFactor).length > 0 
      ? (tasks.filter(t => t.procrastinationFactor).reduce((sum, t) => sum + (t.procrastinationFactor || 1), 0) / tasks.filter(t => t.procrastinationFactor).length).toFixed(1)
      : "1.0"
  }

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: Target,
      color: "blue",
      bgFrom: "from-blue-500",
      bgTo: "to-cyan-500"
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "green",
      bgFrom: "from-green-500",
      bgTo: "to-emerald-500"
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Activity,
      color: "amber",
      bgFrom: "from-amber-500",
      bgTo: "to-orange-500"
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      color: "red",
      bgFrom: "from-red-500",
      bgTo: "to-pink-500"
    }
  ]

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-3 h-auto hover:bg-primary/5 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="font-semibold text-foreground">Analytics</span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse animation-delay-150" />
              <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse animation-delay-300" />
            </div>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <Card className="border border-indigo-500/20 bg-gradient-to-br from-background/80 to-indigo-500/5 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {statCards.map((stat) => {
                const Icon = stat.icon
                
                return (
                  <div 
                    key={stat.label}
                    className="group relative p-4 rounded-xl bg-gradient-to-br from-background/50 to-background/80 border border-primary/10 hover:border-primary/20 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                  >
                    {/* Background gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgFrom}/5 ${stat.bgTo}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.bgFrom} ${stat.bgTo} flex items-center justify-center shadow-lg`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${stat.bgFrom} ${stat.bgTo} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Completion Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-foreground">Completion Rate</span>
                </div>
                <span className={`text-sm font-bold ${
                  stats.completionRate >= 80 ? "text-green-600" : 
                  stats.completionRate >= 50 ? "text-amber-600" : "text-red-600"
                }`}>
                  {stats.completionRate}%
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={stats.completionRate} 
                  className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
              
              <p className="text-xs text-muted-foreground">
                {stats.completed} of {stats.total} tasks completed
              </p>
            </div>

            {/* Procrastination Factor */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Procrastination Factor
                    </span>
                    <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                      {stats.avgProcrastination}x
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Average delay multiplier
                  </p>
                </div>
              </div>
            </div>

            {/* AI Auto Schedule */}
            <div className="pt-2">
              <AIAutoScheduleModal
                tasks={tasks}
                onApplySchedule={(suggestions) => {
                  suggestions.forEach(suggestion => {
                    onUpdateTask(suggestion.taskId, { dueDate: suggestion.suggestedTime })
                  })
                }}
                trigger={
                  <Button className="w-full gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-12">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">AI Auto Schedule</span>
                        <span className="text-xs opacity-90">Smart time optimization</span>
                      </div>
                    </div>
                  </Button>
                }
              />
            </div>

            {/* Quick Insights */}
            {tasks.length > 0 && (
              <div className="pt-2 border-t border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-foreground">Quick Insights</span>
                </div>
                
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Most productive day</span>
                    <span className="font-medium">Monday</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Average task duration</span>
                    <span className="font-medium">2.5 hours</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Focus score</span>
                    <span className="font-medium text-green-600">8.2/10</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}