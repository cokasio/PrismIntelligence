"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Building,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import type { EmailData } from './WorkspaceLayout'

interface EmailsTabProps {
  onSelectEmail: (email: EmailData) => void
  selectedEmailId?: string
}

export function EmailsTab({ onSelectEmail, selectedEmailId }: EmailsTabProps) {
  const [emails, setEmails] = useState<EmailData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(true)
  const [processingCount, setProcessingCount] = useState(0)

  useEffect(() => {
    fetchEmails()
    checkMode()
  }, [])

  const fetchEmails = async () => {
    // This would fetch from your actual data store
    setEmails([])
  }

  const checkMode = async () => {
    try {
      const response = await fetch('/api/emails/mode')
      if (response.ok) {
        const data = await response.json()
        setIsDemoMode(data.mode === 'demo')
      }
    } catch (error) {
      console.error('Failed to check mode:', error)
    }
  }

  const toggleMode = async (demo: boolean) => {
    try {
      const response = await fetch('/api/emails/toggle-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo })
      })
      
      if (response.ok) {
        setIsDemoMode(demo)
      }
    } catch (error) {
      console.error('Failed to toggle mode:', error)
    }
  }

  const testDemoProcessing = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cloudmailin/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Triggers demo processing
      })

      if (response.ok) {
        const result = await response.json()
        if (result.result) {
          setEmails(prev => [result.result, ...prev])
          setProcessingCount(prev => prev + 1)
          onSelectEmail(result.result)
        }
      }
    } catch (error) {
      console.error('Failed to test processing:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'destructive'
    if (priority <= 3) return 'secondary'
    return 'default'
  }

  const getPriorityIcon = (priority: number) => {
    if (priority <= 2) return AlertCircle
    if (priority <= 3) return Clock
    return CheckCircle
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <h2 className="font-semibold">Email Processing</h2>
          </div>
          <Badge variant={isDemoMode ? "secondary" : "default"}>
            {isDemoMode ? 'Demo' : 'Live'}
          </Badge>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="demo-mode"
              checked={!isDemoMode}
              onCheckedChange={(checked) => toggleMode(!checked)}
            />
            <Label htmlFor="demo-mode" className="text-sm font-medium">
              Live Mode
            </Label>
          </div>
          <span className="text-xs text-muted-foreground">
            {processingCount} processed
          </span>
        </div>

        {/* CloudMailin Info */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="text-xs font-mono text-muted-foreground">
              📧 38fab3b51608018af887@cloudmailin.net
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Webhook: /api/cloudmailin/webhook
            </div>
          </CardContent>
        </Card>
