"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { AIEngine, type AIInsight } from "@/lib/ai-engine"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Lightbulb, AlertTriangle, Trophy, X, Sparkles } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface AIInsightsProps {
  tasks: Task[]
}

export function AIInsights({ tasks }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set())
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const newInsights = AIEngine.analyzeTasks(tasks)
    setInsights(newInsights.filter((insight) => !dismissedInsights.has(insight.id)))
  }, [tasks, dismissedInsights])

  const dismissInsight = (insightId: string) => {
    setDismissedInsights((prev) => new Set([...prev, insightId]))
  }

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "suggestion":
        return <Lightbulb className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "tip":
        return <Brain className="h-4 w-4" />
      case "achievement":
        return <Trophy className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: AIInsight["type"]) => {
    switch (type) {
      case "suggestion":
        return "bg-blue-500/10 text-blue-700 border-blue-200"
      case "warning":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "tip":
        return "bg-secondary/10 text-secondary-foreground border-secondary/20"
      case "achievement":
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  if (insights.length === 0) return null

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Insights
                <Badge variant="secondary">{insights.length}</Badge>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? "Hide" : "Show"}
              </Button>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1">
                    {getInsightIcon(insight.type)}
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-sm opacity-90">{insight.description}</p>
                      {insight.action && (
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          {insight.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissInsight(insight.id)}
                    className="p-1 h-auto opacity-60 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
