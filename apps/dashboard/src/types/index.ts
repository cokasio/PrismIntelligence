export interface ProcessedEmail {
  id: string
  customerInfo: {
    company: string
    slug: string
    email: string
  }
  emailData: {
    headers: {
      subject: string
      from: string
      date: string
    }
    plain: string
    html?: string
    attachments?: EmailAttachment[]
  }
  analysis: {
    summary: string
    keyMetrics: {
      revenue?: number
      expenses?: number
      noi?: number
      occupancy?: number
      [key: string]: any
    }
    insights: string[]
    actions: string[]
    priority: number
    confidence: number
  }
  processedAt: string
  mode: 'demo' | 'live'
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface EmailAttachment {
  content?: string
  file_name: string
  content_type: string
  size: number
  disposition?: string
  extractedText?: string
  processed?: boolean
}

export interface SendEmailRequest {
  customerSlug: string
  reportType: 'financial' | 'operational' | 'maintenance' | 'lease'
  attachmentType?: 'pdf' | 'excel' | 'csv'
}

export interface SendEmailResponse {
  success: boolean
  messageId?: string
  previewUrl?: string
  to?: string
  subject?: string
  attachment?: string
  error?: string
}

export interface WorkspaceView {
  type: 'files' | 'emails' | 'chat'
  selectedItem?: any
}

export interface TabItem {
  id: string
  title: string
  type: 'file' | 'email' | 'report'
  content?: any
  isActive: boolean
  isDirty?: boolean
}