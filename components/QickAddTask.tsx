"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { AIEngine } from "@/lib/ai-engine"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Calendar,
  Target,
  Tags,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface QuickAddTaskProps {
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  tasks: Task[]
  isOpen: boolean
  onToggle: () => void
}

export function QuickAddTask({ onAddTask, tasks, isOpen, onToggle }: QuickAddTaskProps) {
  const [quickAdd, setQuickAdd] = useState({
    title: "",
    dueDate: "",
    priority: "medium" as Task["priority"],
    tags: "",
    estimatedTime: 0
  })

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

  const getAITimeEstimate = (title: string, tags: string) => {
    const suggestion = AIEngine.suggestTaskProperties(title, "", tasks)
    return suggestion.estimatedTime || 60
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return "from-red-500 to-red-600"
      case "medium": return "from-amber-500 to-amber-600" 
      case "low": return "from-green-500 to-green-600"
      default: return "from-gray-500 to-gray-600"
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-3 h-auto hover:bg-primary/5 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Quick Add Task</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <Card className="border border-primary/20 bg-gradient-to-br from-background/80 to-primary/5 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 space-y-5">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="quick-title" className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Task Title
              </Label>
              <Input
                id="quick-title"
                value={quickAdd.title}
                onChange={(e) => setQuickAdd(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What needs to be done?"
                className="border-primary/30 focus-visible:ring-primary/40 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:scale-[1.02]"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="quick-due" className="text-sm font-medium flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Calendar className="h-4 w-4" />
                Due Date
              </Label>
              <Input
                id="quick-due"
                type="date"
                value={quickAdd.dueDate}
                onChange={(e) => setQuickAdd(prev => ({ ...prev, dueDate: e.target.value }))}
                className="border-blue-300 focus-visible:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="quick-priority" className="text-sm font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Target className="h-4 w-4" />
                Priority Level
              </Label>
              <Select value={quickAdd.priority} onValueChange={(value: Task["priority"]) => setQuickAdd(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className={`border-amber-300 focus-visible:ring-amber-400 bg-gradient-to-r ${getPriorityColor(quickAdd.priority)}/10 backdrop-blur-sm transition-all duration-300`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-sm border-primary/20">
                  <SelectItem value="low">
                    <span className="inline-flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Low Priority
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="inline-flex items-center gap-2 text-amber-600">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      Medium Priority
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="inline-flex items-center gap-2 text-red-600">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      High Priority
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="quick-tags" className="text-sm font-medium flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Tags className="h-4 w-4" />
                Tags (comma separated)
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
                placeholder="work, study, personal..."
                className="border-purple-300 focus-visible:ring-purple-400 bg-purple-50/50 dark:bg-purple-950/20 backdrop-blur-sm transition-all duration-300"
              />
              {quickAdd.estimatedTime > 0 && (
                <div className="flex items-center gap-2 text-xs mt-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-primary/10">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span className="text-blue-700 dark:text-blue-300">
                    AI Estimate: <span className="font-semibold">{quickAdd.estimatedTime} minutes</span>
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleQuickAdd} 
              className="w-full bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
              disabled={!quickAdd.title.trim()}
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
                <Sparkles className="h-4 w-4" />
              </div>
            </Button>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}