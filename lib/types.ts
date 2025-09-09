export interface Task {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  category?: string
  tags?: string[]
  estimatedTime?: number // in minutes
  actualTime?: number // in minutes
  procrastinationFactor?: number // AI-calculated factor (e.g., 1.5 if user takes 1.5x estimated time)
  completedAt?: Date // when task was completed
  startedAt?: Date // when task was started
  projectId?: string // Reference to project
  assignedTo?: string[] // Array of usernames
  comments?: TaskComment[] // Comments on the task
}

export interface TaskComment {
  id: string
  userId: string
  username: string
  text: string
  timestamp: Date
  mentions?: string[] // Array of mentioned usernames
}

export interface TaskStats {
  total: number
  completed: number
  inProgress: number
  overdue: number
  completionRate: number
  averageProcrastinationFactor: number
  totalEstimatedTime: number
  totalActualTime: number
}

export type ViewMode = "list" | "kanban" | "calendar" | "analytics" | "projects"

export interface TaskFilters {
  status?: Task["status"][]
  priority?: Task["priority"][]
  category?: string
  projectId?: string
  assignedTo?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}

// Project Management Types
export interface Project {
  id: string
  name: string
  description: string
  owner: string // username
  members: string[] // array of usernames
  createdAt: Date
  updatedAt: Date
  color?: string // hex color for project theme
  isArchived?: boolean
}

export interface ProjectMember {
  username: string
  email?: string
  role: "owner" | "member"
  joinedAt: Date
  avatar?: string
}

export interface ProjectInvitation {
  id: string
  projectId: string
  projectName: string
  invitedBy: string
  invitedTo: string // username or email
  status: "pending" | "accepted" | "declined"
  createdAt: Date
  expiresAt: Date
}

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  preferences?: {
    theme: "light" | "dark" | "system"
    language: "vi" | "en"
    notifications: boolean
  }
}

export interface ProjectStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  memberCount: number
  recentActivity: ProjectActivity[]
}

export interface ProjectActivity {
  id: string
  type: "task_created" | "task_completed" | "member_joined" | "comment_added" | "task_assigned" | "project_created"
  userId: string
  username: string
  description: string
  timestamp: Date
  taskId?: string
  projectId: string
}

// Project Documents
export interface ProjectDocument {
  id: string
  name: string
  type: "file" | "link" | "image" | "pdf" | "document"
  url: string
  size?: number
  uploadedBy: string
  uploadedAt: Date
  description?: string
  projectId: string
}

// PM Tasks
export interface PMTask {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate?: Date
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  projectId: string
  isAIGenerated?: boolean
}

// Project Widgets
export interface ProjectWidget {
  id: string
  type: "metrics" | "chart" | "insights" | "members" | "recent_activity"
  title: string
  position: { x: number; y: number; w: number; h: number }
  config?: any
}

// Project Overview Data
export interface ProjectOverviewData {
  metrics: {
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    memberCount: number
    completionRate: number
    averageTaskTime: number
  }
  priorityDistribution: {
    high: number
    medium: number
    low: number
  }
  weeklyTrends: {
    date: string
    completed: number
    created: number
  }[]
  recentActivity: ProjectActivity[]
  aiInsights: string[]
}
