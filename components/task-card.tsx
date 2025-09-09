"use client"

import type { Task } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, Calendar, MoreHorizontal, Edit, Trash2, Play } from "lucide-react"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SendToSlackButton } from "@/components/send-to-slack-button"

interface TaskCardProps {
  task: Task
  onToggleStatus: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onToggleStatus, onEdit, onDelete }: TaskCardProps) {
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

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-primary" />
      case "in-progress":
        return <Play className="h-5 w-5 text-secondary" />
      case "todo":
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== "completed"

  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue ? "border-destructive" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => onToggleStatus(task.id)}>
              {getStatusIcon(task.status)}
            </Button>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={`font-medium text-balance ${
                    task.status === "completed" ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </h3>
                <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>

              {task.description && <p className="text-sm text-muted-foreground text-pretty">{task.description}</p>}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {task.dueDate && (
                  <div className={`flex items-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
                    <Calendar className="h-3 w-3" />
                    {format(task.dueDate, "MMM d, yyyy")}
                  </div>
                )}

                {task.estimatedTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.estimatedTime}m
                  </div>
                )}

                {task.category && (
                  <Badge variant="outline" className="text-xs">
                    {task.category}
                  </Badge>
                )}
              </div>

              {task.assignedTo && task.assignedTo.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Assigned to:</span>
                  <div className="flex gap-1">
                    {task.assignedTo.map((member) => (
                      <div key={member} className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded text-xs">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {member.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{member}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <div className="px-2 py-1">
                <SendToSlackButton task={task} />
              </div>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
