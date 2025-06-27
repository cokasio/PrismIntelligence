import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define event types for our analytics
export type EventName = 
  | 'page_view'
  | 'feature_used'
  | 'file_upload'
  | 'analysis_completed'
  | 'chat_message_sent'
  | 'error_occurred'
  | 'user_preference_changed'
  | 'tour_completed'
  | 'session_created';

export interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (path: string, title?: string) => void;
  isEnabled: boolean;
  enableAnalytics: () => void;
  disableAnalytics: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// This would normally connect to a real analytics service
const sendToAnalyticsService = (event: AnalyticsEvent) => {
  // In a real application, this would send data to your analytics provider
  // For this demo, we'll just log to console
  console.log('Analytics event:', event);
  
  // Mock sending to a service
  return Promise.resolve({ success: true });
};

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  
  // Check user's analytics preference on mount
  useEffect(() => {
    const analyticsEnabled = localStorage.getItem('analyticsEnabled');
    setIsEnabled(analyticsEnabled === 'true');
  }, []);
  
  // Track page views automatically
  useEffect(() => {
    if (!isEnabled) return;
    
    const handleRouteChange = () => {
      trackPageView(window.location.pathname);
    };
    
    // Track initial page view
    trackPageView(window.location.pathname);
    
    // Set up listener for history changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isEnabled]);
  
  const trackEvent = (event: AnalyticsEvent) => {
    if (!isEnabled) return;
    
    const enhancedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      properties: {
        ...event.properties,
        url: window.location.href,
        referrer: document.referrer,
        // Add any other global properties here
      }
    };
    
    sendToAnalyticsService(enhancedEvent);
  };
  
  const trackPageView = (path: string, title?: string) => {
    trackEvent({
      name: 'page_view',
      properties: {
        path,
        title: title || document.title
      }
    });
  };
  
  const enableAnalytics = () => {
    localStorage.setItem('analyticsEnabled', 'true');
    setIsEnabled(true);
    
    // Track initial page view when enabled
    trackPageView(window.location.pathname);
  };
  
  const disableAnalytics = () => {
    localStorage.setItem('analyticsEnabled', 'false');
    setIsEnabled(false);
  };
  
  return (
    <AnalyticsContext.Provider
      value={{
        trackEvent,
        trackPageView,
        isEnabled,
        enableAnalytics,
        disableAnalytics
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  
  return context;
};

export default AnalyticsProvider;