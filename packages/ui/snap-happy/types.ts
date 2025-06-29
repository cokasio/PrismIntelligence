// src/components/snap-happy/types.ts

export interface SnapGridProps {
  children: React.ReactNode;
  columns?: number;
  rowHeight?: number;
  gap?: number;
  className?: string;
  onLayoutChange?: (layout: GridLayout[]) => void;
  isDraggable?: boolean;
  isResizable?: boolean;
  compactType?: 'vertical' | 'horizontal' | null;
}

export interface GridLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
}

export interface SnapScrollProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal' | 'both';
  type?: 'mandatory' | 'proximity';
  padding?: number;
  className?: string;
}

export interface ScreenshotOptions {
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  backgroundColor?: string;
  scale?: number;
  logging?: boolean;
  useCORS?: boolean;
  allowTaint?: boolean;
}

export interface AnimationPreset {
  name: string;
  initial: any;
  animate: any;
  exit?: any;
  transition?: any;
}

export interface SnapAnimationProps {
  children: React.ReactNode;
  preset?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate' | 'bounce' | 'snap';
  custom?: AnimationPreset;
  delay?: number;
  duration?: number;
  className?: string;
}