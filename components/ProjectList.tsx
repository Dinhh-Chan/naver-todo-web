"use client"

import type { Task, Project, ViewMode } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FolderOpen,
  Folder,
  Plus,
  ChevronDown,
  ChevronUp,
  Archive,
  Activity
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ProjectsListProps {
  projects: Project[]
  tasks: Task[]
  onProjectSelect: (project: Project) => void
  onViewChange: (view: ViewMode) => void
  isOpen: boolean
  onToggle: () => void
}

export function ProjectsList({ 
  projects, 
  tasks, 
  onProjectSelect, 
  onViewChange, 
  isOpen, 
  onToggle 
}: ProjectsListProps) {
  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId).length
  }

  const getProjectCompletionRate = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId)
    if (projectTasks.length === 0) return 0
    const completedTasks = projectTasks.filter(task => task.status === "completed").length
    return Math.round((completedTasks / projectTasks.length) * 100)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-3 h-auto hover:bg-primary/5 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderOpen className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-semibold text-foreground">Projects</span>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
              {projects.length}
            </Badge>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <Card className="border border-blue-500/20 bg-gradient-to-br from-background/80 to-blue-500/5 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                  <Folder className="h-8 w-8 text-blue-500" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">No Projects Yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first project to organize your tasks better
                </p>
                <Button 
                  size="sm" 
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => onViewChange("projects")}
                >
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 6).map((project) => {
                  const taskCount = getProjectTaskCount(project.id)
                  const completionRate = getProjectCompletionRate(project.id)
                  
                  return (
                    <div
                      key={project.id}
                      className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 cursor-pointer transition-all duration-300 border border-transparent hover:border-primary/10"
                      onClick={() => onProjectSelect(project)}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                          project.isArchived 
                            ? "bg-gradient-to-br from-gray-400/20 to-gray-600/20" 
                            : "bg-gradient-to-br from-primary/20 to-blue-500/20"
                        }`}>
                          {project.isArchived ? (
                            <Archive className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Folder className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {project.name}
                          </h4>
                          {!project.isArchived && completionRate === 100 && (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {taskCount} task{taskCount !== 1 ? 's' : ''}
                          </p>
                          
                          {!project.isArchived && (
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                  style={{ width: `${completionRate}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground font-medium">
                                {completionRate}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={`text-xs transition-all duration-300 ${
                          project.isArchived 
                            ? "border-gray-300 text-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-gray-400" 
                            : "border-green-300 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300 group-hover:border-green-400"
                        }`}
                      >
                        {project.isArchived ? (
                          <div className="flex items-center gap-1">
                            <Archive className="h-3 w-3" />
                            Archived
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            Active
                          </div>
                        )}
                      </Badge>
                    </div>
                  )
                })}
                
                {projects.length > 6 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30"
                    onClick={() => onViewChange("projects")}
                  >
                    <FolderOpen className="h-4 w-4" />
                    View All Projects ({projects.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  ) 
}