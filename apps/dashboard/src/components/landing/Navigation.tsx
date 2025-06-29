// src/components/landing/Navigation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { 
  Building2, 
  BarChart3, 
  Users, 
  Sparkles, 
  Menu, 
  X,
  ChevronRight,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Product',
    items: [
      {
        title: 'AI Intelligence',
        href: '#features',
        description: 'Cutting-edge AI that understands property management',
        icon: Sparkles,
      },
      {
        title: 'Analytics Dashboard',
        href: '#analytics',
        description: 'Real-time insights and predictive analytics',
        icon: BarChart3,
      },
      {
        title: 'Integrations',
        href: '#integrations',
        description: 'Seamlessly connect with your existing tools',
        icon: Zap,
      },
    ],
  },
  {
    title: 'Solutions',
    items: [
      {
        title: 'For Property Managers',
        href: '#property-managers',
        description: 'Streamline operations and maximize NOI',
        icon: Building2,
      },
      {
        title: 'For REITs',
        href: '#reits',
        description: 'Portfolio-wide intelligence at scale',
        icon: Globe,
      },
      {
        title: 'For Investors',
        href: '#investors',
        description: 'Data-driven investment decisions',
        icon: Shield,
      },
    ],
  },
  {
    title: 'Company',
    items: [
      {
        title: 'About Us',
        href: '#about',
        description: 'Our mission to transform property management',
      },
      {
        title: 'Customers',
        href: '#customers',
        description: 'Join thousands of satisfied users',
      },
      {
        title: 'Contact',
        href: '#contact',
        description: 'Get in touch with our team',
      },
    ],
  },
];

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-600 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-r from-primary to-primary-600 text-white p-2 rounded-lg">
                <Building2 className="h-6 w-6" />
              </div>
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
              Prism Intelligence
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuTrigger className="bg-transparent">
                      {item.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.items.map((subItem) => (
                          <li key={subItem.title}>
                            <NavigationMenuLink asChild>
                              <a
                                href={subItem.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                              >
                                <div className="flex items-center space-x-2">
                                  {subItem.icon && (
                                    <subItem.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                  )}
                                  <div className="text-sm font-medium leading-none">
                                    {subItem.title}
                                  </div>
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {subItem.description}
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
                
                <NavigationMenuItem>
                  <Link href="#pricing" legacyBehavior passHref>
                    <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      Pricing
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-4"
            >
              <div className="flex flex-col space-y-4 pb-4">
                {navigationItems.map((item) => (
                  <div key={item.title}>
                    <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {item.title}
                    </h3>
                    <div className="space-y-2">
                      {item.items.map((subItem) => (
                        <a
                          key={subItem.title}
                          href={subItem.href}
                          className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        >
                          {subItem.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-primary to-primary-600">
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};