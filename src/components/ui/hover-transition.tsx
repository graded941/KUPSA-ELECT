import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface HoverTransitionProps {
  effect?: 'wipe' | 'fade' | 'slide' | 'scale';
  direction?: 'right' | 'left' | 'top' | 'bottom';
  duration?: number;
  defaultComponent: React.ReactNode;
  hoverComponent: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function HoverTransition({
  effect = 'wipe',
  direction = 'right',
  duration = 0.72,
  defaultComponent,
  hoverComponent,
  className,
  onClick,
}: HoverTransitionProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate clip path or transform style based on effect and direction
  const getHoverStyles = (): React.CSSProperties => {
    const baseTransition = `all ${duration}s cubic-bezier(0.16, 1, 0.3, 1)`;

    if (effect === 'wipe') {
      let unhoveredClip = 'inset(0% 100% 0% 0%)';
      if (direction === 'left') unhoveredClip = 'inset(0% 0% 0% 100%)';
      if (direction === 'bottom') unhoveredClip = 'inset(0% 0% 100% 0%)';
      if (direction === 'top') unhoveredClip = 'inset(100% 0% 0% 0%)';

      return {
        clipPath: isHovered ? 'inset(0% 0% 0% 0%)' : unhoveredClip,
        transition: `clip-path ${duration}s cubic-bezier(0.16, 1, 0.3, 1)`,
        WebkitClipPath: isHovered ? 'inset(0% 0% 0% 0%)' : unhoveredClip,
      };
    }

    if (effect === 'fade') {
      return {
        opacity: isHovered ? 1 : 0,
        transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1)`,
      };
    }

    if (effect === 'slide') {
      let unhoveredTransform = 'translateX(-100%)';
      if (direction === 'right') unhoveredTransform = 'translateX(-100%)';
      if (direction === 'left') unhoveredTransform = 'translateX(100%)';
      if (direction === 'bottom') unhoveredTransform = 'translateY(-100%)';
      if (direction === 'top') unhoveredTransform = 'translateY(100%)';

      return {
        transform: isHovered ? 'translate(0, 0)' : unhoveredTransform,
        transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1)`,
      };
    }

    if (effect === 'scale') {
      return {
        transform: isHovered ? 'scale(1)' : 'scale(0.92)',
        opacity: isHovered ? 1 : 0,
        transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1), opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1)`,
      };
    }

    return {
      transition: baseTransition,
    };
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'group relative overflow-hidden rounded-3xl cursor-pointer select-none border-2 border-border transition-all duration-300 hover:border-ink hover:shadow-pop',
        className
      )}
    >
      {/* Default State Component */}
      <div className="relative h-full w-full pointer-events-none">
        {defaultComponent}
      </div>

      {/* Hover State Component with Animation */}
      <div
        aria-hidden={!isHovered}
        style={getHoverStyles()}
        className="absolute inset-0 z-10 h-full w-full will-change-[clip-path,transform,opacity] pointer-events-none"
      >
        {hoverComponent}
      </div>
    </div>
  );
}
