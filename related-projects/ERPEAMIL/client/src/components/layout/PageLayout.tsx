import React from 'react';
import AppNavigation from '@/components/navigation';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* The AppNavigation is now included in the App component,
          but we could optionally include it here if we wanted
          different navigation per layout */}
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-white border-t border-[#E9ECEF] py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-[#6C757D] text-sm">
          <p>© 2025 ERPEAMIL Financial Analysis Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;