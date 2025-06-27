import React, { useState, useEffect } from 'react';
import OnboardingTour, { TourStep } from './OnboardingTour';

// Define tour steps for different pages
const getDashboardTourSteps = (): TourStep[] => [
  {
    title: 'Welcome to ERPEAMIL',
    content: 'This guided tour will help you navigate the main features of our Financial Analysis Platform.',
    target: '.tour-header',
    placement: 'bottom'
  },
  {
    title: 'Navigation Menu',
    content: 'Use this menu to access different sections of the platform.',
    target: 'nav',
    placement: 'bottom'
  },
  {
    title: 'Financial Dashboard',
    content: 'Here you can see your key financial metrics at a glance.',
    target: '.tour-dashboard',
    placement: 'bottom'
  },
  {
    title: 'AI Assistant',
    content: 'Our AI Assistant can help analyze your financial data and answer questions.',
    target: '.tour-ai-assistant',
    placement: 'left'
  },
  {
    title: 'User Settings',
    content: 'Customize your experience and manage your profile here.',
    target: '.tour-user-menu',
    placement: 'bottom'
  }
];

const getAIChatTourSteps = (): TourStep[] => [
  {
    title: 'AI Assistant',
    content: 'This is your AI financial analysis assistant. Ask questions or upload documents for analysis.',
    target: '.tour-chat',
    placement: 'top'
  },
  {
    title: 'Message Input',
    content: 'Type your questions here or drag and drop files to upload.',
    target: '.tour-input',
    placement: 'top'
  },
  {
    title: 'Voice Input',
    content: 'Click here to use voice commands instead of typing.',
    target: '.tour-voice',
    placement: 'top'
  },
  {
    title: 'Analysis Results',
    content: 'View detailed analysis of your financial documents here.',
    target: '.tour-results',
    placement: 'left'
  }
];

interface UseTourProps {
  tourId: string;
  page: 'dashboard' | 'chat';
}

export const useTour = ({ tourId, page }: UseTourProps) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  // Check if this tour has been completed before
  useEffect(() => {
    const completedTours = JSON.parse(localStorage.getItem('completedTours') || '{}');
    if (!completedTours[tourId]) {
      // Only auto-show on first visit
      const firstVisit = !localStorage.getItem(`${tourId}_visited`);
      if (firstVisit) {
        localStorage.setItem(`${tourId}_visited`, 'true');
        // Delay showing the tour to ensure page is fully loaded
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [tourId]);
  
  const closeTour = () => {
    setIsTourOpen(false);
  };
  
  const completeTour = () => {
    const completedTours = JSON.parse(localStorage.getItem('completedTours') || '{}');
    completedTours[tourId] = true;
    localStorage.setItem('completedTours', JSON.stringify(completedTours));
  };
  
  const startTour = () => {
    setIsTourOpen(true);
  };
  
  const resetTour = () => {
    const completedTours = JSON.parse(localStorage.getItem('completedTours') || '{}');
    delete completedTours[tourId];
    localStorage.setItem('completedTours', JSON.stringify(completedTours));
    localStorage.removeItem(`${tourId}_visited`);
  };
  
  const steps = page === 'dashboard' ? getDashboardTourSteps() : getAIChatTourSteps();
  
  const TourComponent = () => (
    <OnboardingTour
      steps={steps}
      isOpen={isTourOpen}
      onClose={closeTour}
      onComplete={completeTour}
    />
  );
  
  return {
    TourComponent,
    startTour,
    closeTour,
    resetTour,
    isTourActive: isTourOpen
  };
};

export default useTour;