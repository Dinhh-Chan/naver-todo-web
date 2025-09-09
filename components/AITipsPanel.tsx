"use client"

import type { Task } from "@/lib/types"
import { AIEngine } from "@/lib/ai-engine"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Brain,
  Target
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface AITipsPanelProps {
  tasks: Task[]
  isOpen: boolean
  onToggle: () => void
}

export function AITipsPanel({ tasks, isOpen, onToggle }: AITipsPanelProps) {
  const aiTips = AIEngine.generateProductivityTips(tasks)
  const insights = AIEngine.analyzeTasks(tasks)

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning": return AlertTriangle
      case "achievement": return CheckCircle2
      case "suggestion": return Lightbulb
      default: return TrendingUp
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "warning": return "red"
      case "achievement": return "green"
      case "suggestion": return "amber"
      default: return "blue"
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="h-4 w-4 text-amber-600" />
            </div>
            <span className="font-semibold text-foreground">AI Insights</span>
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse" />
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <Card className="border border-amber-500/20 bg-gradient-to-br from-background/80 to-amber-500/5 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 space-y-5">
            {/* AI Tips Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <h4 className="font-semibold text-foreground">Productivity Tips</h4>
              </div>
              
              <div className="space-y-3">
                {aiTips.slice(0, 3).map((tip, index) => (
                  <div 
                    key={index} 
                    className="group p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        {tip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights Section */}
            {insights.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-amber-600" />
                  <h4 className="font-semibold text-foreground">Smart Analysis</h4>
                </div>
                
                <div className="space-y-3">
                  {insights.slice(0, 3).map((insight) => {
                    const Icon = getInsightIcon(insight.type)
                    const color = getInsightColor(insight.type)
                    
                    return (
                      <div 
                        key={insight.id} 
                        className={`group p-4 rounded-xl border transition-all duration-300 hover:shadow-md hover:scale-[1.01] bg-gradient-to-r from-${color}-50 to-${color}-50/50 dark:from-${color}-950/20 dark:to-${color}-950/10 border-${color}-200/50 dark:border-${color}-800/50`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className={`font-medium text-sm text-${color}-800 dark:text-${color}-200 mb-1`}>
                              {insight.title}
                            </h5>
                            <p className={`text-xs text-${color}-700 dark:text-${color}-300 leading-relaxed`}>
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {aiTips.length === 0 && insights.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-amber-500" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">AI Learning...</h4>
                <p className="text-sm text-muted-foreground">
                  Add more tasks to get personalized insights and productivity tips
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}