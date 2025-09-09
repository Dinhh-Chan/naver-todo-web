import type { Task, TaskStats } from "./types"
import { FirebaseService } from "./firebase-config"

const STORAGE_KEY = "anyf-time-manager-tasks"

export class TaskStorage {
  static getTasks(): Task[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const tasks = JSON.parse(stored)
      return tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
      }))
    } catch (error) {
      console.error("Error loading tasks:", error)
      return []
    }
  }

  static saveTasks(tasks: Task[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
      // Sync with Firebase (if enabled)
      FirebaseService.saveTasks(tasks)
    } catch (error) {
      console.error("Error saving tasks:", error)
    }
  }

  static addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const tasks = this.getTasks()
    tasks.push(newTask)
    this.saveTasks(tasks)

    return newTask
  }

  static updateTask(id: string, updates: Partial<Omit<Task, "id" | "createdAt">>): Task | null {
    const tasks = this.getTasks()
    const taskIndex = tasks.findIndex((task) => task.id === id)

    if (taskIndex === -1) return null

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    }

    tasks[taskIndex] = updatedTask
    this.saveTasks(tasks)

    return updatedTask
  }

  static deleteTask(id: string): boolean {
    const tasks = this.getTasks()
    const filteredTasks = tasks.filter((task) => task.id !== id)

    if (filteredTasks.length === tasks.length) return false

    this.saveTasks(filteredTasks)
    return true
  }

  static getTaskStats(): TaskStats {
    const tasks = this.getTasks()
    const total = tasks.length
    const completed = tasks.filter((task) => task.status === "completed").length
    const inProgress = tasks.filter((task) => task.status === "in-progress").length
    const overdue = tasks.filter(
      (task) => task.dueDate && task.dueDate < new Date() && task.status !== "completed",
    ).length

    // Calculate procrastination factor
    const tasksWithTime = tasks.filter((t) => t.estimatedTime && t.actualTime)
    const averageProcrastinationFactor = tasksWithTime.length > 0 
      ? tasksWithTime.reduce((sum, t) => sum + ((t.actualTime || 0) / (t.estimatedTime || 1)), 0) / tasksWithTime.length
      : 1

    // Calculate total time
    const totalEstimatedTime = tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0)
    const totalActualTime = tasks.reduce((sum, t) => sum + (t.actualTime || 0), 0)

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      averageProcrastinationFactor: Math.round(averageProcrastinationFactor * 100) / 100,
      totalEstimatedTime,
      totalActualTime,
    }
  }
}
