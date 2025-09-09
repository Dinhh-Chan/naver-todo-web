    "use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  X,
  Sparkles
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface FiltersPanelProps {
  tasks: Task[]
  onFilterTasks: (filters: any) => void
  isOpen: boolean
  onToggle: () => void
}

export function FiltersPanel({ tasks, onFilterTasks, isOpen, onToggle }: FiltersPanelProps) {
  const [filters, setFilters] = useState({
    status: [] as Task["status"][],
    priority: [] as Task["priority"][],
    tags: [] as string[],
    dateRange: { start: "", end: "" },
    search: ""
  })

  const applyFilters = () => {
    onFilterTasks(filters)
  }

  const clearFilters = () => {
    const emptyFilters = {
      status: [],
      priority: [],
      tags: [],
      dateRange: { start: "", end: "" },
      search: ""
    }
    setFilters(emptyFilters)
    onFilterTasks({})
  }

  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags || [])))

  const statusOptions = [
    { value: "todo", label: "To Do", icon: Clock, color: "blue" },
    { value: "in-progress", label: "In Progress", icon: TrendingUp, color: "amber" },
    { value: "completed", label: "Completed", icon: CheckCircle2, color: "green" }
  ]

  const priorityOptions = [
    { value: "low", label: "Low", icon: CheckCircle2, color: "green" },
    { value: "medium", label: "Medium", icon: TrendingUp, color: "amber" },
    { value: "high", label: "High", icon: AlertTriangle, color: "red" }
  ]

  const hasActiveFilters = filters.status.length > 0 || filters.priority.length > 0 || filters.tags.length > 0 || filters.search || filters.dateRange.start || filters.dateRange.end

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-3 h-auto hover:bg-primary/5 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Filter className="h-4 w-4 text-purple-600" />
            </div>
            <span className="font-semibold text-foreground">Filters & Search</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <Card className="border border-purple-500/20 bg-gradient-to-br from-background/80 to-purple-500/5 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 space-y-5">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Search className="h-4 w-4 text-purple-600" />
                Search Tasks
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by title, description, tags..."
                  className="pl-10 border-purple-300/50 focus-visible:ring-purple-400 bg-background/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Status</Label>
              <div className="grid grid-cols-1 gap-2">
                {statusOptions.map((option) => {
                  const Icon = option.icon
                  const isChecked = filters.status.includes(option.value as Task["status"])
                  
                  return (
                    <div 
                      key={option.value} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                        isChecked 
                          ? `border-${option.color}-300 bg-${option.color}-50 dark:bg-${option.color}-950/20` 
                          : "border-muted hover:border-primary/20 hover:bg-primary/5"
                      }`}
                      onClick={() => {
                        const newStatus = isChecked 
                          ? filters.status.filter(s => s !== option.value)
                          : [...filters.status, option.value as Task["status"]]
                        setFilters(prev => ({ ...prev, status: newStatus }))
                      }}
                    >
                      <Checkbox
                        checked={isChecked}
                        className={`data-[state=checked]:bg-${option.color}-600 data-[state=checked]:border-${option.color}-600`}
                      />
                      <Icon className={`h-4 w-4 text-${option.color}-600`} />
                      <Label className={`text-sm cursor-pointer ${isChecked ? `text-${option.color}-700 dark:text-${option.color}-300 font-medium` : "text-foreground"}`}>
                        {option.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Priority</Label>
              <div className="grid grid-cols-1 gap-2">
                {priorityOptions.map((option) => {
                  const Icon = option.icon
                  const isChecked = filters.priority.includes(option.value as Task["priority"])
                  
                  return (
                    <div 
                      key={option.value} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                        isChecked 
                          ? `border-${option.color}-300 bg-${option.color}-50 dark:bg-${option.color}-950/20` 
                          : "border-muted hover:border-primary/20 hover:bg-primary/5"
                      }`}
                      onClick={() => {
                        const newPriority = isChecked 
                          ? filters.priority.filter(p => p !== option.value)
                          : [...filters.priority, option.value as Task["priority"]]
                        setFilters(prev => ({ ...prev, priority: newPriority }))
                      }}
                    >
                      <Checkbox
                        checked={isChecked}
                        className={`data-[state=checked]:bg-${option.color}-600 data-[state=checked]:border-${option.color}-600`}
                        disabled
                      />
                      <Icon className={`h-4 w-4 text-${option.color}-600`} />
                      <Label className={`text-sm cursor-pointer ${isChecked ? `text-${option.color}-700 dark:text-${option.color}-300 font-medium` : "text-foreground"}`}>
                        {option.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Tags</Label>
                <Select onValueChange={(value) => {
                  if (!filters.tags.includes(value)) {
                    setFilters(prev => ({ ...prev, tags: [...prev.tags, value] }))
                  }
                }}>
                  <SelectTrigger className="border-purple-300/50 focus-visible:ring-purple-400 bg-background/50">
                    <SelectValue placeholder="Select tags..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border-primary/20">
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800"
                      >
                        {tag}
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                          className="ml-1.5 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Due Date Range</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date-start" className="text-xs text-muted-foreground">From</Label>
                  <Input
                    id="date-start"
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, start: e.target.value } 
                    }))}
                    className="text-xs border-purple-300/50 focus-visible:ring-purple-400 bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="date-end" className="text-xs text-muted-foreground">To</Label>
                  <Input
                    id="date-end"
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, end: e.target.value } 
                    }))}
                    className="text-xs border-purple-300/50 focus-visible:ring-purple-400 bg-background/50"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={applyFilters} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Apply Filters
                </div>
              </Button>
              <Button 
                onClick={clearFilters} 
                variant="outline" 
                className="border-purple-300/50 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-300"
                disabled={!hasActiveFilters}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}