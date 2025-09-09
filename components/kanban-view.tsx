"use client"

import { useMemo } from "react"
import type { Task } from "@/lib/types"
import { KanbanColumn } from "./kanban-column"

interface KanbanViewProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onUpdateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void
}

export function KanbanView({ tasks, onEdit, onDelete, onUpdateTask }: KanbanViewProps) {
  const columns = useMemo(() => {
    const todoTasks = tasks.filter((task) => task.status === "todo")
    const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
    const completedTasks = tasks.filter((task) => task.status === "completed")

    return [
      {
        title: "To Do",
        status: "todo" as Task["status"],
        tasks: todoTasks,
      },
      {
        title: "In Progress",
        status: "in-progress" as Task["status"],
        tasks: inProgressTasks,
      },
      {
        title: "Completed",
        status: "completed" as Task["status"],
        tasks: completedTasks,
      },
    ]
  }, [tasks])

  const handleTaskMove = (taskId: string, newStatus: Task["status"]) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus) {
      onUpdateTask(taskId, { status: newStatus })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          tasks={column.tasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onTaskMove={handleTaskMove}
        />
      ))}
    </div>
  )
}
