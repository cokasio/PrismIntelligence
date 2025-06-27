import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: number;
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
}

interface FinancialChatAssistantProps {
  className?: string;
  height?: string | number;
  onAnalysisComplete?: (result: any) => void;
}

const FinancialChatAssistant: React.FC<FinancialChatAssistantProps> = ({ 
  className = '',
  height = '400px',
  onAnalysisComplete
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: 'bot', 
      content: 'Hi there! I can help analyze your financial documents and provide insights. Upload files or ask a question to begin.', 
      timestamp: new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate bot response after delay
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        role: 'bot',
        content: generateResponse(inputValue),
        timestamp: new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };
  
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Just handle the first file for simplicity
    setUploadedFiles(prev => [...prev, file.name]);
    
    // Add system message for file upload
    const systemMessage: Message = {
      id: messages.length + 1,
      role: 'system',
      content: `File uploaded: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
    };
    
    setMessages(prev => [...prev, systemMessage]);
    setIsTyping(true);
    
    // Simulate processing and response
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        role: 'bot',
        content: `I've received your file "${file.name}". I'll analyze this ${detectFileType(file.name)} and provide insights shortly.`,
        timestamp: new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Simulate analysis results after another delay
      if (file.name.toLowerCase().includes('income') || file.name.toLowerCase().includes('balance') || 
          file.name.toLowerCase().includes('statement') || file.name.toLowerCase().includes('financial')) {
        setTimeout(() => {
          const analysisResult = generateAnalysisResult(file.name);
          const analysisMessage: Message = {
            id: messages.length + 3,
            role: 'bot',
            content: analysisResult,
            timestamp: new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
          };
          
          setMessages(prev => [...prev, analysisMessage]);
          
          if (onAnalysisComplete) {
            onAnalysisComplete({
              fileName: file.name,
              analysisText: analysisResult,
              timestamp: new Date().toISOString()
            });
          }
        }, 3000);
      }
    }, 1500);
  };
  
  const toggleVoiceInput = () => {
    setIsVoiceActive(!isVoiceActive);
    
    // Simulate voice recording and processing
    if (!isVoiceActive) {
      setTimeout(() => {
        setIsVoiceActive(false);
        setInputValue("What's our profit margin trend for Q2?");
      }, 3000);
    }
  };
  
  const generateResponse = (message: string): string => {
    // In a real implementation, this would call an API
    if (message.toLowerCase().includes('balance sheet')) {
      return 'I can help analyze your balance sheet. Please upload your file or let me know what specific aspects you\'d like to examine, such as asset allocation, debt-to-equity ratio, or working capital.';
    } else if (message.toLowerCase().includes('ratio') || message.toLowerCase().includes('margin')) {
      return 'Based on your Q2 financial data, your profit margin is 23.4%, which is 4.7% higher than the industry average. This shows strong pricing power and operational efficiency. Would you like to see a breakdown by product line?';
    } else if (message.toLowerCase().includes('cost')) {
      return 'To identify cost-cutting opportunities, I\'ll need to analyze your expense breakdown. Would you like to upload your income statement or expense report for analysis?';
    } else if (message.toLowerCase().includes('forecast') || message.toLowerCase().includes('growth')) {
      return 'Revenue forecasting requires historical data and growth assumptions. I can help create a forecast model based on past performance and market conditions. Would you like to start with a simple trend analysis or a more detailed forecast?';
    } else {
      return 'I understand you\'re interested in financial analysis. Could you provide more details about your specific needs or upload relevant financial documents for me to analyze?';
    }
  };
  
  const generateAnalysisResult = (filename: string): string => {
    if (filename.toLowerCase().includes('income')) {
      return 'Based on my analysis of your income statement:\n\n• Revenue: $2.4M (+8.2% vs last month)\n• Operating Income: $1.8M (+12.5%)\n• Net Profit Margin: 23.4% (industry avg: 18.7%)\n• Top Revenue Source: Product A (42% of total)\n\nWould you like me to identify growth opportunities or cost-saving measures?';
    } else if (filename.toLowerCase().includes('balance')) {
      return 'Based on my analysis of your balance sheet:\n\n• Total Assets: $5.8M (+3.1% vs last quarter)\n• Debt-to-Equity: 0.42 (healthy range)\n• Current Ratio: 2.1 (good liquidity)\n• Cash Position: $1.2M (20.7% of assets)\n\nWould you like me to suggest optimization strategies for your capital structure?';
    } else {
      return 'I\'ve analyzed your financial document and found:\n\n• Overall financial health score: 82/100\n• Strengths: Strong liquidity, growing revenue\n• Areas for improvement: Accounts receivable turnover\n• Key recommendation: Consider revising collection policies\n\nWould you like a more detailed breakdown of any of these areas?';
    }
  };
  
  const detectFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    switch(extension) {
      case 'xlsx':
      case 'xls':
        return 'spreadsheet';
      case 'csv':
        return 'CSV file';
      case 'pdf':
        return 'PDF document';
      case 'docx':
      case 'doc':
        return 'document';
      case 'txt':
        return 'text file';
      case 'json':
        return 'data file';
      default:
        return 'file';
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Message animations
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  // Typing indicator animations
  const typingVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  return (
    <div 
      className={`flex flex-col bg-white rounded-xl overflow-hidden border border-[#E9ECEF] shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`} 
      style={{ height: height }}
    >
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-[#F8F9FA] p-3 pb-1">
        <div className="space-y-2.5">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div 
                key={message.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${message.role === 'system' ? 'justify-center' : ''}`}
              >
                {message.role === 'bot' && (
                  <div className="h-5 w-5 rounded bg-[#FF1B6B] flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-[0_2px_4px_rgba(255,27,107,0.25)]">
                    <span className="text-white font-medium text-[10px]">AI</span>
                  </div>
                )}
                
                <div 
                  className={`rounded-lg p-2 max-w-[85%] ${
                    message.role === 'user' 
                      ? 'bg-[#1B2951] text-white shadow-md' 
                      : message.role === 'system'
                        ? 'bg-[#E9ECEF] text-[#6C757D] text-xs px-2 py-0.5 rounded-full'
                        : 'bg-white border border-[#E9ECEF] shadow-sm hover:shadow-md transition-shadow duration-300'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-[#E9ECEF]' : 'text-[#6C757D]'}`}>
                    {message.timestamp}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                className="flex justify-start"
                variants={typingVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="h-5 w-5 rounded bg-[#FF1B6B] flex items-center justify-center mr-2 flex-shrink-0 shadow-[0_2px_4px_rgba(255,27,107,0.25)]">
                  <span className="text-white font-medium text-[10px]">AI</span>
                </div>
                <div className="bg-white border border-[#E9ECEF] rounded-lg p-2 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="h-1.5 w-1.5 bg-[#6C757D] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="h-1.5 w-1.5 bg-[#6C757D] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="h-1.5 w-1.5 bg-[#6C757D] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-white border-t border-[#E9ECEF] p-2">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-center tour-input"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <motion.button
            type="button"
            onClick={toggleVoiceInput}
            className="tour-voice"
            whileTap={{ scale: 0.9 }}
            className={`p-1.5 mr-1.5 rounded transition-all duration-300 ${
              isVoiceActive 
                ? 'bg-[#FF1B6B] text-white shadow-[0_2px_8px_rgba(255,27,107,0.3)]' 
                : 'text-[#6C757D] hover:bg-[#F8F9FA]'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </motion.button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isDragging ? "Drop file to upload..." : "Ask a question or drag & drop files here..."}
              className={`w-full px-3 py-1.5 border rounded text-sm ${
                isDragging 
                  ? 'border-[#FF1B6B] bg-[#FF1B6B]/5'
                  : isVoiceActive
                    ? 'border-[#FF1B6B] bg-[#FF1B6B]/5'
                    : 'border-[#E9ECEF] focus:border-[#FF1B6B] focus:ring-1 focus:ring-[#FF1B6B]'
              } outline-none transition-all duration-300`}
            />
            
            {isVoiceActive && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  className="w-2 h-2 rounded-full bg-[#FF1B6B]"
                />
              </div>
            )}
            
            <motion.button 
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#1B2951] p-1 rounded-full transition-colors duration-300"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleFileUpload(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
            </motion.button>
          </div>
          
          <motion.button
            type="submit"
            disabled={!inputValue.trim()}
            whileHover={inputValue.trim() ? { scale: 1.05, y: -2 } : {}}
            whileTap={inputValue.trim() ? { scale: 0.95 } : {}}
            className={`ml-1.5 p-1.5 rounded transition-all duration-300 ${
              inputValue.trim() 
                ? 'bg-[#FF1B6B] text-white hover:bg-[#FF4757] shadow-[0_4px_16px_rgba(255,27,107,0.3)] hover:shadow-[0_6px_20px_rgba(255,27,107,0.4)]' 
                : 'bg-[#E9ECEF] text-[#6C757D] cursor-not-allowed'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        </form>
        
        <div className="mt-0.5 flex justify-between items-center px-1">
          <div className="text-[10px] text-[#6C757D]">
            {uploadedFiles.length > 0 ? (
              <span>
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
              </span>
            ) : (
              <span>Drag & drop files to upload</span>
            )}
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center text-[10px] text-[#6C757D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#28A745] mr-1 animate-pulse"></span>
              AI ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialChatAssistant;