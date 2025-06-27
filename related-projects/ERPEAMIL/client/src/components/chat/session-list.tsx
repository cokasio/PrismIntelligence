import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChatSession } from '@shared/schema';

interface SessionListProps {
  sessions: ChatSession[];
  currentSessionId?: number;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
  projectId?: number | null;
}

export function SessionList({ 
  currentSessionId, 
  onSessionSelect, 
  onNewSession,
  projectId 
}: SessionListProps) {
  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['/api/sessions', projectId],
    refetchInterval: 5000,
  });

  const filteredSessions = projectId 
    ? sessions.filter(s => s.projectId === projectId)
    : sessions;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Sessions</h3>
          <button
            onClick={onNewSession}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            New Analysis
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search sessions..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No sessions yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first analysis session</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSessionSelect(session)}
                className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {session.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        session.status === 'active' ? 'bg-green-100 text-green-800' : 
                        session.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}