import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';

const AnimatedLogo: React.FC = () => {
  const pathVariants = {
    hidden: {
      opacity: 0,
      pathLength: 0,
    },
    visible: {
      opacity: 1,
      pathLength: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
      }
    }
  };

  return (
    <div className="flex items-center">
      <motion.div
        className="h-8 w-8 bg-[#1B2951] rounded-md flex items-center justify-center mr-2"
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -5, 5, -5, 0],
          transition: { duration: 0.5 }
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          transition: { duration: 0.5 }
        }}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-white"
        >
          <motion.path
            d="M18 20V10M12 20V4M6 20v-6" 
            variants={pathVariants}
            initial="hidden"
            animate="visible"
          />
        </svg>
      </motion.div>
      <motion.span 
        className="text-[#1B2951] font-semibold text-lg"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        ERPEAMIL
      </motion.span>
    </div>
  );
};

export default AnimatedLogo;