"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { AIEngine, type AISuggestion } from "@/lib/ai-engine"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wand2, Check, X } from "lucide-react"
import { format } from "date-fns"

interface AISuggestionsProps {
  title: string
  description: string
  existingTasks: Task[]
  projectMembers?: string[]
  onApplySuggestion: (suggestion: Partial<AISuggestion>) => void
}

export function AISuggestions({ title, description, existingTasks, projectMembers = [], onApplySuggestion }: AISuggestionsProps) {
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [assigneeSuggestions, setAssigneeSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (title.trim().length > 3) {
      const aiSuggestion = AIEngine.suggestTaskProperties(title, description, existingTasks, projectMembers)
      setSuggestion(aiSuggestion)
      setShowSuggestions(true)

      // Get assignee suggestions if project members are available
      if (projectMembers.length > 0) {
        const assignees = AIEngine.suggestAssignees(title, description, projectMembers, existingTasks)
        setAssigneeSuggestions(assignees)
      }
    } else {
      setShowSuggestions(false)
    }
  }, [title, description, existingTasks, projectMembers])

  if (!showSuggestions || !suggestion) return null

  const applySuggestion = (field: keyof AISuggestion, value: any) => {
    onApplySuggestion({ [field]: value })
  }

  const applyAllSuggestions = () => {
    onApplySuggestion({
      priority: suggestion.priority,
      dueDate: suggestion.dueDate,
      estimatedTime: suggestion.estimatedTime,
      category: suggestion.category,
    })
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Wand2 className="h-4 w-4 text-primary" />
          AI Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{suggestion.reasoning}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestion.priority && (
            <div className="flex items-center justify-between p-2 bg-background rounded border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Priority:</span>
                <Badge
                  variant="secondary"
                  className={
                    suggestion.priority === "high"
                      ? "bg-destructive text-destructive-foreground"
                      : suggestion.priority === "medium"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                  }
                >
                  {suggestion.priority}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applySuggestion("priority", suggestion.priority)}
                className="p-1 h-auto"
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          )}

          {suggestion.dueDate && (
            <div className="flex items-center justify-between p-2 bg-background rounded border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Due:</span>
                <span className="text-xs">{format(suggestion.dueDate, "MMM d")}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applySuggestion("dueDate", suggestion.dueDate)}
                className="p-1 h-auto"
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          )}

          {suggestion.estimatedTime && (
            <div className="flex items-center justify-between p-2 bg-background rounded border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Time:</span>
                <span className="text-xs">{suggestion.estimatedTime}m</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applySuggestion("estimatedTime", suggestion.estimatedTime)}
                className="p-1 h-auto"
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          )}

          {suggestion.category && (
            <div className="flex items-center justify-between p-2 bg-background rounded border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Category:</span>
                <Badge variant="outline" className="text-xs">
                  {suggestion.category}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applySuggestion("category", suggestion.category)}
                className="p-1 h-auto"
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          )}

          {assigneeSuggestions.length > 0 && (
            <div className="flex items-center justify-between p-2 bg-background rounded border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Suggested Assignees:</span>
                <div className="flex gap-1">
                  {assigneeSuggestions.map((member) => (
                    <Badge key={member} variant="secondary" className="text-xs">
                      {member}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applySuggestion("assignedTo", assigneeSuggestions)}
                className="p-1 h-auto"
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={applyAllSuggestions} className="flex-1 bg-transparent">
            Apply All Suggestions
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSuggestions(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
