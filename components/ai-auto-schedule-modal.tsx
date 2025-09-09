"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { AIEngine } from "@/lib/ai-engine"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Zap, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  Brain,
  TrendingUp
} from "lucide-react"
import { format } from "date-fns"

interface AIAutoScheduleModalProps {
  tasks: Task[]
  onApplySchedule: (suggestions: Array<{ taskId: string; suggestedTime: Date; reasoning: string }>) => void
  trigger?: React.ReactNode
}

export function AIAutoScheduleModal({ tasks, onApplySchedule, trigger }: AIAutoScheduleModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{
    taskId: string
    suggestedTime: Date
    reasoning: string
    task: Task
  }>>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateSuggestions = async () => {
    setIsGenerating(true)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const aiSuggestions = AIEngine.suggestOptimalSchedule(tasks)
    const suggestionsWithTasks = aiSuggestions.map(suggestion => ({
      ...suggestion,
      task: tasks.find(t => t.id === suggestion.taskId)!
    })).filter(s => s.task)
    
    setSuggestions(suggestionsWithTasks)
    setIsGenerating(false)
  }

  const handleApplyAll = () => {
    onApplySchedule(suggestions.map(s => ({
      taskId: s.taskId,
      suggestedTime: s.suggestedTime,
      reasoning: s.reasoning
    })))
    setIsOpen(false)
    setSuggestions([])
  }

  const handleApplySingle = (suggestion: typeof suggestions[0]) => {
    onApplySchedule([{
      taskId: suggestion.taskId,
      suggestedTime: suggestion.suggestedTime,
      reasoning: suggestion.reasoning
    }])
    setSuggestions(prev => prev.filter(s => s.taskId !== suggestion.taskId))
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-secondary text-secondary-foreground"
      case "low":
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Zap className="h-4 w-4" />
            AI Tự động lên lịch
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Auto-Schedule
          </DialogTitle>
          <DialogDescription>
            AI sẽ phân tích pattern làm việc của bạn và đề xuất thời gian tối ưu cho các task
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {suggestions.length === 0 && !isGenerating && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">AI sẽ phân tích và đề xuất lịch trình tối ưu</h3>
                    <p className="text-muted-foreground mb-4">
                      Dựa trên pattern làm việc, độ ưu tiên và thời gian ước tính của bạn
                    </p>
                    <Button onClick={generateSuggestions} className="gap-2">
                      <Brain className="h-4 w-4" />
                      Bắt đầu phân tích
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isGenerating && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto animate-pulse">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">AI đang phân tích...</h3>
                    <p className="text-muted-foreground mb-4">
                      Đang tính toán thời gian tối ưu dựa trên pattern làm việc của bạn
                    </p>
                    <Progress value={66} className="w-full max-w-xs mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Đề xuất lịch trình ({suggestions.length} task)
                </h3>
                <Button onClick={handleApplyAll} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Áp dụng tất cả
                </Button>
              </div>

              <div className="grid gap-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.taskId}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className={getPriorityColor(suggestion.task.priority)}>
                              {suggestion.task.priority}
                            </Badge>
                            <Badge variant="outline">
                              {suggestion.task.category || "Không phân loại"}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium mb-2">{suggestion.task.title}</h4>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Hiện tại: {suggestion.task.dueDate ? format(suggestion.task.dueDate, "MMM d, yyyy") : "Chưa có"}</span>
                            </div>
                            {suggestion.task.estimatedTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{suggestion.task.estimatedTime} phút</span>
                              </div>
                            )}
                          </div>

                          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                  Đề xuất: {format(suggestion.suggestedTime, "MMM d, yyyy 'lúc' HH:mm")}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  {suggestion.reasoning}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApplySingle(suggestion)}
                            className="gap-2"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {suggestions.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Đã phân tích {tasks.length} task và đề xuất thời gian tối ưu dựa trên pattern làm việc của bạn</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p>Một số task có thể cần điều chỉnh thời gian dựa trên độ ưu tiên và deadline thực tế</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p>Lịch trình được tối ưu để tăng năng suất và giảm stress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
