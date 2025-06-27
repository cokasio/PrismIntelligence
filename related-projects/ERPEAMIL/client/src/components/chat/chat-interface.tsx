import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Upload, Plus, FileText, TrendingUp, BarChart, Brain } from 'lucide-react';
import { Message } from './message';
import { FileUpload } from './file-upload';
import { useWebSocket } from '@/hooks/use-websocket';
import { ChatSession, ChatMessage as ChatMessageType } from '@shared/schema';

interface ChatInterfaceProps {
  session: ChatSession | null;
  onNewSession: () => void;
}

export function ChatInterface({ session, onNewSession }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<ChatMessageType[]>({
    queryKey: ['/api/sessions', session?.id, 'messages'],
    enabled: !!session?.id,
    refetchInterval: 2000,
  });

  const { isConnected, joinSession, sendChatMessage } = useWebSocket({
    onMessageReceived: () => {
      // Refetch messages will happen automatically due to refetchInterval
    },
  });

  useEffect(() => {
    if (session?.id && isConnected) {
      joinSession(session.id);
    }
  }, [session?.id, isConnected, joinSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !session?.id) return;

    sendChatMessage(session.id, message);
    setMessage('');
  };

  if (!session) {
    return (
      <div className="welcome-container">
        <h1 className="welcome-title">Welcome to Financial Analysis</h1>
        <p className="welcome-subtitle">
          Transform your financial data into actionable insights with our AI-powered multi-agent analysis platform.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon-container feature-icon-pink">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Analysis</h3>
            <p className="text-sm text-gray-600">Advanced metrics and trend analysis for comprehensive financial performance evaluation.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-container feature-icon-orange">
              <FileText className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Processing</h3>
            <p className="text-sm text-gray-600">Intelligent parsing of financial statements, balance sheets, and cash flow reports.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-container" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
              <BarChart className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Assessment</h3>
            <p className="text-sm text-gray-600">Multi-dimensional risk analysis with predictive modeling and scenario planning.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-container" style={{ background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)' }}>
              <Brain className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights</h3>
            <p className="text-sm text-gray-600">Multi-agent AI system providing intelligent recommendations and strategic insights.</p>
          </div>
        </div>

        <button 
          onClick={onNewSession}
          className="btn-primary flex items-center gap-3 text-lg px-8 py-4 mt-8"
        >
          <Plus size={24} />
          Start New Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Analysis</h3>
            <p className="text-gray-600 mb-6">Upload financial documents or start a conversation to begin your analysis.</p>
            <FileUpload sessionId={session.id} />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-container">
        {messages.length > 0 && (
          <div className="mb-4">
            <FileUpload sessionId={session.id} />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your financial data..."
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="btn-primary flex items-center gap-2"
          >
            <Send size={16} />
            Send
          </button>
        </form>

        {!isConnected && (
          <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
            Reconnecting to server...
          </div>
        )}
      </div>
    </div>
  );
}