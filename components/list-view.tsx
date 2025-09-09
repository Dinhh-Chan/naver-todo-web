"use client"

import { useState, useMemo } from "react"
import type { Task, TaskFilters } from "@/lib/types"
import { TaskCard } from "./task-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, SortAsc, SortDesc, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ListViewProps {
  tasks: Task[]
  onToggleStatus: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

type SortOption = "dueDate" | "priority" | "created" | "title" | "status"
type SortDirection = "asc" | "desc"

export function ListView({ tasks, onToggleStatus, onEdit, onDelete }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("created")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [filters, setFilters] = useState<TaskFilters>({})

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.category?.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((task) => filters.status!.includes(task.status))
    }

    // Apply priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((task) => filters.priority!.includes(task.priority))
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((task) => task.category === filters.category)
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "dueDate":
          const aDate = a.dueDate?.getTime() || Number.POSITIVE_INFINITY
          const bDate = b.dueDate?.getTime() || Number.POSITIVE_INFINITY
          comparison = aDate - bDate
          break
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
        case "created":
          comparison = b.createdAt.getTime() - a.createdAt.getTime()
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "status":
          const statusOrder = { todo: 1, "in-progress": 2, completed: 3 }
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [tasks, searchQuery, sortBy, sortDirection, filters])

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(option)
      setSortDirection("asc")
    }
  }

  const updateStatusFilter = (status: Task["status"], checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      status: checked ? [...(prev.status || []), status] : (prev.status || []).filter((s) => s !== status),
    }))
  }

  const updatePriorityFilter = (priority: Task["priority"], checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      priority: checked ? [...(prev.priority || []), priority] : (prev.priority || []).filter((p) => p !== priority),
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery("")
  }

  const activeFilterCount = (filters.status?.length || 0) + (filters.priority?.length || 0) + (filters.category ? 1 : 0)

  // Group tasks by status for better organization
  const groupedTasks = useMemo(() => {
    const groups = {
      todo: filteredAndSortedTasks.filter((t) => t.status === "todo"),
      "in-progress": filteredAndSortedTasks.filter((t) => t.status === "in-progress"),
      completed: filteredAndSortedTasks.filter((t) => t.status === "completed"),
    }
    return groups
  }, [filteredAndSortedTasks])

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.status?.includes("todo") || false}
                onCheckedChange={(checked) => updateStatusFilter("todo", checked)}
              >
                To Do
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.status?.includes("in-progress") || false}
                onCheckedChange={(checked) => updateStatusFilter("in-progress", checked)}
              >
                In Progress
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.status?.includes("completed") || false}
                onCheckedChange={(checked) => updateStatusFilter("completed", checked)}
              >
                Completed
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.priority?.includes("high") || false}
                onCheckedChange={(checked) => updatePriorityFilter("high", checked)}
              >
                High Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.priority?.includes("medium") || false}
                onCheckedChange={(checked) => updatePriorityFilter("medium", checked)}
              >
                Medium Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.priority?.includes("low") || false}
                onCheckedChange={(checked) => updatePriorityFilter("low", checked)}
              >
                Low Priority
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created Date</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => toggleSort(sortBy)}>
            {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          {(activeFilterCount > 0 || searchQuery) && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
        </span>
        <span>
          Sorted by {sortBy} ({sortDirection === "asc" ? "ascending" : "descending"})
        </span>
      </div>

      {/* Task Groups */}
      {filteredAndSortedTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tasks match your current filters.</p>
            <Button variant="ghost" onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* To Do Tasks */}
          {groupedTasks.todo.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                To Do
                <Badge variant="secondary">{groupedTasks.todo.length}</Badge>
              </h3>
              <div className="space-y-3">
                {groupedTasks.todo.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleStatus}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* In Progress Tasks */}
          {groupedTasks["in-progress"].length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                In Progress
                <Badge variant="secondary">{groupedTasks["in-progress"].length}</Badge>
              </h3>
              <div className="space-y-3">
                {groupedTasks["in-progress"].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleStatus}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {groupedTasks.completed.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                Completed
                <Badge variant="secondary">{groupedTasks.completed.length}</Badge>
              </h3>
              <div className="space-y-3">
                {groupedTasks.completed.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleStatus}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
