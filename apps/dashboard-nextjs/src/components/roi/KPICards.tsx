'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  DollarSign, 
  Building,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIData {
  timeSavedHours: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'neutral';
  };
  tasksCompleted: {
    completed: number;
    total: number;
    percentage: number;
    trend: 'up' | 'down' | 'neutral';
  };
  valueIdentified: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'neutral';
    sparklineData?: number[];
  };
  activeProperties: {
    count: number;
    withTasks: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

interface KPICardsProps {
  className?: string;
  refreshTrigger?: number;
}

export function KPICards({ className, refreshTrigger }: KPICardsProps) {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchKPIData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/roi/kpis');
      if (!response.ok) throw new Error('Failed to fetch KPI data');
      
      const kpiData: KPIData = await response.json();
      setData(kpiData);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      // Fallback to mock data for demonstration
      setData({
        timeSavedHours: {
          current: 24.5,
          previous: 18.2,
          trend: 'up',
        },
        tasksCompleted: {
          completed: 12,
          total: 18,
          percentage: 67,
          trend: 'up',
        },
        valueIdentified: {
          current: 15750,
          previous: 12300,
          trend: 'up',
          sparklineData: [8000, 9500, 11200, 10800, 13400, 15750],
        },
        activeProperties: {
          count: 8,
          withTasks: 6,
          trend: 'neutral',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIData();
  }, [refreshTrigger]);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      case 'neutral':
        return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {/* Time Saved This Month */}
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.timeSavedHours.current}h</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getTrendIcon(data.timeSavedHours.trend)}
            <span className={getTrendColor(data.timeSavedHours.trend)}>
              {formatPercentageChange(data.timeSavedHours.current, data.timeSavedHours.previous)}%
            </span>
            <span>from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Completed */}
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.tasksCompleted.completed} of {data.tasksCompleted.total}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {data.tasksCompleted.percentage}%
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(data.tasksCompleted.trend)}
              <span className={getTrendColor(data.tasksCompleted.trend)}>
                This month
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Value Identified */}
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Value Identified</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(data.valueIdentified.current)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getTrendIcon(data.valueIdentified.trend)}
            <span className={getTrendColor(data.valueIdentified.trend)}>
              {formatPercentageChange(data.valueIdentified.current, data.valueIdentified.previous)}%
            </span>
            <span>potential savings</span>
          </div>
          {/* Simple sparkline could go here */}
          {data.valueIdentified.sparklineData && (
            <div className="mt-2 h-8 flex items-end gap-1">
              {data.valueIdentified.sparklineData.map((value, i) => {
                const maxValue = Math.max(...data.valueIdentified.sparklineData!);
                const height = (value / maxValue) * 100;
                return (
                  <div
                    key={i}
                    className="bg-green-200 rounded-sm flex-1"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Properties */}
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeProperties.count}</div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {data.activeProperties.withTasks} with tasks
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(data.activeProperties.trend)}
              <span className={getTrendColor(data.activeProperties.trend)}>
                Properties
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
