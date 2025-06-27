import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronDown, BarChart2, MessageSquare, FileText, Settings, Bell, User, Menu as MenuIcon, HelpCircle, Keyboard } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';
import ThemeToggle from '@/components/ui/theme-toggle';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';

const AppNavigation: React.FC = () => {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { preferences } = usePreferences();
  const { trackEvent } = useAnalytics();
  
  // Define keyboard shortcuts
  const shortcuts = [
    {
      key: 'd',
      ctrlKey: true,
      description: 'Go to Dashboard',
      handler: () => {
        window.location.href = '/';
        trackEvent({ name: 'feature_used', properties: { feature: 'keyboard_shortcut', shortcut: 'ctrl+d' } });
      }
    },
    {
      key: 'a',
      ctrlKey: true,
      description: 'Go to AI Assistant',
      handler: () => {
        window.location.href = '/financial-chat';
        trackEvent({ name: 'feature_used', properties: { feature: 'keyboard_shortcut', shortcut: 'ctrl+a' } });
      }
    },
    {
      key: 's',
      ctrlKey: true,
      description: 'Go to Settings',
      handler: () => {
        window.location.href = '/settings';
        trackEvent({ name: 'feature_used', properties: { feature: 'keyboard_shortcut', shortcut: 'ctrl+s' } });
      }
    },
    {
      key: 'n',
      ctrlKey: true,
      description: 'Create New Analysis',
      handler: () => {
        // Logic to create new analysis
        trackEvent({ name: 'feature_used', properties: { feature: 'keyboard_shortcut', shortcut: 'ctrl+n' } });
      }
    },
    {
      key: 't',
      ctrlKey: true,
      description: 'Toggle Dark/Light Theme',
      handler: () => {
        // Theme toggle logic is handled in the component
        document.querySelector('.theme-toggle-btn')?.click();
        trackEvent({ name: 'feature_used', properties: { feature: 'keyboard_shortcut', shortcut: 'ctrl+t' } });
      }
    }
  ];
  
  const { KeyboardShortcutsHelp, toggleShortcutsHelp } = useKeyboardShortcuts(shortcuts);

  const menuItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: <BarChart2 className="w-4 h-4 mr-2" />,
      badge: null
    },
    { 
      path: '/financial-chat', 
      label: 'AI Assistant', 
      icon: <MessageSquare className="w-4 h-4 mr-2" />, 
      badge: { text: 'New', color: 'bg-[#FF1B6B] text-white' }
    },
    { 
      path: '/reports', 
      label: 'Reports', 
      icon: <FileText className="w-4 h-4 mr-2" />,
      badge: null
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: <Settings className="w-4 h-4 mr-2" />,
      badge: null
    }
  ];

  return (
    <>
      <div className={`bg-white dark:bg-[#1B2951] border-b border-[#E9ECEF] dark:border-[#2A3B5C] shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <AnimatedLogo />
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-2 tour-header">
                {menuItems.map((item) => (
                  <Link href={item.path} key={item.path}>
                    <a className="relative group">
                      <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        location === item.path 
                          ? 'text-[#1B2951] dark:text-white bg-[#F8F9FA] dark:bg-[#2A3B5C]' 
                          : 'text-[#6C757D] dark:text-[#E9ECEF] hover:text-[#1B2951] dark:hover:text-white hover:bg-[#F8F9FA] dark:hover:bg-[#2A3B5C]'
                      } transition duration-150 ease-in-out`}>
                        {item.icon}
                        {item.label}
                        {item.badge && (
                          <span className={`ml-2 px-1.5 py-0.5 text-xs font-bold rounded-full ${item.badge.color}`}>
                            {item.badge.text}
                          </span>
                        )}
                      </div>
                      
                      {/* Animated underline for active item */}
                      {location === item.path && (
                        <motion.div 
                          className="absolute bottom-0 left-0 h-0.5 bg-[#FF1B6B] w-full"
                          layoutId="navbar-indicator"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* User menu and mobile nav button */}
            <div className="flex items-center">
              <ThemeToggle className="mr-2 theme-toggle-btn" />
              
              <button 
                className="p-1.5 text-[#6C757D] rounded-full hover:bg-[#F8F9FA] dark:hover:bg-[#2A3B5C] hover:text-[#1B2951] dark:hover:text-white mr-2 tour-help-btn"
                onClick={toggleShortcutsHelp}
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="h-5 w-5" />
              </button>
              
              <button className="p-1.5 text-[#6C757D] rounded-full hover:bg-[#F8F9FA] dark:hover:bg-[#2A3B5C] hover:text-[#1B2951] dark:hover:text-white mr-2 tour-notifications">
                <Bell className="h-5 w-5" />
              </button>
              
              <div className="relative ml-3 tour-user-menu">
                <div className="flex items-center">
                  <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF1B6B]">
                    <div className="h-8 w-8 rounded-full bg-[#1B2951] dark:bg-[#FF1B6B] flex items-center justify-center text-white font-medium">
                      <User className="h-4 w-4" />
                    </div>
                  </button>
                  <button className="ml-2 flex items-center text-[#6C757D] hover:text-[#1B2951] dark:text-[#E9ECEF] dark:hover:text-white">
                    <span className="mr-1 text-sm font-medium hidden sm:block">Admin</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Mobile menu button */}
              <div className="flex md:hidden ml-2">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="inline-flex items-center justify-center p-2 rounded-md text-[#6C757D] hover:text-[#1B2951] hover:bg-[#F8F9FA] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF1B6B]"
                >
                  <span className="sr-only">Open main menu</span>
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-[#E9ECEF] dark:border-[#2A3B5C]">
            {menuItems.map((item) => (
              <Link href={item.path} key={item.path}>
                <a className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  location === item.path 
                    ? 'text-[#1B2951] dark:text-white bg-[#F8F9FA] dark:bg-[#2A3B5C]' 
                    : 'text-[#6C757D] dark:text-[#E9ECEF] hover:text-[#1B2951] dark:hover:text-white hover:bg-[#F8F9FA] dark:hover:bg-[#2A3B5C]'
                }`}>
                  {item.icon}
                  {item.label}
                  {item.badge && (
                    <span className={`ml-2 px-1.5 py-0.5 text-xs font-bold rounded-full ${item.badge.color}`}>
                      {item.badge.text}
                    </span>
                  )}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <KeyboardShortcutsHelp />
    </>
  );
};

export default AppNavigation;