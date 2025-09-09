"use client"

import type React from "react"

import type { Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KanbanCard } from "./kanban-card"
import { Circle, Play, CheckCircle2 } from "lucide-react"

interface KanbanColumnProps {
  title: string
  status: Task["status"]
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onTaskMove: (taskId: string, newStatus: Task["status"]) => void
}

export function KanbanColumn({ title, status, tasks, onEdit, onDelete, onTaskMove }: KanbanColumnProps) {
  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return <Circle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      case "in-progress":
        return <Play className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
    }
  }

  const getColumnColor = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "border-gray-200 bg-white/80 dark:bg-gray-800/80"
      case "in-progress":
        return "border-orange-200 bg-white/80 dark:bg-gray-800/80"
      case "completed":
        return "border-green-200 bg-white/80 dark:bg-gray-800/80"
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("text/plain")
    if (taskId) {
      onTaskMove(taskId, status)
    }
  }

  return (
    <Card className={`h-fit min-h-[400px] ${getColumnColor(status)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            {title}
          </div>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 min-h-[300px]" onDragOver={handleDragOver} onDrop={handleDrop}>
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No tasks</div>
        ) : (
          tasks.map((task) => <KanbanCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />)
        )}
      </CardContent>
    </Card>
  )
}
