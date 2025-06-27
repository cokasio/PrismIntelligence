import React, { useState } from 'react';
import FinancialChatAssistant from '@/components/ai-chat/FinancialChatAssistant';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Download, Settings, BarChart2, TrendingUp, ChevronRight, HelpCircle } from 'lucide-react';
import { useTour } from '@/components/onboarding';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';

interface ChatDemoProps {
  title?: string;
}

const ChatDemo: React.FC<ChatDemoProps> = ({ 
  title = "Financial Analysis Assistant" 
}) => {
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('chat');
  const { trackEvent } = useAnalytics();
  
  // Set up guided tour
  const { TourComponent, startTour } = useTour({
    tourId: 'financial-chat-tour',
    page: 'chat'
  });
  
  // Set up keyboard shortcuts
  const shortcuts = [
    {
      key: '1',
      ctrlKey: true,
      description: 'Switch to Chat tab',
      handler: () => {
        setActiveTab('chat');
        trackEvent({
          name: 'feature_used',
          properties: { feature: 'keyboard_shortcut', action: 'switch_tab_chat' }
        });
      }
    },
    {
      key: '2',
      ctrlKey: true,
      description: 'Switch to Results tab',
      handler: () => {
        setActiveTab('results');
        trackEvent({
          name: 'feature_used',
          properties: { feature: 'keyboard_shortcut', action: 'switch_tab_results' }
        });
      }
    },
    {
      key: 'h',
      ctrlKey: true,
      description: 'Start guided tour',
      handler: () => {
        startTour();
        trackEvent({
          name: 'feature_used',
          properties: { feature: 'guided_tour', action: 'start_tour' }
        });
      }
    }
  ];
  
  const { KeyboardShortcutsHelp } = useKeyboardShortcuts(shortcuts);

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResults(prev => [...prev, result]);
    // Auto-switch to results tab when a new analysis is complete
    setActiveTab('results');
    
    // Track the analysis completion event
    trackEvent({
      name: 'analysis_completed',
      properties: { 
        fileName: result.fileName,
        fileType: result.fileName.split('.').pop(),
        analysisLength: result.analysisText.length
      }
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="p-4 md:p-6">
      <motion.div 
        className="max-w-screen-lg mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="mb-6 flex justify-between items-center" variants={itemVariants}>
          <div>
            <h1 className="text-2xl font-semibold text-[#1B2951] dark:text-white mb-2">{title}</h1>
            <p className="text-[#6C757D] dark:text-[#E9ECEF]">Upload financial documents or ask questions to get AI-powered insights</p>
          </div>
          <button 
            onClick={startTour}
            className="p-2 rounded-md text-[#6C757D] dark:text-[#E9ECEF] hover:bg-[#F8F9FA] dark:hover:bg-[#2A3B5C] hover:text-[#1B2951] dark:hover:text-white flex items-center"
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Take Tour</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div className="md:col-span-2" variants={itemVariants}>
            <Tabs 
              defaultValue="chat" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="bg-white dark:bg-[#1B2951] rounded-xl shadow-sm border border-[#E9ECEF] dark:border-[#2A3B5C] p-4 tour-chat"
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="chat" className="flex items-center justify-center">
                  <Info className="w-4 h-4 mr-2" />
                  Chat Assistant
                </TabsTrigger>
                <TabsTrigger value="results" className="flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Analysis Results
                  {analysisResults.length > 0 && (
                    <span className="ml-2 w-5 h-5 bg-[#FF1B6B] text-white text-xs flex items-center justify-center rounded-full">
                      {analysisResults.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="m-0">
                <FinancialChatAssistant 
                  height="500px"
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </TabsContent>
              
              <TabsContent value="results" className="m-0">
                {analysisResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F8F9FA] flex items-center justify-center mb-3">
                      <BarChart2 className="w-8 h-8 text-[#6C757D]" />
                    </div>
                    <p className="text-[#6C757D] mb-4">Upload a document in the chat to see analysis results</p>
                    <button 
                      onClick={() => setActiveTab('chat')} 
                      className="text-[#FF1B6B] hover:underline flex items-center"
                    >
                      Go to chat
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {analysisResults.map((result, index) => (
                      <motion.div 
                        key={index} 
                        className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF]"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-[#FF1B6B] flex items-center justify-center mr-2">
                            <BarChart2 className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-[#1B2951]">{result.fileName}</h3>
                            <p className="text-xs text-[#6C757D]">
                              Analyzed {new Date(result.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <button className="p-1 rounded-full hover:bg-white">
                            <Download className="w-4 h-4 text-[#6C757D]" />
                          </button>
                        </div>
                        <div className="pl-10">
                          <div className="p-2 bg-white rounded border border-[#E9ECEF] text-sm">
                            <strong>Key Metrics:</strong>
                            {result.analysisText.includes('Revenue') && (
                              <div className="mt-1 flex justify-between">
                                <span>Revenue</span>
                                <span className="font-medium">$2.4M <span className="text-[#28A745]">(+8.2%)</span></span>
                              </div>
                            )}
                            {result.analysisText.includes('Operating Income') && (
                              <div className="mt-1 flex justify-between">
                                <span>Operating Income</span>
                                <span className="font-medium">$1.8M <span className="text-[#28A745]">(+12.5%)</span></span>
                              </div>
                            )}
                            {result.analysisText.includes('Net Profit Margin') && (
                              <div className="mt-1 flex justify-between">
                                <span>Net Profit Margin</span>
                                <span className="font-medium">23.4%</span>
                              </div>
                            )}
                            {result.analysisText.includes('financial health score') && (
                              <div className="mt-1 flex justify-between">
                                <span>Health Score</span>
                                <span className="font-medium">82/100</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          <motion.div className="md:col-span-1" variants={itemVariants}>
            <div className="bg-white dark:bg-[#1B2951] rounded-xl shadow-sm border border-[#E9ECEF] dark:border-[#2A3B5C] p-4 h-full tour-results">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-[#1B2951]">Quick Tools</h2>
                <button className="text-[#6C757D] hover:text-[#1B2951] p-1 rounded-full hover:bg-[#F8F9FA]">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E9ECEF] hover:bg-[#F8F9FA] transition duration-150 text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#1B2951]">Revenue Forecast</h3>
                      <p className="text-xs text-[#6C757D]">Predict future earnings</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6C757D]" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E9ECEF] hover:bg-[#F8F9FA] transition duration-150 text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <BarChart2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#1B2951]">Ratio Calculator</h3>
                      <p className="text-xs text-[#6C757D]">Financial health metrics</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6C757D]" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E9ECEF] hover:bg-[#F8F9FA] transition duration-150 text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Download className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#1B2951]">Export Reports</h3>
                      <p className="text-xs text-[#6C757D]">PDF, Excel, CSV formats</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6C757D]" />
                </button>
              </div>
              
              <div className="mt-6">
                <div className="p-4 bg-[#1B2951] rounded-lg text-white">
                  <h3 className="font-medium mb-2">Pro Tip</h3>
                  <p className="text-sm text-white/80 mb-3">Try asking the AI assistant specific questions about your financial data for deeper insights.</p>
                  <button className="text-xs flex items-center text-white/90 hover:text-white">
                    Learn more tips
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Include the guided tour */}
      <TourComponent />
      
      {/* Include keyboard shortcuts help */}
      <KeyboardShortcutsHelp />
    </div>
  );
};

export default ChatDemo;