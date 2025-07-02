'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X, 
  FileText,
  Brain,
  List,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadProgressProps {
  fileName: string;
  progress: number;
  stage: 'uploading' | 'analyzing' | 'generating' | 'complete' | 'error';
  estimatedTime?: number;
  onCancel?: () => void;
  error?: string;
  className?: string;
}

const STAGES = {
  uploading: {
    label: 'Uploading',
    description: 'Transferring your document...',
    icon: FileText,
    color: 'text-blue-600',
    progressRange: [0, 30],
  },
  analyzing: {
    label: 'Analyzing with AI',
    description: 'Claude is reading and understanding your document...',
    icon: Brain,
    color: 'text-purple-600',
    progressRange: [30, 80],
  },
  generating: {
    label: 'Generating Tasks',
    description: 'Creating actionable tasks from insights...',
    icon: List,
    color: 'text-green-600',
    progressRange: [80, 95],
  },
  complete: {
    label: 'Complete',
    description: 'Analysis complete and tasks generated!',
    icon: CheckCircle,
    color: 'text-green-600',
    progressRange: [100, 100],
  },
  error: {
    label: 'Error',
    description: 'Something went wrong during processing',
    icon: AlertCircle,
    color: 'text-red-600',
    progressRange: [0, 0],
  },
};

export function UploadProgress({ 
  fileName, 
  progress, 
  stage, 
  estimatedTime,
  onCancel,
  error,
  className 
}: UploadProgressProps) {
  const stageInfo = STAGES[stage];
  const Icon = stageInfo.icon;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${Math.ceil(secs)}s`;
  };

  const getProgressColor = () => {
    if (stage === 'error') return 'bg-red-500';
    if (stage === 'complete') return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className={cn('h-5 w-5', stageInfo.color)} />
            Processing Document
          </CardTitle>
          {onCancel && stage !== 'complete' && stage !== 'error' && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* File Name */}
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium truncate">{fileName}</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-3"
            // Custom styling for different stages
            style={{
              '--progress-bg': getProgressColor(),
            } as React.CSSProperties}
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{progress}% Complete</span>
            {estimatedTime && stage !== 'complete' && stage !== 'error' && (
              <span className="text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(estimatedTime)} remaining
              </span>
            )}
          </div>
        </div>

        {/* Current Stage */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            stage === 'error' ? 'bg-red-100' : 
            stage === 'complete' ? 'bg-green-100' : 'bg-blue-100'
          )}>
            <Icon className={cn('h-4 w-4', stageInfo.color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{stageInfo.label}</span>
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  stage === 'error' ? 'border-red-200 text-red-700' :
                  stage === 'complete' ? 'border-green-200 text-green-700' :
                  'border-blue-200 text-blue-700'
                )}
              >
                {stage === 'complete' ? 'Done' : 'In Progress'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {error || stageInfo.description}
            </p>
          </div>
        </div>

        {/* Stage Timeline */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 mb-2">Processing Stages</div>
          <div className="space-y-1">
            {Object.entries(STAGES).map(([key, info]) => {
              if (key === 'error') return null; // Don't show error in timeline
              
              const isActive = key === stage;
              const isCompleted = ['uploading', 'analyzing', 'generating'].indexOf(key) < 
                                ['uploading', 'analyzing', 'generating'].indexOf(stage) ||
                                stage === 'complete';
              
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isCompleted ? 'bg-green-500' :
                    isActive ? 'bg-blue-500 animate-pulse' :
                    'bg-gray-300'
                  )} />
                  <span className={cn(
                    'text-xs',
                    isActive ? 'font-medium text-gray-900' :
                    isCompleted ? 'text-green-600' :
                    'text-gray-500'
                  )}>
                    {info.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {stage === 'complete' && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              View Results
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <List className="h-4 w-4 mr-2" />
              View Tasks
            </Button>
          </div>
        )}

        {stage === 'error' && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              Try Again
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
