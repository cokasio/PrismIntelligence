'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Circle,
  ExternalLink,
  Edit3,
  Save,
  X,
  Star,
  MessageSquare
} from 'lucide-react';
import { Task, CompleteTaskRequest } from '@/types/tasks';
import { cn } from '@/lib/utils';

interface TaskDetailProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onTaskUpdate: () => void;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
};

const PRIORITY_COLORS = {
  1: 'text-gray-600',
  2: 'text-blue-600',
  3: 'text-yellow-600',
  4: 'text-orange-600',
  5: 'text-red-600',
};

export function TaskDetail({ task, open, onClose, onTaskUpdate }: TaskDetailProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Completion form state
  const [completionData, setCompletionData] = useState<CompleteTaskRequest>({
    completion_notes: '',
    actual_hours: task.estimated_hours || 1,
    actual_value: task.potential_value,
    success_rating: 4,
  });

  const handleCompleteTask = async () => {
    if (!completionData.completion_notes.trim()) {
      alert('Please provide completion notes');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completionData),
      });

      if (!response.ok) throw new Error('Failed to complete task');
      
      onTaskUpdate();
      setIsCompleting(false);
      onClose();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (task.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (task.is_overdue) {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
    if (task.status === 'in_progress') {
      return <Clock className="h-5 w-5 text-blue-600" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilDue = () => {
    const now = new Date();
    const dueDate = new Date(task.due_date);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {getStatusIcon()}
            <div className="flex-1">
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {task.properties?.name && (
                  <span className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {task.properties.name}
                  </span>
                )}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge 
                variant="outline" 
                className={STATUS_COLORS[task.status]}
              >
                {task.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline" className={`text-${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]} border-current`}>
                Priority {task.priority}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Task Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Description</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm leading-relaxed">{task.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">Assigned Role</Label>
                        <div className="mt-1">
                          <Badge variant="outline">{task.assigned_role}</Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-600">Status</Label>
                        <div className="mt-1">
                          <Badge className={STATUS_COLORS[task.status]}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Due Date</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(task.due_date)}</span>
                        <Badge variant="outline" className={task.is_overdue ? 'text-red-600' : 'text-gray-600'}>
                          {getDaysUntilDue()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {task.notes && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-blue-50 rounded-md">
                        <p className="text-sm leading-relaxed">{task.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Metrics & Value</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-1" />
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(task.potential_value)}
                        </div>
                        <div className="text-xs text-gray-600">Potential Value</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-semibold text-blue-600">
                          {task.estimated_hours}h
                        </div>
                        <div className="text-xs text-gray-600">Est. Time</div>
                      </div>
                    </div>

                    {task.actual_hours && (
                      <div className="pt-2 border-t">
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-semibold text-purple-600">
                            {task.actual_hours}h
                          </div>
                          <div className="text-xs text-gray-600">Actual Time</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Created:</span>
                      <span>{formatDate(task.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600">Due:</span>
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                    {task.completed_at && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Completed:</span>
                        <span>{formatDate(task.completed_at)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="source" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Source Insight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm leading-relaxed">{task.source_insight}</p>
                  </div>
                  
                  {task.reports && (
                    <div>
                      <Label className="text-sm font-semibold">Source Document</Label>
                      <div className="mt-2 flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium">{task.reports.title}</div>
                            {task.reports.document_name && (
                              <div className="text-sm text-gray-600">{task.reports.document_name}</div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {task.insights && (
                    <div>
                      <Label className="text-sm font-semibold">Related Insight</Label>
                      <div className="mt-2 p-3 border rounded-lg">
                        <div className="font-medium">{task.insights.title}</div>
                        {task.insights.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.insights.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Task created</div>
                      <div className="text-xs text-gray-600">{formatDate(task.created_at)}</div>
                    </div>
                  </div>
                  
                  {task.status === 'completed' && task.completed_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Task completed</div>
                        <div className="text-xs text-gray-600">{formatDate(task.completed_at)}</div>
                        {task.completed_by && (
                          <div className="text-xs text-gray-600">by {task.completed_by}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                {task.task_outcomes && task.task_outcomes.length > 0 ? (
                  <div className="space-y-4">
                    {task.task_outcomes.map((outcome) => (
                      <div key={outcome.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                              Rating: {outcome.success_rating}/5
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(outcome.created_at)}
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed mb-2">
                          {outcome.outcome_description}
                        </p>
                        {outcome.actual_value_realized && (
                          <div className="text-sm text-green-600 font-medium">
                            Value Realized: {formatCurrency(outcome.actual_value_realized)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No outcomes recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          {task.status !== 'completed' && (
            <Button onClick={() => setIsCompleting(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Task
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Task
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Complete Task Dialog */}
      <Dialog open={isCompleting} onOpenChange={setIsCompleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Provide completion details for "{task.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="completion_notes">Completion Notes *</Label>
              <Textarea
                id="completion_notes"
                placeholder="Describe what was accomplished..."
                value={completionData.completion_notes}
                onChange={(e) => setCompletionData({
                  ...completionData,
                  completion_notes: e.target.value
                })}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="actual_hours">Actual Hours</Label>
                <Input
                  id="actual_hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={completionData.actual_hours}
                  onChange={(e) => setCompletionData({
                    ...completionData,
                    actual_hours: parseFloat(e.target.value) || 0
                  })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="actual_value">Actual Value ($)</Label>
                <Input
                  id="actual_value"
                  type="number"
                  min="0"
                  value={completionData.actual_value}
                  onChange={(e) => setCompletionData({
                    ...completionData,
                    actual_value: parseFloat(e.target.value) || 0
                  })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="success_rating">Success Rating</Label>
              <Select
                value={completionData.success_rating?.toString()}
                onValueChange={(value) => setCompletionData({
                  ...completionData,
                  success_rating: parseInt(value)
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Fair</SelectItem>
                  <SelectItem value="3">3 - Good</SelectItem>
                  <SelectItem value="4">4 - Very Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompleting(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteTask}
              disabled={loading || !completionData.completion_notes.trim()}
            >
              {loading ? 'Completing...' : 'Complete Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
