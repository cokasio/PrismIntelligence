import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Upload, Mail, Clock, Plus, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatedCard } from '@/components/ui/animated-card';
import { ChatSession } from '@shared/schema';

interface ChatHistoryProps {
  onSessionSelect: (session: ChatSession) => void;
  currentSessionId?: number;
  isVisible: boolean;
  isLocked?: boolean;
  onNewSession: () => void;
  onClose?: () => void;
  onHover?: (isHovering: boolean) => void;
  projectId?: number | null;
}

export function ChatHistory({ onSessionSelect, currentSessionId, isVisible, isLocked, onNewSession, onClose, onHover }: ChatHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: sessions = [], isLoading } = useQuery<ChatSession[]>({
    queryKey: ['/api/sessions'],
    refetchInterval: 5000,
  });

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Hover trigger area - invisible strip on the left edge */}
      <div 
        className="fixed left-0 top-0 w-2 h-full z-30"
        onMouseEnter={() => onHover?.(true)}
      />
      
      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-background/95 backdrop-blur-md border-r border-border/20 shadow-2xl
          transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-x-0' : '-translate-x-full'}
          ${isLocked ? 'border-primary/30' : ''}
        `}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
      >
      <div className="h-full flex flex-col p-4 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Analysis Sessions</h2>
            {isLocked && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground p-1 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button 
            onClick={onNewSession}
            className="w-full gradient-primary text-white shadow-button hover-lift"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 mb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-muted/50 border-border text-sm h-8"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-muted rounded-lg h-16 animate-pulse" />
                ))}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="feature-icon feature-icon-pink mx-auto mb-3 w-10 h-10">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium mb-1">
                  {searchTerm ? 'No sessions found' : 'No sessions yet'}
                </p>
                <p className="text-xs">
                  {searchTerm ? 'Try a different search term' : 'Create your first analysis session'}
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <AnimatedCard
                  key={session.id}
                  active={currentSessionId === session.id}
                  onClick={() => onSessionSelect(session)}
                  hover={true}
                  className="group transition-all duration-200 p-3"
                >
                  <div className="flex items-start space-x-2 mb-2">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                      session.source === 'email' ? 'feature-icon-blue' : 'feature-icon-pink'
                    }`}>
                      {session.source === 'email' ? (
                        <Mail className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <Upload className="h-3.5 w-3.5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-foreground truncate mb-1 group-hover:text-primary transition-colors leading-tight">
                        {session.title}
                      </h3>
                      <Badge className={`${getStatusColor(session.status)} text-xs px-1.5 py-0 text-[10px]`}>
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-2.5 w-2.5" />
                      <span className="truncate">
                        {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <span className="capitalize font-medium text-[9px]">{session.source}</span>
                  </div>
                </AnimatedCard>
              ))
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}