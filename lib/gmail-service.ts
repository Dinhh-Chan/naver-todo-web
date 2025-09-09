// Gmail Service for AnyF Time Manager
// Handles Gmail API integration, email sync, and task creation

export interface GmailConfig {
  clientId: string
  apiKey: string
  discoveryDocs: string[]
  scope: string
}

export interface GmailMessage {
  id: string
  threadId: string
  subject: string
  from: string
  to: string
  date: string
  body: string
  snippet: string
}

export interface GmailTask {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  source: 'gmail'
  emailId: string
  category?: string
  tags?: string[]
}

export class GmailService {
  private static instance: GmailService
  private gapi: any = null
  private isInitialized = false
  private config: GmailConfig = {
    clientId: 'your-google-client-id', // Replace with actual client ID
    apiKey: 'your-google-api-key', // Replace with actual API key
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'
  }

  static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService()
    }
    return GmailService.instance
  }

  // Initialize Gmail API
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true
    }

    try {
      // Load Google API script if not already loaded
      if (!(window as any).gapi) {
        await this.loadGoogleAPI()
      }
      // Declare gapi type on window
      if (typeof window !== 'undefined') {
        window.gapi = window.gapi || {}
      }

      this.gapi = window.gapi

      // Initialize the client
      await this.gapi.client.init({
        apiKey: this.config.apiKey,
        clientId: this.config.clientId,
        discoveryDocs: this.config.discoveryDocs,
        scope: this.config.scope
      })

      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Gmail API initialization error:', error)
      return false
    }
  }

  // Load Google API script
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          resolve()
        })
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Check if user is signed in
  isSignedIn(): boolean {
    return this.gapi && this.gapi.auth2 && this.gapi.auth2.getAuthInstance().isSignedIn.get()
  }

  // Sign in to Google
  async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      const authInstance = this.gapi.auth2.getAuthInstance()
      const user = await authInstance.signIn()
      
      return user.isSignedIn()
    } catch (error) {
      console.error('Gmail sign in error:', error)
      return false
    }
  }

  // Sign out from Google   
  async signOut(): Promise<void> {
    if (this.gapi && this.gapi.auth2) {
      const authInstance = this.gapi.auth2.getAuthInstance()
      await authInstance.signOut()
    }
  }

  // Get user profile
  async getUserProfile(): Promise<any> {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in to Gmail')
    }

    try {
      const response = await this.gapi.client.gmail.users.getProfile({
        userId: 'me'
      })
      return response.result
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  // Get emails with specific keywords
  async getEmailsWithKeywords(keywords: string[], maxResults: number = 10): Promise<GmailMessage[]> {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in to Gmail')
    }

    try {
      // Build query string
      const query = keywords.map(keyword => `"${keyword}"`).join(' OR ')
      
      const response = await this.gapi.client.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults
      })

      const messages = response.result.messages || []
      const detailedMessages: GmailMessage[] = []

      // Get detailed information for each message
      for (const message of messages) {
        try {
          const detailResponse = await this.gapi.client.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          })

          const msg = detailResponse.result
          const headers = msg.payload.headers
          
          const subject = headers.find((h: any) => h.name === 'Subject')?.value || ''
          const from = headers.find((h: any) => h.name === 'From')?.value || ''
          const to = headers.find((h: any) => h.name === 'To')?.value || ''
          const date = headers.find((h: any) => h.name === 'Date')?.value || ''

          // Extract body text
          let body = ''
          if (msg.payload.body && msg.payload.body.data) {
            body = atob(msg.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
          } else if (msg.payload.parts) {
            for (const part of msg.payload.parts) {
              if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
                break
              }
            }
          }

          detailedMessages.push({
            id: message.id,
            threadId: message.threadId,
            subject,
            from,
            to,
            date,
            body,
            snippet: msg.snippet
          })
        } catch (error) {
          console.error('Error getting message details:', error)
        }
      }

      return detailedMessages
    } catch (error) {
      console.error('Error getting emails:', error)
      throw error
    }
  }

  // Convert email to task
  emailToTask(email: GmailMessage): GmailTask {
    const title = email.subject || 'Task from Email'
    const description = email.snippet || email.body.substring(0, 200)
    
    // AI analysis to determine priority and due date
    const priority = this.analyzeEmailPriority(email)
    const dueDate = this.extractDueDate(email)
    const category = this.categorizeEmail(email)
    const tags = this.extractTags(email)

    return {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      dueDate,
      source: 'gmail',
      emailId: email.id,
      category,
      tags
    }
  }

  // Analyze email to determine priority
  private analyzeEmailPriority(email: GmailMessage): 'low' | 'medium' | 'high' {
    const text = (email.subject + ' ' + email.body).toLowerCase()
    
    const highPriorityKeywords = ['urgent', 'asap', 'deadline', 'important', 'critical', 'emergency']
    const lowPriorityKeywords = ['optional', 'when possible', 'someday', 'low priority']
    
    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'high'
    }
    
    if (lowPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'low'
    }
    
    return 'medium'
  }

  // Extract due date from email
  private extractDueDate(email: GmailMessage): Date | undefined {
    const text = (email.subject + ' ' + email.body).toLowerCase()
    
    // Look for date patterns
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, // MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/g, // MM-DD-YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/g, // YYYY-MM-DD
    ]
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        try {
          return new Date(match[0])
        } catch (error) {
          continue
        }
      }
    }
    
    // Look for relative dates
    if (text.includes('tomorrow')) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    }
    
    if (text.includes('next week')) {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      return nextWeek
    }
    
    return undefined
  }

  // Categorize email
  private categorizeEmail(email: GmailMessage): string | undefined {
    const text = (email.subject + ' ' + email.body).toLowerCase()
    
    const categories = {
      'Study': ['study', 'homework', 'assignment', 'exam', 'test', 'quiz'],
      'Meeting': ['meeting', 'appointment', 'call', 'conference'],
      'Project': ['project', 'group work', 'collaboration'],
      'Personal': ['personal', 'health', 'family', 'friend'],
      'Work': ['work', 'job', 'internship', 'career']
    }
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category
      }
    }
    
    return undefined
  }

  // Extract tags from email
  private extractTags(email: GmailMessage): string[] {
    const text = (email.subject + ' ' + email.body).toLowerCase()
    const tags: string[] = []
    
    const commonTags = ['deadline', 'urgent', 'group', 'individual', 'presentation', 'report', 'research']
    
    commonTags.forEach(tag => {
      if (text.includes(tag)) {
        tags.push(tag)
      }
    })
    
    return tags
  }

  // Sync emails and create tasks
  async syncEmailsToTasks(keywords: string[] = ['deadline', 'assignment', 'homework', 'meeting']): Promise<GmailTask[]> {
    try {
      const emails = await this.getEmailsWithKeywords(keywords, 20)
      const tasks = emails.map(email => this.emailToTask(email))
      
      return tasks
    } catch (error) {
      console.error('Error syncing emails to tasks:', error)
      throw error
    }
  }

  // Send email notification
  async sendEmailNotification(to: string, subject: string, body: string): Promise<boolean> {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in to Gmail')
    }

    try {
      const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\n')

      const encodedMessage = btoa(message).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

      await this.gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: encodedMessage
        }
      })

      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  // Send task reminder email
  async sendTaskReminderEmail(email: string, task: any): Promise<boolean> {
    const subject = `⏰ Nhắc nhở: ${task.title}`
    const body = `
Xin chào,

Đây là nhắc nhở từ AnyF Time Manager:

📋 Task: ${task.title}
📅 Hạn chót: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Chưa có'}
🎯 Độ ưu tiên: ${task.priority}
📊 Trạng thái: ${task.status}

${task.description ? `Mô tả: ${task.description}` : ''}

Hãy hoàn thành task này để đạt được mục tiêu của bạn!

---
AnyF Time Manager - Quản lý thời gian thông minh
    `

    return this.sendEmailNotification(email, subject, body)
  }
}

// Export singleton instance
export const gmailService = GmailService.getInstance()
