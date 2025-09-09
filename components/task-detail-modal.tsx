"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { useProjects } from "@/hooks/use-projects"
import { useTasks } from "@/hooks/use-tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  Play, 
  Circle,
  ArrowLeft,
  Edit,
  Trash2,
  MessageSquare
} from "lucide-react"
import { format } from "date-fns"
import { TaskComments } from "./task-comments"

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
}

export function TaskDetailModal({ 
  task, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: TaskDetailModalProps) {
  const { currentUser, getProjectMembers } = useProjects()
  const { updateTask } = useTasks()
  const [showComments, setShowComments] = useState(false)

  if (!task) return null

  const projectMembers = task.projectId ? getProjectMembers(task.projectId) : []
  const memberUsernames = projectMembers.map(m => m.username)

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
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Play className="h-5 w-5 text-blue-500" />
      case "todo":
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in-progress":
        return "In Progress"
      case "todo":
        return "To Do"
    }
  }

  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== "completed"

  const handleAddComment = (taskId: string, text: string, mentions?: string[]) => {
    const newComment = {
      id: crypto.randomUUID(),
      userId: currentUser?.id || "current_user",
      username: currentUser?.username || "current_user",
      text,
      timestamp: new Date(),
      mentions,
    }

    const updatedComments = [...(task.comments || []), newComment]
    updateTask(taskId, { comments: updatedComments })
  }

  const handleEditComment = (taskId: string, commentId: string, text: string) => {
    const updatedComments = (task.comments || []).map(comment =>
      comment.id === commentId ? { ...comment, text } : comment
    )
    updateTask(taskId, { comments: updatedComments })
  }

  const handleDeleteComment = (taskId: string, commentId: string) => {
    const updatedComments = (task.comments || []).filter(comment => comment.id !== commentId)
    updateTask(taskId, { comments: updatedComments })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Task Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {showComments ? "Hide" : "Show"} Comments
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(task.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto" 
                    onClick={() => onToggleStatus(task.id)}
                  >
                    {getStatusIcon(task.status)}
                  </Button>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
                      {task.description && (
                        <p className="text-muted-foreground text-lg">{task.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                        {task.priority} Priority
                      </Badge>
                      <Badge variant="outline">
                        {getStatusText(task.status)}
                      </Badge>
                      {task.category && (
                        <Badge variant="outline">
                          {task.category}
                        </Badge>
                      )}
                    </div>

                    {/* Task Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {task.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Due Date</div>
                            <div className={`text-sm ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                              {format(task.dueDate, "EEEE, MMMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                      )}

                      {task.estimatedTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Estimated Time</div>
                            <div className="text-sm text-muted-foreground">
                              {task.estimatedTime} minutes
                            </div>
                          </div>
                        </div>
                      )}

                      {task.actualTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">Actual Time</div>
                            <div className="text-sm text-muted-foreground">
                              {task.actualTime} minutes
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Created</div>
                          <div className="text-sm text-muted-foreground">
                            {format(task.createdAt, "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Members */}
                    {task.assignedTo && task.assignedTo.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">Assigned To</div>
                        <div className="flex gap-2">
                          {task.assignedTo.map((member) => (
                            <div key={member} className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {member.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm font-medium">{member}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">Tags</div>
                        <div className="flex gap-2">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          {showComments && (
            <TaskComments
              task={task}
              currentUser={currentUser?.username || "current_user"}
              projectMembers={memberUsernames}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
