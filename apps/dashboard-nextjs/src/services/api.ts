// API service to connect to Prism Intelligence backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ProcessEmailRequest {
  subject: string
  content: string
  attachments?: File[]
}

export interface ProcessDocumentRequest {
  file: File
  propertyId?: string
  type?: 'financial' | 'maintenance' | 'lease' | 'other'
}

export interface AnalysisResponse {
  id: string
  status: 'processing' | 'completed' | 'error'
  insights?: {
    summary: string
    keyFindings: string[]
    recommendations: string[]
  }
  tasks?: Array<{
    id: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    category: string
    estimatedValue?: string
    dueDate?: string
  }>
  metrics?: {
    processingTime: number
    confidenceScore: number
    tasksGenerated: number
    potentialValue: string
  }
}

class PrismAPI {
  async processEmail(data: ProcessEmailRequest): Promise<AnalysisResponse> {
    try {
      const formData = new FormData()
      formData.append('subject', data.subject)
      formData.append('content', data.content)
      
      if (data.attachments) {
        data.attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file)
        })
      }

      const response = await fetch(`${API_BASE_URL}/api/process-email`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to process email')
      }

      return await response.json()
    } catch (error) {
      console.error('Error processing email:', error)
      throw error
    }
  }

  async processDocument(data: ProcessDocumentRequest): Promise<AnalysisResponse> {
    try {
      const formData = new FormData()
      formData.append('file', data.file)
      
      if (data.propertyId) {
        formData.append('propertyId', data.propertyId)
      }
      
      if (data.type) {
        formData.append('type', data.type)
      }

      const response = await fetch(`${API_BASE_URL}/api/process-document`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to process document')
      }

      return await response.json()
    } catch (error) {
      console.error('Error processing document:', error)
      throw error
    }
  }

  async getAnalysisStatus(id: string): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to get analysis status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting analysis status:', error)
      throw error
    }
  }

  async getTasks(filters?: {
    status?: 'pending' | 'completed'
    priority?: 'high' | 'medium' | 'low'
    propertyId?: string
  }): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to get tasks')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting tasks:', error)
      throw error
    }
  }

  async getROIMetrics(timeframe?: 'week' | 'month' | 'quarter' | 'year'): Promise<any> {
    try {
      const params = timeframe ? `?timeframe=${timeframe}` : ''
      const response = await fetch(`${API_BASE_URL}/api/roi-metrics${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to get ROI metrics')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting ROI metrics:', error)
      throw error
    }
  }
}

export const prismAPI = new PrismAPI()
