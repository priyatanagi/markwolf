import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  shortcut?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  id?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  shortcut,
  position = 'top',
  children,
  id,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 120;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 28;
    const gap = 6;
    const screenPadding = 8;

    let targetTop = 0;
    let targetLeft = 0;
    let effectivePos = position;

    // Flip vertically if it would bleed off top or bottom of viewport
    if (effectivePos === 'top' && triggerRect.top - tooltipHeight - gap < screenPadding) {
      effectivePos = 'bottom';
    } else if (
      effectivePos === 'bottom' &&
      triggerRect.bottom + tooltipHeight + gap > window.innerHeight - screenPadding
    ) {
      effectivePos = 'top';
    }

    if (effectivePos === 'top') {
      targetTop = triggerRect.top - tooltipHeight - gap;
      targetLeft = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
    } else if (effectivePos === 'bottom') {
      targetTop = triggerRect.bottom + gap;
      targetLeft = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
    } else if (effectivePos === 'left') {
      targetTop = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
      targetLeft = triggerRect.left - tooltipWidth - gap;
    } else if (effectivePos === 'right') {
      targetTop = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
      targetLeft = triggerRect.right + gap;
    }

    // Clamp within viewport horizontally and vertically
    targetLeft = Math.max(
      screenPadding,
      Math.min(targetLeft, window.innerWidth - tooltipWidth - screenPadding)
    );
    targetTop = Math.max(
      screenPadding,
      Math.min(targetTop, window.innerHeight - tooltipHeight - screenPadding)
    );

    setCoords({ top: targetTop, left: targetLeft });
  };

  useEffect(() => {
    if (!isVisible) return;

    updatePosition();

    // Re-calculate on the next animation frame once DOM rendered to ensure precise dimensions
    const rafId = requestAnimationFrame(() => {
      updatePosition();
    });

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isVisible, position]);

  return (
    <div
      id={id}
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="pointer-events-none px-2.5 py-1 text-xs font-medium rounded-md shadow-lg whitespace-nowrap flex items-center gap-1.5 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-700/80 dark:border-zinc-300/80 transition-opacity duration-150"
          >
            <span>{content}</span>
            {shortcut && (
              <kbd className="px-1 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-300 dark:bg-zinc-200 dark:text-zinc-700 border border-zinc-700 dark:border-zinc-300">
                {shortcut}
              </kbd>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
