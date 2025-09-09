"use client"

import type React from "react"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, X } from "lucide-react"
// import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AISuggestions } from "./ai-suggestions"
import { useTasks } from "@/hooks/use-tasks"

interface TaskFormProps {
  task?: Task
  onSubmit: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
  projectMembers?: string[] // For assignment dropdown
}

export function TaskForm({ task, onSubmit, onCancel, projectMembers = [] }: TaskFormProps) {
  const { tasks } = useTasks()
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || ("medium" as Task["priority"]),
    status: task?.status || ("todo" as Task["status"]),
    dueDate: task?.dueDate || undefined,
    category: task?.category || "",
    estimatedTime: task?.estimatedTime || undefined,
    assignedTo: task?.assignedTo || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      category: formData.category.trim() || undefined,
      estimatedTime: formData.estimatedTime,
      assignedTo: formData.assignedTo,
      tags: [],
    })
  }

  const handleAISuggestion = (suggestion: any) => {
    setFormData((prev) => ({
      ...prev,
      ...suggestion,
    }))
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{task ? "Edit Task" : "Create New Task"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Add task description..."
                rows={3}
              />
            </div>

            {!task && (
              <AISuggestions
                title={formData.title}
                description={formData.description}
                existingTasks={tasks}
                projectMembers={projectMembers}
                onApplySuggestion={handleAISuggestion}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Task["priority"]) => setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Task["status"]) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => setFormData((prev) => ({ ...prev, dueDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTime || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedTime: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    }))
                  }
                  placeholder="e.g., 60"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Study, Assignment, Project..."
                />
              </div>

              {projectMembers.length > 0 && (
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.assignedTo.includes(value)) {
                        setFormData((prev) => ({
                          ...prev,
                          assignedTo: [...prev.assignedTo, value]
                        }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projectMembers.map((member) => (
                        <SelectItem key={member} value={member}>
                          {member}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.assignedTo.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.assignedTo.map((member) => (
                        <div key={member} className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded text-sm">
                          <span>{member}</span>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({
                              ...prev,
                              assignedTo: prev.assignedTo.filter(m => m !== member)
                            }))}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {task ? "Update Task" : "Create Task"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
