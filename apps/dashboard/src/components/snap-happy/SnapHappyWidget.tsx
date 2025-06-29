// src/components/snap-happy/SnapHappyWidget.tsx
'use client';

import React from 'react';
import { SnapHappyButton } from './SnapHappyButton';

interface SnapHappyWidgetProps {
  enabled?: boolean;
}

export const SnapHappyWidget: React.FC<SnapHappyWidgetProps> = ({ 
  enabled = true 
}) => {
  if (!enabled) return null;
  
  return <SnapHappyButton position="bottom-right" />;
};