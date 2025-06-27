import { ChatMessage } from '@shared/schema';
import { format } from 'date-fns';
import { RectangleEllipsis, Upload, FileText, AlertCircle, Bot, User, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface MessageProps {
  message: ChatMessage;
}

export function Message({ message }: MessageProps) {
  const getMessageIcon = () => {
    switch (message.sender) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'income_analyst':
      case 'balance_analyst':
      case 'cashflow_analyst':
      case 'strategic_advisor':
        return <Bot className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getMessageColor = () => {
    switch (message.sender) {
      case 'user':
        return 'bg-blue-600';
      case 'system':
        return 'bg-gradient-to-r from-pink-accent/80 to-purple-500/80';
      case 'income_analyst':
        return 'bg-blue-600';
      case 'balance_analyst':
        return 'bg-purple-600';
      case 'cashflow_analyst':
        return 'bg-orange-500';
      case 'strategic_advisor':
        return 'bg-emerald-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getAgentInitials = () => {
    switch (message.sender) {
      case 'income_analyst':
        return 'IA';
      case 'balance_analyst':
        return 'BA';
      case 'cashflow_analyst':
        return 'CA';
      case 'strategic_advisor':
        return 'SA';
      default:
        return '';
    }
  };

  const getAgentDisplayName = () => {
    return message.metadata?.agentDisplayName || 
           message.sender.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isAgent = message.sender.includes('analyst') || message.sender === 'strategic_advisor';
  const isSystem = message.sender === 'system';
  const isUser = message.sender === 'user';

  return (
    <div className="flex items-start space-x-3 group">
      {/* Avatar */}
      <div className={`w-8 h-8 ${getMessageColor()} rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold`}>
        {isAgent ? getAgentInitials() : getMessageIcon()}
      </div>

      {/* Message Content */}
      <div className="flex-1 max-w-2xl">
        <Card className={`p-4 ${
          isSystem 
            ? 'bg-gradient-to-r from-pink-accent/20 to-purple-500/20 border-pink-accent/30' 
            : isAgent
            ? `${getMessageColor()}/20 border-${getMessageColor().replace('bg-', '')}/30`
            : 'bg-white/10 border-white/20'
        } rounded-2xl ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}>
          
          {/* Message Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {/* Source Badge */}
              {message.source && (
                <Badge variant="secondary" className={`text-xs font-medium ${
                  message.source === 'email' 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-pink-accent/20 text-pink-300'
                }`}>
                  {message.source === 'email' ? (
                    <>
                      <RectangleEllipsis className="w-3 h-3 mr-1" />
                      EMAIL
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3 mr-1" />
                      UPLOAD
                    </>
                  )}
                </Badge>
              )}

              {/* Agent Badge */}
              {isAgent && (
                <Badge variant="secondary" className={`text-xs font-medium ${getMessageColor()}/30 text-white`}>
                  {getAgentDisplayName().toUpperCase()}
                </Badge>
              )}

              {/* System Badge */}
              {isSystem && (
                <Badge variant="secondary" className="bg-pink-accent/30 text-pink-200 text-xs font-medium">
                  SYSTEM
                </Badge>
              )}
            </div>

            {/* Timestamp */}
            <span className="text-xs text-gray-400">
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>
          </div>

          {/* Message Text */}
          <div className="text-gray-100">
            {message.messageType === 'file' && message.metadata?.fileType && (
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">
                  {message.metadata.fileType.replace('_', ' ').toUpperCase()} processed
                </span>
              </div>
            )}

            <div className="whitespace-pre-wrap">
              {message.content}
            </div>

            {/* File Information */}
            {message.metadata?.summary && (
              <div className="mt-3 p-3 bg-black/20 rounded-lg">
                <p className="text-sm text-gray-300">{message.metadata.summary}</p>
              </div>
            )}

            {/* Analysis Metrics */}
            {message.messageType === 'analysis' && message.metadata?.model && (
              <div className="mt-3 text-xs text-gray-400">
                Powered by {message.metadata.model}
              </div>
            )}
          </div>
        </Card>

        {/* Processing Timestamp */}
        {message.metadata?.analysisTimestamp && (
          <span className="text-xs text-gray-500 ml-4">
            Analysis completed at {format(new Date(message.metadata.analysisTimestamp), 'HH:mm:ss')}
          </span>
        )}
      </div>
    </div>
  );
}
