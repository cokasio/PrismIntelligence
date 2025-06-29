import { ProcessedEmail, SendEmailRequest, SendEmailResponse } from '@/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Email processing endpoints
  async getEmails(): Promise<ProcessedEmail[]> {
    return this.request<ProcessedEmail[]>('/api/emails')
  }

  async getEmail(id: string): Promise<ProcessedEmail> {
    return this.request<ProcessedEmail>(`/api/emails/${id}`)
  }

  async processTestEmail(): Promise<ProcessedEmail> {
    return this.request<ProcessedEmail>('/api/emails/process-test', {
      method: 'POST',
    })
  }

  async sendTestEmail(data: SendEmailRequest): Promise<SendEmailResponse> {
    return this.request<SendEmailResponse>('/api/emails/send-test', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Mode management
  async getMode(): Promise<{ mode: 'demo' | 'live'; description: string }> {
    return this.request('/api/mode')
  }

  async setMode(demo: boolean): Promise<{ success: boolean; mode: any }> {
    return this.request('/api/mode', {
      method: 'POST',
      body: JSON.stringify({ demo }),
    })
  }

  // CloudMailin webhook simulation
  async simulateWebhook(emailData?: any): Promise<ProcessedEmail> {
    return this.request<ProcessedEmail>('/api/cloudmailin/webhook', {
      method: 'POST',
      body: JSON.stringify(emailData || {}),
    })
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/api/health')
  }
}

export const api = new ApiClient(BACKEND_URL)