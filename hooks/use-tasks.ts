"use client"

import { useState, useEffect } from "react"
import type { Task, TaskStats } from "@/lib/types"
import { TaskStorage } from "@/lib/task-storage"
import { initializeSampleData } from "@/lib/sample-data"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    completionRate: 0,
    averageProcrastinationFactor: 1,
    totalEstimatedTime: 0,
    totalActualTime: 0,
  })

  // Load tasks on mount
  useEffect(() => {
    // Initialize sample data if no tasks exist
    initializeSampleData()
    const loadedTasks = TaskStorage.getTasks()
    setTasks(loadedTasks)
    setStats(TaskStorage.getTaskStats())
  }, [])

  const addTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask = TaskStorage.addTask(taskData)
    const updatedTasks = TaskStorage.getTasks()
    setTasks(updatedTasks)
    setStats(TaskStorage.getTaskStats())
    return newTask
  }

  const addTasks = (newTasks: Task[]) => {
    const tasksWithIds = newTasks.map(task => ({
      ...task,
      id: task.id || crypto.randomUUID(),
      createdAt: task.createdAt || new Date(),
      updatedAt: task.updatedAt || new Date(),
    }))
    
    // Add each task individually to ensure proper storage
    tasksWithIds.forEach(task => {
      TaskStorage.addTask(task)
    })
    
    const updatedTasks = TaskStorage.getTasks()
    setTasks(updatedTasks)
    setStats(TaskStorage.getTaskStats())
    return tasksWithIds
  }

  const updateTask = (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
    const updatedTask = TaskStorage.updateTask(id, updates)
    if (updatedTask) {
      const updatedTasks = TaskStorage.getTasks()
      setTasks(updatedTasks)
      setStats(TaskStorage.getTaskStats())
    }
    return updatedTask
  }

  const deleteTask = (id: string) => {
    const success = TaskStorage.deleteTask(id)
    if (success) {
      const updatedTasks = TaskStorage.getTasks()
      setTasks(updatedTasks)
      setStats(TaskStorage.getTaskStats())
    }
    return success
  }

  const toggleTaskStatus = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return null

    let newStatus: Task["status"]
    let updates: Partial<Omit<Task, "id" | "createdAt">> = {}

    if (task.status === "todo") {
      newStatus = "in-progress"
      updates = { status: newStatus, startedAt: new Date() }
    } else if (task.status === "in-progress") {
      newStatus = "completed"
      updates = { 
        status: newStatus, 
        completedAt: new Date(),
        actualTime: task.actualTime || task.estimatedTime || 0
      }
    } else {
      newStatus = "todo"
      updates = { status: newStatus, startedAt: undefined, completedAt: undefined }
    }

    return updateTask(id, updates)
  }

  return {
    tasks,
    stats,
    addTask,
    addTasks,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  }
}
