'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CheckCircle, 
  FileText, 
  List, 
  Target,
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'analysis_completed' | 'task_created' | 'task_completed' | 'milestone_reached';
  title: string;
  description: string;
  value?: number;
  timestamp: string;
  metadata?: {
    propertyName?: string;
    documentName?: string;
    taskCount?: number;
    priority?: number;
  };
}

interface ActivityFeedProps {
  className?: string;
  refreshTrigger?: number;
  limit?: number;
}

export function ActivityFeed({ className, refreshTrigger, limit = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/roi/activity-feed?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch activity feed');
      
      const activityData: ActivityItem[] = await response.json();
      setActivities(activityData);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      // Fallback to mock data
      const mockData = generateMockActivities();
      setActivities(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockActivities = (): ActivityItem[] => {
    const now = new Date();
    const activities: ActivityItem[] = [
      {
        id: '1',
        type: 'analysis_completed',
        title: 'Document Analysis Complete',
        description: 'Financial report processed with 3 new insights identified',
        value: 8500,
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 min ago
        metadata: {
          propertyName: 'Sunset Plaza',
          documentName: 'Q4_Financial_Report.pdf',
          taskCount: 3,
        }
      },
      {
        id: '2',
        type: 'task_completed',
        title: 'Task Completed',
        description: 'Review maintenance budget variance resolved',
        value: 2300,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15 min ago
        metadata: {
          propertyName: 'Oak Ridge Apartments',
          priority: 4,
        }
      },
      {
        id: '3',
        type: 'milestone_reached',
        title: 'Monthly Goal Achieved',
        description: '20 hours saved this month - target exceeded!',
        value: 20,
        timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), // 45 min ago
        metadata: {}
      },
      {
        id: '4',
        type: 'task_created',
        title: 'New Tasks Generated',
        description: '5 tasks created from lease agreement analysis',
        timestamp: new Date(now.getTime() - 1.2 * 60 * 60 * 1000).toISOString(), // 1.2 hours ago
        metadata: {
          propertyName: 'Downtown Loft',
          documentName: 'Lease_Amendment_2025.pdf',
          taskCount: 5,
        }
      },
      {
        id: '5',
        type: 'analysis_completed',
        title: 'Expense Report Analyzed',
        description: 'Monthly expenses reviewed, 2 cost optimization opportunities found',
        value: 4200,
        timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 hours ago
        metadata: {
          propertyName: 'Maple Gardens',
          documentName: 'December_Expenses.xlsx',
          taskCount: 2,
        }
      },
      {
        id: '6',
        type: 'task_completed',
        title: 'Compliance Check Done',
        description: 'Annual inspection documentation updated',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        metadata: {
          propertyName: 'Pine Valley',
          priority: 5,
        }
      },
      {
        id: '7',
        type: 'analysis_completed',
        title: 'Tenant Survey Analysis',
        description: 'Satisfaction survey processed, improvement areas identified',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        metadata: {
          propertyName: 'Harbor View',
          documentName: 'Tenant_Survey_Results.pdf',
          taskCount: 4,
        }
      },
    ];

    return activities.slice(0, limit);
  };

  useEffect(() => {
    fetchActivities();
    
    // Set up WebSocket or polling for real-time updates
    const interval = setInterval(fetchActivities, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [refreshTrigger, limit]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'analysis_completed':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'task_created':
        return <List className="h-4 w-4 text-purple-600" />;
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'milestone_reached':
        return <Target className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadgeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'analysis_completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'task_created':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'task_completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'milestone_reached':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatValue = (type: ActivityItem['type'], value?: number) => {
    if (!value) return null;
    
    switch (type) {
      case 'analysis_completed':
      case 'task_completed':
        return `$${value.toLocaleString()}`;
      case 'milestone_reached':
        return `${value}h`;
      default:
        return null;
    }
  };

  const handleActivityClick = (activity: ActivityItem) => {
    // In a real app, this would navigate to the relevant page
    console.log('Clicked activity:', activity);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchActivities}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">
              Activities will appear here as you upload documents and complete tasks
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleActivityClick(activity)}
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {activity.description}
                      </p>
                      
                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="flex items-center gap-2 mt-2">
                          {activity.metadata.propertyName && (
                            <Badge variant="outline" className="text-xs">
                              {activity.metadata.propertyName}
                            </Badge>
                          )}
                          {activity.metadata.documentName && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {activity.metadata.documentName}
                            </span>
                          )}
                          {activity.metadata.taskCount && (
                            <span className="text-xs text-muted-foreground">
                              {activity.metadata.taskCount} task{activity.metadata.taskCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Value & Time */}
                    <div className="text-right flex-shrink-0">
                      {activity.value && (
                        <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                          {activity.type === 'milestone_reached' ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <DollarSign className="h-3 w-3" />
                          )}
                          {formatValue(activity.type, activity.value)}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* View More */}
            {activities.length >= limit && (
              <div className="text-center pt-4 border-t">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All Activity
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
