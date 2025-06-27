import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface TourStep {
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  placement?: 'top' | 'right' | 'bottom' | 'left';
  spotlightRadius?: number;
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const updateTargetElement = () => {
      const el = document.querySelector(steps[currentStep].target);
      if (el) {
        setTargetElement(el.getBoundingClientRect());
      } else {
        setTargetElement(null);
      }
    };
    
    updateTargetElement();
    
    // Update position on resize or scroll
    window.addEventListener('resize', updateTargetElement);
    window.addEventListener('scroll', updateTargetElement);
    
    return () => {
      window.removeEventListener('resize', updateTargetElement);
      window.removeEventListener('scroll', updateTargetElement);
    };
  }, [isOpen, currentStep, steps]);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = () => {
    onComplete();
    onClose();
  };
  
  const handleSkip = () => {
    onClose();
  };
  
  if (!isOpen) return null;
  
  const step = steps[currentStep];
  const placement = step.placement || 'bottom';
  const spotlightRadius = step.spotlightRadius || 8;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%' };
    
    const margin = 12; // Margin from the target element
    
    switch (placement) {
      case 'top':
        return {
          bottom: `${window.innerHeight - targetElement.top + margin}px`,
          left: `${targetElement.left + targetElement.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'right':
        return {
          top: `${targetElement.top + targetElement.height / 2}px`,
          left: `${targetElement.right + margin}px`,
          transform: 'translateY(-50%)'
        };
      case 'bottom':
        return {
          top: `${targetElement.bottom + margin}px`,
          left: `${targetElement.left + targetElement.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          top: `${targetElement.top + targetElement.height / 2}px`,
          right: `${window.innerWidth - targetElement.left + margin}px`,
          transform: 'translateY(-50%)'
        };
      default:
        return {
          top: `${targetElement.bottom + margin}px`,
          left: `${targetElement.left + targetElement.width / 2}px`,
          transform: 'translateX(-50%)'
        };
    }
  };
  
  // Create a "hole" in the overlay for the target element
  const createMaskPath = () => {
    if (!targetElement) return 'M0 0H100vw V100vh H0Z';
    
    const { x, y, width, height } = targetElement;
    const radius = spotlightRadius;
    
    // Full screen rectangle with a rounded rectangle hole
    return `
      M0 0
      H${window.innerWidth}
      V${window.innerHeight}
      H0
      Z
      M${x - radius} ${y + radius}
      Q${x} ${y} ${x + radius} ${y}
      H${x + width - radius}
      Q${x + width} ${y} ${x + width} ${y + radius}
      V${y + height - radius}
      Q${x + width} ${y + height} ${x + width - radius} ${y + height}
      H${x + radius}
      Q${x} ${y + height} ${x} ${y + height - radius}
      Z
    `;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Overlay */}
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetElement && (
                <rect
                  x={targetElement.x - spotlightRadius}
                  y={targetElement.y - spotlightRadius}
                  width={targetElement.width + spotlightRadius * 2}
                  height={targetElement.height + spotlightRadius * 2}
                  rx={spotlightRadius}
                  ry={spotlightRadius}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#spotlight-mask)"
            onClick={handleSkip}
          />
        </motion.svg>
        
        {/* Tooltip */}
        {targetElement && (
          <motion.div
            className="absolute pointer-events-auto bg-white rounded-lg shadow-lg p-4 w-80 z-50"
            style={getTooltipPosition()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.2 }}
          >
            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#1B2951] mb-1">{step.title}</h3>
              <p className="text-sm text-[#6C757D]">{step.content}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep
                        ? 'bg-[#FF1B6B]'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="p-2 rounded-md text-[#6C757D] hover:bg-[#F8F9FA]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  className="px-3 py-1 rounded-md bg-[#FF1B6B] text-white hover:bg-[#FF4757] flex items-center"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default OnboardingTour;