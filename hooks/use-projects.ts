"use client"

import { useState, useEffect } from "react"
import type { Project, ProjectInvitation, User, ProjectStats, ProjectActivity } from "@/lib/types"
import { ProjectStorage } from "@/lib/project-storage"

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([])

  // Load data on mount
  useEffect(() => {
    const loadedProjects = ProjectStorage.getProjects()
    const loadedUser = ProjectStorage.getCurrentUser()
    const loadedInvitations = ProjectStorage.getInvitations()

    setProjects(loadedProjects)
    setCurrentUser(loadedUser)
    setInvitations(loadedInvitations)
  }, [])

  const addProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const newProject = ProjectStorage.addProject(projectData)
    const updatedProjects = ProjectStorage.getProjects()
    setProjects(updatedProjects)
    return newProject
  }

  const updateProject = (id: string, updates: Partial<Omit<Project, "id" | "createdAt">>) => {
    const updatedProject = ProjectStorage.updateProject(id, updates)
    if (updatedProject) {
      const updatedProjects = ProjectStorage.getProjects()
      setProjects(updatedProjects)
    }
    return updatedProject
  }

  const deleteProject = (id: string) => {
    const success = ProjectStorage.deleteProject(id)
    if (success) {
      const updatedProjects = ProjectStorage.getProjects()
      setProjects(updatedProjects)
    }
    return success
  }

  const getProject = (id: string) => {
    return ProjectStorage.getProject(id)
  }

  const getProjectStats = (projectId: string) => {
    return ProjectStorage.getProjectStats(projectId)
  }

  const addMemberToProject = (projectId: string, username: string) => {
    const success = ProjectStorage.addMemberToProject(projectId, username)
    if (success) {
      const updatedProjects = ProjectStorage.getProjects()
      setProjects(updatedProjects)
    }
    return success
  }

  const removeMemberFromProject = (projectId: string, username: string) => {
    const success = ProjectStorage.removeMemberFromProject(projectId, username)
    if (success) {
      const updatedProjects = ProjectStorage.getProjects()
      setProjects(updatedProjects)
    }
    return success
  }

  const inviteMember = (projectId: string, invitedTo: string) => {
    const project = getProject(projectId)
    if (!project || !currentUser) return null

    const invitation = ProjectStorage.addInvitation({
      projectId,
      projectName: project.name,
      invitedBy: currentUser.username,
      invitedTo,
      status: "pending",
    })

    const updatedInvitations = ProjectStorage.getInvitations()
    setInvitations(updatedInvitations)

    return invitation
  }

  const updateInvitation = (id: string, updates: Partial<Omit<ProjectInvitation, "id" | "createdAt" | "expiresAt">>) => {
    const updatedInvitation = ProjectStorage.updateInvitation(id, updates)
    if (updatedInvitation) {
      const updatedInvitations = ProjectStorage.getInvitations()
      setInvitations(updatedInvitations)

      // If invitation is accepted, add member to project
      if (updates.status === "accepted") {
        addMemberToProject(updatedInvitation.projectId, updatedInvitation.invitedTo)
      }
    }
    return updatedInvitation
  }

  const getProjectActivities = (projectId: string) => {
    return ProjectStorage.getActivities(projectId)
  }

  const logActivity = (activity: Omit<ProjectActivity, "id" | "timestamp">) => {
    return ProjectStorage.logActivity(activity)
  }

  const getUsers = () => {
    return ProjectStorage.getUsers()
  }

  const getUserProjects = (username: string) => {
    return projects.filter(project => 
      project.owner === username || project.members.includes(username)
    )
  }

  const getMyProjects = () => {
    if (!currentUser) return []
    return getUserProjects(currentUser.username)
  }

  const getProjectMembers = (projectId: string) => {
    const project = getProject(projectId)
    if (!project) return []

    const users = getUsers()
    return users.filter(user => 
      project.members.includes(user.username) || project.owner === user.username
    )
  }

  return {
    projects,
    currentUser,
    invitations,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    getProjectStats,
    addMemberToProject,
    removeMemberFromProject,
    inviteMember,
    updateInvitation,
    getProjectActivities,
    logActivity,
    getUsers,
    getUserProjects,
    getMyProjects,
    getProjectMembers,
  }
}
