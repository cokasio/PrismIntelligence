import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { 
  Inbox,
  DollarSign,
  Users,
  Wrench,
  Scale,
  Paperclip,
  AlertCircle
} from 'lucide-react'

export interface InboxItem {
  id: string
  category: 'financial' | 'tenant' | 'maintenance' | 'legal'
  title: string
  preview: string
  timestamp: Date
  priority: 'high' | 'medium' | 'low'
  hasAttachment?: boolean
  agent?: string
  status?: 'new' | 'processing' | 'analyzed' | 'completed'
}

interface CognitiveInboxProps {
  items: InboxItem[]
  selectedCategory: string
  selectedItem: InboxItem | null
  onCategorySelect: (category: string) => void
  onItemSelect: (item: InboxItem) => void
}

const categoryConfig = {
  financial: { icon: DollarSign, color: '#FFD700', label: 'Financial' },
  tenant: { icon: Users, color: '#4A90E2', label: 'Tenant' },
  maintenance: { icon: Wrench, color: '#7ED321', label: 'Maintenance' },
  legal: { icon: Scale, color: '#D0021B', label: 'Legal' }
}

export function CognitiveInbox({
  items,
  selectedCategory,
  selectedItem,
  onCategorySelect,
  onItemSelect
}: CognitiveInboxProps) {
  const categories = [
    { id: 'all', label: 'All Items', icon: Inbox, count: items.length },
    ...Object.entries(categoryConfig).map(([key, config]) => ({
      id: key,
      label: config.label,
      icon: config.icon,
      color: config.color,
      count: items.filter(item => item.category === key).length
    }))
  ]

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'animate-pulse bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <Inbox className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onCategorySelect(category.id)}
            >
              <category.icon 
                className="w-4 h-4 mr-2" 
                style={{ color: category.color }}
              />
              <span className="flex-1 text-left">{category.label}</span>
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold mb-3">Recent Items</h3>
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all",
                  selectedItem?.id === item.id && "bg-blue-50 border-blue-200 border"
                )}
                onClick={() => onItemSelect(item)}
              >
                <div className="flex items-start gap-2">
                  <div className="relative">
                    <div 
                      className={cn(
                        "w-2 h-2 rounded-full mt-1.5",
                        getPriorityIndicator(item.priority)
                      )}
                      style={{ 
                        backgroundColor: item.priority === 'high' ? undefined : categoryConfig[item.category].color,
                      }}
                    />
                    {item.status === 'processing' && (
                      <div 
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ backgroundColor: categoryConfig[item.category].color, opacity: 0.4 }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.priority === 'high' && (
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{item.preview}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.hasAttachment && <Paperclip className="w-3 h-3 text-gray-400" />}
                      {item.agent && (
                        <span className="text-xs text-blue-600">{item.agent}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
                {item.priority === 'high' && (
                  <div className="attention-ripple" />
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
