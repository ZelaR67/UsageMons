import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const TooltipContent: React.FC<{ content: React.ReactNode }> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const contentEl = contentRef.current;
    if (!container || !contentEl) return;

    contentEl.style.transform = 'translateY(0px)';

    const containerHeight = container.clientHeight;
    const contentHeight = contentEl.scrollHeight;

    if (contentHeight <= containerHeight) return;

    let animationFrameId: number;
    let lastTime = 0;
    let currentY = 0;
    let pauseTime = 1000;
    const SCROLL_SPEED = 50;
    const PAUSE_DURATION = 1500;
    const maxScroll = contentHeight - containerHeight;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;
      lastTime = time;

      if (pauseTime > 0) {
        pauseTime -= deltaTime;
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      if (currentY <= -maxScroll) {
        currentY = 0;
        pauseTime = 1000;
        contentEl.style.transform = `translateY(${currentY}px)`;
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const move = (SCROLL_SPEED * deltaTime) / 1000;
      currentY -= move;
      
      if (currentY <= -maxScroll) {
        currentY = -maxScroll;
        pauseTime = PAUSE_DURATION;
      }

      contentEl.style.transform = `translateY(${currentY}px)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [content]);

  return (
    <div ref={containerRef} className="max-h-40 overflow-hidden relative">
      <div ref={contentRef} className="will-change-transform">
        {content}
      </div>
    </div>
  );
};

const TooltipPortal: React.FC<{ triggerRect: DOMRect; content: React.ReactNode }> = ({ triggerRect, content }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!tooltipRef.current || !arrowRef.current) return;

    const tooltip = tooltipRef.current;
    const arrow = arrowRef.current;
    
    const { width, height } = tooltip.getBoundingClientRect();
    const { innerWidth, innerHeight } = window;
    const padding = 12;

    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    let left = triggerCenterX - width / 2;

    if (left < padding) left = padding;
    if (left + width > innerWidth - padding) left = innerWidth - width - padding;

    let top = triggerRect.top - height - 8;
    let newPlacement: 'top' | 'bottom' = 'top';

    if (top < padding) {
      top = triggerRect.bottom + 8;
      newPlacement = 'bottom';
      
      if (top + height > innerHeight - padding) {
         const spaceTop = triggerRect.top;
         const spaceBottom = innerHeight - triggerRect.bottom;
         if (spaceTop > spaceBottom) {
             top = triggerRect.top - height - 8;
             newPlacement = 'top';
             if (top < padding) top = padding;
         } else {
             if (top + height > innerHeight - padding) top = innerHeight - height - padding;
         }
      }
    }

    const arrowX = triggerCenterX - left;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.opacity = '1';
    
    arrow.style.left = `${arrowX}px`;
    
    const topClasses = ['top-full', 'border-t-white/80', 'dark:border-t-gray-900/80'];
    const bottomClasses = ['bottom-full', 'border-b-white/80', 'dark:border-b-gray-900/80'];
    
    if (newPlacement === 'top') {
        arrow.classList.remove(...bottomClasses);
        arrow.classList.add(...topClasses);
    } else {
        arrow.classList.remove(...topClasses);
        arrow.classList.add(...bottomClasses);
    }

  }, [triggerRect, content]);

  return (
    <div 
      ref={tooltipRef}
      className="fixed z-50 px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-2xl backdrop-blur-xl border border-white/40 dark:border-white/10 ring-1 ring-black/5 max-w-xs text-center pointer-events-none transition-opacity duration-200 ease-out"
      style={{ opacity: 0, left: 0, top: 0 }}
    >
      <TooltipContent content={content} />
      <div 
        ref={arrowRef}
        className="absolute w-0 h-0 border-4 border-transparent transform -translate-x-1/2"
      ></div>
    </div>
  );
};

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
      setIsVisible(true);
    }
  };

  return (
    <>
      <div 
        ref={triggerRef} 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={() => setIsVisible(false)}
        className={`cursor-help ${className || 'inline-block'}`}
      >
        {children}
      </div>
      {isVisible && content && triggerRect && createPortal(
        <TooltipPortal triggerRect={triggerRect} content={content} />,
        document.body
      )}
    </>
  );
};
