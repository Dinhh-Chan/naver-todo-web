import type { Task } from "./types"
import { addDays, isAfter, isBefore, differenceInDays, isSameDay } from "date-fns"

export interface AIInsight {
  id: string
  type: "suggestion" | "warning" | "tip" | "achievement"
  title: string
  description: string
  action?: {
    label: string
    taskId?: string
  }
}

export interface AISuggestion {
  priority?: Task["priority"]
  dueDate?: Date
  estimatedTime?: number
  category?: string
  reasoning: string
}

export class AIEngine {
  static analyzeTasks(tasks: Task[]): AIInsight[] {
    const insights: AIInsight[] = []
    const now = new Date()

    // Check for overdue tasks
    const overdueTasks = tasks.filter(
      (task) => task.dueDate && isBefore(task.dueDate, now) && task.status !== "completed",
    )

    if (overdueTasks.length > 0) {
      insights.push({
        id: "overdue-warning",
        type: "warning",
        title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? "s" : ""}`,
        description:
          "You have tasks that are past their due date. Consider prioritizing these or adjusting their deadlines.",
        action: {
          label: "Review Overdue Tasks",
        },
      })
    }

    // Check for productivity patterns
    const completedTasks = tasks.filter((t) => t.status === "completed")
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0

    if (completionRate >= 80) {
      insights.push({
        id: "high-productivity",
        type: "achievement",
        title: "Excellent Productivity!",
        description: `You've completed ${Math.round(completionRate)}% of your tasks. Keep up the great work!`,
      })
    } else if (completionRate < 50 && tasks.length > 3) {
      insights.push({
        id: "low-productivity",
        type: "tip",
        title: "Boost Your Productivity",
        description: "Try breaking large tasks into smaller, manageable chunks. Focus on completing 2-3 tasks per day.",
      })
    }

    // Check for upcoming deadlines
    const upcomingTasks = tasks.filter(
      (task) =>
        task.dueDate &&
        isAfter(task.dueDate, now) &&
        differenceInDays(task.dueDate, now) <= 3 &&
        task.status !== "completed",
    )

    if (upcomingTasks.length > 0) {
      insights.push({
        id: "upcoming-deadlines",
        type: "suggestion",
        title: "Upcoming Deadlines",
        description: `You have ${upcomingTasks.length} task${upcomingTasks.length > 1 ? "s" : ""} due within 3 days. Consider prioritizing these.`,
        action: {
          label: "View Tasks",
        },
      })
    }

    // Check for task balance
    const highPriorityTasks = tasks.filter((t) => t.priority === "high" && t.status !== "completed")
    const totalActiveTasks = tasks.filter((t) => t.status !== "completed")

    if (highPriorityTasks.length > totalActiveTasks.length * 0.6) {
      insights.push({
        id: "priority-balance",
        type: "tip",
        title: "Priority Balance",
        description: "You have many high-priority tasks. Consider if some could be medium priority to reduce stress.",
      })
    }

    // Check for time estimation patterns
    const tasksWithTime = tasks.filter((t) => t.estimatedTime)
    if (tasksWithTime.length > 0) {
      const avgTime = tasksWithTime.reduce((sum, t) => sum + (t.estimatedTime || 0), 0) / tasksWithTime.length

      if (avgTime > 120) {
        insights.push({
          id: "large-tasks",
          type: "suggestion",
          title: "Break Down Large Tasks",
          description:
            "Your tasks average over 2 hours. Breaking them into smaller chunks can improve completion rates.",
        })
      }
    }

    return insights
  }

  static calculateProcrastinationFactor(task: Task): number {
    if (!task.estimatedTime || !task.actualTime) return 1
    
    return task.actualTime / task.estimatedTime
  }

  static suggestTaskPrioritization(tasks: Task[]): Task[] {
    return tasks
      .filter(task => task.status !== "completed")
      .sort((a, b) => {
        // Priority weight
        const priorityWeight = { high: 3, medium: 2, low: 1 }
        const aPriority = priorityWeight[a.priority]
        const bPriority = priorityWeight[b.priority]

        // Due date urgency
        const now = new Date()
        const aUrgency = a.dueDate ? Math.max(0, 7 - differenceInDays(a.dueDate, now)) : 0
        const bUrgency = b.dueDate ? Math.max(0, 7 - differenceInDays(b.dueDate, now)) : 0

        // Procrastination factor (higher factor = more urgent)
        const aProcrastination = a.procrastinationFactor || 1
        const bProcrastination = b.procrastinationFactor || 1

        // Calculate total score
        const aScore = aPriority * 10 + aUrgency * 5 + aProcrastination * 2
        const bScore = bPriority * 10 + bUrgency * 5 + bProcrastination * 2

        return bScore - aScore
      })
  }

  static suggestOptimalSchedule(tasks: Task[]): { taskId: string; suggestedTime: Date; reasoning: string }[] {
    const activeTasks = tasks.filter(task => task.status !== "completed")
    const suggestions: { taskId: string; suggestedTime: Date; reasoning: string }[] = []

    // Analyze user patterns
    const completedTasks = tasks.filter(task => task.status === "completed" && task.completedAt)
    const completionTimes = completedTasks.map(task => task.completedAt!.getHours())
    const mostProductiveHour = this.getMostFrequentHour(completionTimes)

    activeTasks.forEach(task => {
      const now = new Date()
      let suggestedTime = new Date(now)
      
      // Set time based on priority and user patterns
      if (task.priority === "high") {
        suggestedTime.setHours(mostProductiveHour, 0, 0, 0)
        if (suggestedTime <= now) {
          suggestedTime.setDate(suggestedTime.getDate() + 1)
        }
        suggestions.push({
          taskId: task.id,
          suggestedTime,
          reasoning: `High priority task scheduled for your most productive hour (${mostProductiveHour}:00)`
        })
      } else if (task.priority === "medium") {
        suggestedTime.setHours(mostProductiveHour + 2, 0, 0, 0)
        if (suggestedTime <= now) {
          suggestedTime.setDate(suggestedTime.getDate() + 1)
        }
        suggestions.push({
          taskId: task.id,
          suggestedTime,
          reasoning: `Medium priority task scheduled for ${mostProductiveHour + 2}:00`
        })
      } else {
        suggestedTime.setHours(mostProductiveHour + 4, 0, 0, 0)
        if (suggestedTime <= now) {
          suggestedTime.setDate(suggestedTime.getDate() + 1)
        }
        suggestions.push({
          taskId: task.id,
          suggestedTime,
          reasoning: `Low priority task scheduled for ${mostProductiveHour + 4}:00`
        })
      }
    })

    return suggestions
  }

  static suggestTaskProperties(title: string, description: string, existingTasks: Task[], projectMembers?: string[]): AISuggestion {
    const titleLower = title.toLowerCase()
    const descLower = description.toLowerCase()

    // Priority suggestions based on keywords
    let priority: Task["priority"] = "medium"
    let reasoning = "Based on task content analysis: "

    const highPriorityKeywords = ["urgent", "asap", "deadline", "exam", "test", "presentation", "interview", "meeting"]
    const lowPriorityKeywords = ["research", "read", "review", "optional", "when possible", "someday"]

    if (highPriorityKeywords.some((keyword) => titleLower.includes(keyword) || descLower.includes(keyword))) {
      priority = "high"
      reasoning += "Detected urgent keywords. "
    } else if (lowPriorityKeywords.some((keyword) => titleLower.includes(keyword) || descLower.includes(keyword))) {
      priority = "low"
      reasoning += "Detected flexible timing keywords. "
    }

    // Category suggestions
    let category: string | undefined
    const categoryKeywords = {
      Study: ["study", "learn", "read", "research", "review", "notes"],
      Assignment: ["assignment", "homework", "essay", "paper", "report", "project"],
      Exam: ["exam", "test", "quiz", "midterm", "final"],
      Meeting: ["meeting", "appointment", "call", "interview"],
      Personal: ["personal", "health", "exercise", "family", "friend"],
    }

    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => titleLower.includes(keyword) || descLower.includes(keyword))) {
        category = cat
        reasoning += `Suggested category: ${cat}. `
        break
      }
    }

    // Time estimation based on task type and content
    let estimatedTime: number | undefined

    if (titleLower.includes("meeting") || titleLower.includes("call")) {
      estimatedTime = 60
      reasoning += "Meetings typically take 1 hour. "
    } else if (titleLower.includes("exam") || titleLower.includes("test")) {
      estimatedTime = 180
      reasoning += "Exam preparation usually needs 3+ hours. "
    } else if (titleLower.includes("essay") || titleLower.includes("paper")) {
      estimatedTime = 240
      reasoning += "Writing tasks typically need 4+ hours. "
    } else if (titleLower.includes("read") || titleLower.includes("review")) {
      estimatedTime = 90
      reasoning += "Reading tasks usually take 1-2 hours. "
    } else {
      // Base estimation on description length
      const wordCount = (title + " " + description).split(" ").length
      if (wordCount > 20) {
        estimatedTime = 120
        reasoning += "Complex task based on description length. "
      } else if (wordCount > 10) {
        estimatedTime = 60
        reasoning += "Moderate task complexity. "
      } else {
        estimatedTime = 30
        reasoning += "Simple task based on brief description. "
      }
    }

    // Due date suggestions based on priority and existing workload
    let dueDate: Date | undefined
    const now = new Date()

    if (priority === "high") {
      dueDate = addDays(now, 2)
      reasoning += "High priority tasks should be completed within 2 days. "
    } else if (priority === "medium") {
      dueDate = addDays(now, 5)
      reasoning += "Medium priority tasks can be completed within a week. "
    } else {
      dueDate = addDays(now, 10)
      reasoning += "Low priority tasks can be scheduled for next week. "
    }

    return {
      priority,
      dueDate,
      estimatedTime,
      category,
      reasoning: reasoning.trim(),
    }
  }

  static suggestAssignees(title: string, description: string, projectMembers: string[], existingTasks: Task[]): string[] {
    if (projectMembers.length === 0) return []

    const titleLower = title.toLowerCase()
    const descLower = description.toLowerCase()
    const suggestions: string[] = []

    // Analyze task content for skill-based assignment
    const skillKeywords = {
      "john_doe": ["frontend", "react", "ui", "design", "css", "javascript"],
      "jane_smith": ["backend", "api", "database", "server", "python", "java"],
      "admin": ["management", "review", "approve", "coordinate", "planning"]
    }

    // Check for skill matches
    for (const [member, skills] of Object.entries(skillKeywords)) {
      if (projectMembers.includes(member)) {
        const hasSkill = skills.some(skill => 
          titleLower.includes(skill) || descLower.includes(skill)
        )
        if (hasSkill) {
          suggestions.push(member)
        }
      }
    }

    // If no skill-based suggestions, suggest based on workload
    if (suggestions.length === 0) {
      const memberWorkloads = projectMembers.map(member => {
        const memberTasks = existingTasks.filter(task => 
          task.assignedTo?.includes(member) && task.status !== "completed"
        )
        return { member, taskCount: memberTasks.length }
      })

      // Suggest member with least workload
      const leastBusyMember = memberWorkloads.reduce((min, current) => 
        current.taskCount < min.taskCount ? current : min
      )

      if (leastBusyMember.taskCount < 5) { // Only suggest if not overloaded
        suggestions.push(leastBusyMember.member)
      }
    }

    return suggestions.slice(0, 2) // Return max 2 suggestions
  }

  static generateProjectInsights(project: any, tasks: Task[]): string[] {
    const insights: string[] = []
    const projectTasks = tasks.filter(task => task.projectId === project.id)
    
    if (projectTasks.length === 0) {
      insights.push("This project is just getting started. Consider adding some initial tasks to define the scope.")
      return insights
    }

    const completedTasks = projectTasks.filter(task => task.status === "completed")
    const completionRate = (completedTasks.length / projectTasks.length) * 100

    if (completionRate >= 80) {
      insights.push("Excellent progress! This project is nearly complete. Great job!")
    } else if (completionRate >= 50) {
      insights.push("Good progress on this project. You're about halfway there!")
    } else if (completionRate < 20) {
      insights.push("This project is in early stages. Consider breaking down large tasks into smaller, manageable pieces.")
    }

    // Check for overdue tasks
    const overdueTasks = projectTasks.filter(task => 
      task.dueDate && task.dueDate < new Date() && task.status !== "completed"
    )

    if (overdueTasks.length > 0) {
      insights.push(`You have ${overdueTasks.length} overdue task(s) in this project. Consider reprioritizing or adjusting deadlines.`)
    }

    // Check for task distribution
    const assignedTasks = projectTasks.filter(task => task.assignedTo && task.assignedTo.length > 0)
    const unassignedTasks = projectTasks.filter(task => !task.assignedTo || task.assignedTo.length === 0)

    if (unassignedTasks.length > projectTasks.length * 0.3) {
      insights.push("Many tasks in this project are unassigned. Consider assigning tasks to team members for better accountability.")
    }

    return insights
  }

  static generateProductivityTips(tasks: Task[]): string[] {
    const tips: string[] = []

    const completedTasks = tasks.filter((t) => t.status === "completed")
    const activeTasks = tasks.filter((t) => t.status !== "completed")

    if (activeTasks.length > 10) {
      tips.push(
        "Consider focusing on fewer tasks at once. Research shows 3-5 active tasks is optimal for productivity.",
      )
    }

    if (completedTasks.length > 0) {
      const avgCompletionTime =
        completedTasks.filter((t) => t.estimatedTime).reduce((sum, t) => sum + (t.estimatedTime || 0), 0) /
        Math.max(completedTasks.filter((t) => t.estimatedTime).length, 1)

      if (avgCompletionTime > 120) {
        tips.push("Try the Pomodoro Technique: work for 25 minutes, then take a 5-minute break.")
      }
    }

    const categories = [...new Set(tasks.map((t) => t.category).filter(Boolean))]
    if (categories.length > 5) {
      tips.push("You have many categories. Consider consolidating similar ones for better organization.")
    }

    tips.push("Set specific times for checking and updating your tasks to maintain momentum.")
    tips.push("Celebrate small wins! Completing tasks releases dopamine and motivates continued progress.")

    return tips
  }

  private static getMostFrequentHour(hours: number[]): number {
    if (hours.length === 0) return 9 // Default to 9 AM

    const frequency: Record<number, number> = {}
    hours.forEach(hour => {
      frequency[hour] = (frequency[hour] || 0) + 1
    })

    return parseInt(Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)[0][0])
  }

  static generateSmartNotifications(tasks: Task[]): { type: string; message: string; taskId?: string }[] {
    const notifications: { type: string; message: string; taskId?: string }[] = []
    const now = new Date()

    // Overdue tasks
    const overdueTasks = tasks.filter(
      task => task.dueDate && task.dueDate < now && task.status !== "completed"
    )
    
    if (overdueTasks.length > 0) {
      notifications.push({
        type: "warning",
        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider prioritizing these.`,
        taskId: overdueTasks[0].id
      })
    }

    // Upcoming deadlines (within 2 hours)
    const upcomingTasks = tasks.filter(
      task => task.dueDate && 
      task.dueDate > now && 
      task.dueDate <= new Date(now.getTime() + 2 * 60 * 60 * 1000) &&
      task.status !== "completed"
    )

    if (upcomingTasks.length > 0) {
      notifications.push({
        type: "info",
        message: `${upcomingTasks[0].title} is due in less than 2 hours.`,
        taskId: upcomingTasks[0].id
      })
    }

    // Productivity boost
    const completedToday = tasks.filter(
      task => task.status === "completed" && 
      task.completedAt && 
      isSameDay(task.completedAt, now)
    ).length

    if (completedToday >= 3) {
      notifications.push({
        type: "success",
        message: `Great job! You've completed ${completedToday} tasks today. Keep up the momentum!`
      })
    }

    // Procrastination warning
    const highProcrastinationTasks = tasks.filter(
      task => task.procrastinationFactor && task.procrastinationFactor > 1.5
    )

    if (highProcrastinationTasks.length > 0) {
      notifications.push({
        type: "warning",
        message: "You tend to take longer than estimated. Consider adding buffer time to your estimates."
      })
    }

    return notifications
  }
}
