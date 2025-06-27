import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, MessageSquare, ArrowLeft } from 'lucide-react';
import PageLayout from '@/components/layout';

const NotFound = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
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
    <PageLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <motion.div 
          className="max-w-md w-full text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="bg-[#FF1B6B]/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            variants={itemVariants}
          >
            <AlertTriangle className="h-12 w-12 text-[#FF1B6B]" />
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-bold text-[#1B2951] mb-4"
            variants={itemVariants}
          >
            404 - Page Not Found
          </motion.h1>
          
          <motion.p 
            className="text-[#6C757D] mb-8"
            variants={itemVariants}
          >
            Sorry, the page you are looking for doesn't exist or has been moved.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4"
            variants={itemVariants}
          >
            <Link href="/">
              <a className="flex items-center justify-center px-4 py-2 rounded-md bg-[#1B2951] text-white hover:bg-[#1B2951]/90 transition-colors w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </a>
            </Link>
            
            <Link href="/financial-chat">
              <a className="flex items-center justify-center px-4 py-2 rounded-md border border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors w-full sm:w-auto">
                <MessageSquare className="w-4 h-4 mr-2" />
                Try AI Assistant
              </a>
            </Link>
          </motion.div>
          
          <motion.button 
            className="mt-8 text-[#6C757D] hover:text-[#1B2951] flex items-center mx-auto"
            variants={itemVariants}
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Go Back
          </motion.button>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default NotFound;