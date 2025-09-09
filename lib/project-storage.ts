import type { Project, ProjectInvitation, User, ProjectStats, ProjectActivity } from "./types"
import { TaskStorage } from "./task-storage"

const PROJECTS_STORAGE_KEY = "anyf-projects"
const USERS_STORAGE_KEY = "anyf-users"
const INVITATIONS_STORAGE_KEY = "anyf-invitations"
const ACTIVITIES_STORAGE_KEY = "anyf-activities"

export class ProjectStorage {
  // Project CRUD Operations
  static getProjects(): Project[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
      if (!stored) return []

      const projects = JSON.parse(stored)
      return projects.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
      }))
    } catch (error) {
      console.error("Error loading projects:", error)
      return []
    }
  }

  static saveProjects(projects: Project[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects))
    } catch (error) {
      console.error("Error saving projects:", error)
    }
  }

  static addProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Project {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const projects = this.getProjects()
    projects.push(newProject)
    this.saveProjects(projects)

    // Log activity
    this.logActivity({
      projectId: newProject.id,
      type: "project_created",
      userId: project.owner,
      username: project.owner,
      description: `Created project "${newProject.name}"`,
    })

    return newProject
  }

  static updateProject(id: string, updates: Partial<Omit<Project, "id" | "createdAt">>): Project | null {
    const projects = this.getProjects()
    const projectIndex = projects.findIndex((project) => project.id === id)

    if (projectIndex === -1) return null

    const updatedProject = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date(),
    }

    projects[projectIndex] = updatedProject
    this.saveProjects(projects)

    return updatedProject
  }

  static deleteProject(id: string): boolean {
    const projects = this.getProjects()
    const filteredProjects = projects.filter((project) => project.id !== id)

    if (filteredProjects.length === projects.length) return false

    this.saveProjects(filteredProjects)

    // Delete all tasks associated with this project
    const tasks = TaskStorage.getTasks()
    const projectTasks = tasks.filter(task => task.projectId === id)
    projectTasks.forEach(task => TaskStorage.deleteTask(task.id))

    return true
  }

  static getProject(id: string): Project | null {
    const projects = this.getProjects()
    return projects.find(project => project.id === id) || null
  }

  // User Management
  static getUsers(): User[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY)
      if (!stored) {
        // Initialize with default users for POC
        const defaultUsers: User[] = [
          {
            id: "user1",
            username: "admin",
            email: "admin@anyf.com",
            preferences: {
              theme: "system",
              language: "vi",
              notifications: true
            }
          },
          {
            id: "user2", 
            username: "john_doe",
            email: "john@example.com",
            preferences: {
              theme: "light",
              language: "vi",
              notifications: true
            }
          },
          {
            id: "user3",
            username: "jane_smith", 
            email: "jane@example.com",
            preferences: {
              theme: "dark",
              language: "en",
              notifications: false
            }
          }
        ]
        this.saveUsers(defaultUsers)
        return defaultUsers
      }

      return JSON.parse(stored)
    } catch (error) {
      console.error("Error loading users:", error)
      return []
    }
  }

  static saveUsers(users: User[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    } catch (error) {
      console.error("Error saving users:", error)
    }
  }

  static getCurrentUser(): User {
    const users = this.getUsers()
    return users[0] || { // Default to first user for POC
      id: "current_user",
      username: "current_user",
      email: "user@anyf.com",
      preferences: {
        theme: "system",
        language: "vi",
        notifications: true
      }
    }
  }

  // Invitation Management
  static getInvitations(): ProjectInvitation[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(INVITATIONS_STORAGE_KEY)
      if (!stored) return []

      const invitations = JSON.parse(stored)
      return invitations.map((invitation: any) => ({
        ...invitation,
        createdAt: new Date(invitation.createdAt),
        expiresAt: new Date(invitation.expiresAt),
      }))
    } catch (error) {
      console.error("Error loading invitations:", error)
      return []
    }
  }

  static saveInvitations(invitations: ProjectInvitation[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invitations))
    } catch (error) {
      console.error("Error saving invitations:", error)
    }
  }

  static addInvitation(invitation: Omit<ProjectInvitation, "id" | "createdAt" | "expiresAt">): ProjectInvitation {
    const newInvitation: ProjectInvitation = {
      ...invitation,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    }

    const invitations = this.getInvitations()
    invitations.push(newInvitation)
    this.saveInvitations(invitations)

    return newInvitation
  }

  static updateInvitation(id: string, updates: Partial<Omit<ProjectInvitation, "id" | "createdAt" | "expiresAt">>): ProjectInvitation | null {
    const invitations = this.getInvitations()
    const invitationIndex = invitations.findIndex((invitation) => invitation.id === id)

    if (invitationIndex === -1) return null

    const updatedInvitation = {
      ...invitations[invitationIndex],
      ...updates,
    }

    invitations[invitationIndex] = updatedInvitation
    this.saveInvitations(invitations)

    return updatedInvitation
  }

  // Activity Logging
  static getActivities(projectId?: string): ProjectActivity[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(ACTIVITIES_STORAGE_KEY)
      if (!stored) return []

      const activities = JSON.parse(stored)
      const parsedActivities = activities.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      }))

      if (projectId) {
        return parsedActivities.filter((activity: ProjectActivity) => activity.projectId === projectId)
      }

      return parsedActivities
    } catch (error) {
      console.error("Error loading activities:", error)
      return []
    }
  }

  static saveActivities(activities: ProjectActivity[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities))
    } catch (error) {
      console.error("Error saving activities:", error)
    }
  }

  static logActivity(activity: Omit<ProjectActivity, "id" | "timestamp">): ProjectActivity {
    const newActivity: ProjectActivity = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }

    const activities = this.getActivities()
    activities.unshift(newActivity) // Add to beginning
    
    // Keep only last 100 activities per project
    const projectActivities = activities.filter(a => a.projectId === activity.projectId)
    if (projectActivities.length > 100) {
      const toRemove = projectActivities.slice(100)
      const filteredActivities = activities.filter(a => !toRemove.includes(a))
      this.saveActivities(filteredActivities)
    } else {
      this.saveActivities(activities)
    }

    return newActivity
  }

  // Project Statistics
  static getProjectStats(projectId: string): ProjectStats {
    const tasks = TaskStorage.getTasks().filter(task => task.projectId === projectId)
    const project = this.getProject(projectId)
    const activities = this.getActivities(projectId)

    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === "completed").length
    const inProgressTasks = tasks.filter(task => task.status === "in-progress").length
    const overdueTasks = tasks.filter(
      task => task.dueDate && task.dueDate < new Date() && task.status !== "completed"
    ).length

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      memberCount: project?.members.length || 0,
      recentActivity: activities.slice(0, 10), // Last 10 activities
    }
  }

  // Member Management
  static addMemberToProject(projectId: string, username: string): boolean {
    const project = this.getProject(projectId)
    if (!project) return false

    if (!project.members.includes(username)) {
      project.members.push(username)
      this.updateProject(projectId, { members: project.members })

      // Log activity
      this.logActivity({
        projectId,
        type: "member_joined",
        userId: username,
        username,
        description: `${username} joined the project`,
      })

      return true
    }

    return false
  }

  static removeMemberFromProject(projectId: string, username: string): boolean {
    const project = this.getProject(projectId)
    if (!project) return false

    const memberIndex = project.members.indexOf(username)
    if (memberIndex > -1) {
      project.members.splice(memberIndex, 1)
      this.updateProject(projectId, { members: project.members })

      // Unassign tasks from removed member
      const tasks = TaskStorage.getTasks().filter(task => task.projectId === projectId)
      tasks.forEach(task => {
        if (task.assignedTo?.includes(username)) {
          const updatedAssignedTo = task.assignedTo.filter(user => user !== username)
          TaskStorage.updateTask(task.id, { assignedTo: updatedAssignedTo })
        }
      })

      return true
    }

    return false
  }
}
