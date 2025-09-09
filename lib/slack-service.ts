// Slack Service for AnyF Time Manager
// Handles Slack OAuth, API calls, and message sending

export interface SlackConfig {
  clientId: string
  redirectUri: string
  scope: string
}

export interface SlackMessage {
  channel: string
  text: string
  blocks?: any[]
  attachments?: any[]
}

export interface SlackTask {
  id: string
  title: string
  description?: string
  priority: string
  dueDate?: string
  status: string
  category?: string
  tags?: string[]
}

export class SlackService {
  private static instance: SlackService
  private accessToken: string | null = null
  private config: SlackConfig = {
    clientId: 'your-slack-client-id', // Replace with actual client ID
    redirectUri: `${window.location.origin}/slack-callback`,
    scope: 'chat:write,channels:read,users:read'
  }

  static getInstance(): SlackService {
    if (!SlackService.instance) {
      SlackService.instance = new SlackService()
    }
    return SlackService.instance
  }

  // Initialize service
  initialize(): void {
    // Load saved token from localStorage
    const savedToken = localStorage.getItem('slack-access-token')
    if (savedToken) {
      this.accessToken = savedToken
    }
  }

  // Check if user is connected to Slack
  isConnected(): boolean {
    return !!this.accessToken
  }

  // Get Slack OAuth URL
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      response_type: 'code',
      state: crypto.randomUUID()
    })

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`
  }

  // Handle OAuth callback (mock implementation)
  async handleAuthCallback(code: string): Promise<boolean> {
    try {
      // In a real implementation, this would exchange the code for an access token
      // For POC, we'll simulate this process
      const mockToken = `slack_token_${Date.now()}`
      
      this.accessToken = mockToken
      localStorage.setItem('slack-access-token', mockToken)
      
      return true
    } catch (error) {
      console.error('Slack auth error:', error)
      return false
    }
  }

  // Disconnect from Slack
  disconnect(): void {
    this.accessToken = null
    localStorage.removeItem('slack-access-token')
  }

  // Send message to Slack channel
  async sendMessage(message: SlackMessage): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('Not connected to Slack')
    }

    try {
      // Mock API call - in real implementation, use actual Slack API
      const response = await fetch('/api/slack/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(message)
      })

      // For POC, simulate success
      console.log('Slack message sent:', message)
      return true
    } catch (error) {
      console.error('Error sending Slack message:', error)
      return false
    }
  }

  // Send task to Slack
  async sendTaskToSlack(task: SlackTask, channel: string = '#tasks'): Promise<boolean> {
    const message = this.formatTaskMessage(task)
    
    return this.sendMessage({
      channel,
      text: `📋 Task mới: ${task.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${task.title}*`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Priority:* ${this.getPriorityEmoji(task.priority)} ${task.priority}`
            },
            {
              type: 'mrkdwn',
              text: `*Status:* ${this.getStatusEmoji(task.status)} ${task.status}`
            },
            ...(task.dueDate ? [{
              type: 'mrkdwn',
              text: `*Due Date:* ${new Date(task.dueDate).toLocaleDateString('vi-VN')}`
            }] : []),
            ...(task.category ? [{
              type: 'mrkdwn',
              text: `*Category:* ${task.category}`
            }] : [])
          ]
        },
        ...(task.description ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:*\n${task.description}`
          }
        }] : []),
        ...(task.tags && task.tags.length > 0 ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Tags:* ${task.tags.map(tag => `\`${tag}\``).join(' ')}`
          }
        }] : [])
      ]
    })
  }

  // Format task as Slack message
  private formatTaskMessage(task: SlackTask): string {
    let message = `📋 *${task.title}*\n`
    message += `Priority: ${this.getPriorityEmoji(task.priority)} ${task.priority}\n`
    message += `Status: ${this.getStatusEmoji(task.status)} ${task.status}\n`
    
    if (task.dueDate) {
      message += `Due: ${new Date(task.dueDate).toLocaleDateString('vi-VN')}\n`
    }
    
    if (task.category) {
      message += `Category: ${task.category}\n`
    }
    
    if (task.description) {
      message += `Description: ${task.description}\n`
    }
    
    if (task.tags && task.tags.length > 0) {
      message += `Tags: ${task.tags.join(', ')}\n`
    }
    
    return message
  }

  // Get priority emoji
  private getPriorityEmoji(priority: string): string {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  // Get status emoji
  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'todo': return '📝'
      case 'in-progress': return '🔄'
      case 'completed': return '✅'
      default: return '❓'
    }
  }

  // Get user info (mock)
  async getUserInfo(): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not connected to Slack')
    }

    // Mock user info
    return {
      id: 'U1234567890',
      name: 'anyf_user',
      real_name: 'AnyF User',
      profile: {
        image_24: '/placeholder-user.jpg',
        image_32: '/placeholder-user.jpg',
        image_48: '/placeholder-user.jpg'
      }
    }
  }

  // Get channels (mock)
  async getChannels(): Promise<any[]> {
    if (!this.accessToken) {
      throw new Error('Not connected to Slack')
    }

    // Mock channels
    return [
      { id: 'C1234567890', name: 'general', is_member: true },
      { id: 'C1234567891', name: 'tasks', is_member: true },
      { id: 'C1234567892', name: 'projects', is_member: false }
    ]
  }

  // Send AI insight to Slack
  async sendAIInsight(insight: string, channel: string = '#ai-insights'): Promise<boolean> {
    return this.sendMessage({
      channel,
      text: '🤖 AI Insight',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🤖 AI Insight*\n\n${insight}`
          }
        }
      ]
    })
  }

  // Send productivity update
  async sendProductivityUpdate(stats: any, channel: string = '#productivity'): Promise<boolean> {
    const message = `📊 *Productivity Update*\n\n` +
      `✅ Completed: ${stats.completed}\n` +
      `🔄 In Progress: ${stats.inProgress}\n` +
      `📝 Total: ${stats.total}\n` +
      `📈 Completion Rate: ${stats.completionRate}%`

    return this.sendMessage({
      channel,
      text: 'Productivity Update',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message
          }
        }
      ]
    })
  }
}

// Export singleton instance
export const slackService = SlackService.getInstance()
