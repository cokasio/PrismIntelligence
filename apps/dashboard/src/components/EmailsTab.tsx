'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface ProcessedEmail {
  id: string;
  customerInfo: {
    company: string;
    slug: string;
    email: string;
  };
  emailData: {
    headers: {
      subject: string;
      from: string;
      date: string;
    };
    attachments?: any[];
  };
  analysis: {
    summary: string;
    keyMetrics: any;
    insights: string[];
    actions: string[];
    priority: number;
    confidence: number;
  };
  processedAt: string;
  mode: 'demo' | 'live';
}

interface EmailsTabProps {
  onSelectEmail: (email: ProcessedEmail) => void;
  selectedEmailId?: string;
}

export function EmailsTab({ onSelectEmail, selectedEmailId }: EmailsTabProps) {
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [processingCount, setProcessingCount] = useState(0);

  useEffect(() => {
    checkMode();
  }, []);

  const checkMode = async () => {
    try {
      const response = await fetch('/api/emails/mode');
      const data = await response.json();
      setIsDemoMode(data.mode === 'demo');
    } catch (error) {
      console.error('Failed to check mode:', error);
    }
  };

  const toggleMode = async (demo: boolean) => {
    try {
      const response = await fetch('/api/emails/toggle-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo })
      });
      
      if (response.ok) {
        setIsDemoMode(demo);
      }
    } catch (error) {
      console.error('Failed to toggle mode:', error);
    }
  };

  const testDemoProcessing = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cloudmailin/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Triggers demo processing
      });

      if (response.ok) {
        const result = await response.json();
        // Add the result to emails list
        setEmails(prev => [result.result, ...prev]);
        setProcessingCount(prev => prev + 1);
        
        // Auto-select the new email
        if (result.result) {
          onSelectEmail(result.result);
        }
      }
    } catch (error) {
      console.error('Failed to test processing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/emails/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerSlug: 'sunset-plaza',
          reportType: 'financial',
          attachmentType: 'pdf'
        })
      });

      if (response.ok) {
        setProcessingCount(prev => prev + 1);
        // In a real implementation, this would trigger the webhook
        console.log('Test email sent successfully');
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'destructive';
    if (priority <= 3) return 'secondary';
    return 'default';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📧</span>
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
            <label htmlFor="demo-mode" className="text-sm font-medium">
              Live Mode
            </label>
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

        {/* Test Actions */}
        <div className="space-y-2">
          <Button
            onClick={testDemoProcessing}
            disabled={isLoading}
            className="w-full"
            size="sm"
          >
            {isLoading ? 'Processing...' : '🧪 Test Demo Processing'}
          </Button>
          
          <Button
            onClick={sendTestEmail}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            📤 Send Test Email
          </Button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-3">
          {emails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl mb-2 block">📧</span>
              <p className="text-sm">No emails processed yet</p>
              <p className="text-xs">Click "Test Demo Processing" to start</p>
            </div>
          ) : (
            emails.map((email) => {
              const isSelected = selectedEmailId === email.id;

              return (
                <div
                  key={email.id}
                  className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => onSelectEmail(email)}
                >
                  <Card className={`${isSelected ? 'border-primary' : 'hover:border-muted-foreground/50'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">
                            {email.customerInfo.company}
                          </CardTitle>
                          <CardDescription className="text-xs truncate">
                            {email.emailData.headers.subject}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Badge
                            variant={getPriorityColor(email.analysis.priority)}
                            className="text-xs"
                          >
                            P{email.analysis.priority}
                          </Badge>
                          {email.mode === 'demo' && (
                            <Badge variant="outline" className="text-xs">
                              Demo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{new Date(email.processedAt).toLocaleTimeString()}</span>
                        {email.emailData.attachments?.length > 0 && (
                          <>
                            <span>•</span>
                            <span>📎 {email.emailData.attachments.length} attachment(s)</span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {email.analysis.summary}
                      </p>

                      {email.analysis.keyMetrics?.revenue && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600">📈</span>
                          <span className="font-medium text-green-600">
                            ${email.analysis.keyMetrics.revenue?.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            NOI: ${email.analysis.keyMetrics.noi?.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          {emails.length} emails • {emails.filter(e => e.mode === 'live').length} live • {emails.filter(e => e.mode === 'demo').length} demo
        </div>
      </div>
    </div>
  );
}