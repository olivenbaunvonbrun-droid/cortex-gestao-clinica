import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'motion/react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WindowProps {
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
}

export function Window({
  title,
  isMinimized,
  isMaximized,
  zIndex,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  children,
  defaultWidth = 850,
  defaultHeight = 650,
}: WindowProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const windowRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Track window resizing
  const handleResize = (
    direction: 'r' | 'b' | 'br',
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();

    const startWidth = width;
    const startHeight = height;
    const startX = e.clientX;
    const startY = e.clientY;

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (direction === 'r' || direction === 'br') {
        const deltaX = moveEvent.clientX - startX;
        setWidth(Math.max(500, startWidth + deltaX));
      }
      if (direction === 'b' || direction === 'br') {
        const deltaY = moveEvent.clientY - startY;
        setHeight(Math.max(400, startHeight + deltaY));
      }
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const handleTitleBarPointerDown = (e: React.PointerEvent) => {
    // Only drag on left click and not on header buttons
    const target = e.target as HTMLElement;
    if (e.button === 0 && !target.closest('button')) {
      onFocus();
      dragControls.start(e);
    }
  };

  // Double click title bar to toggle maximize
  const handleTitleBarDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button')) {
      onMaximize();
    }
  };

  return (
    <motion.div
      ref={windowRef}
      drag={!isMaximized}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={{ top: 0 }}
      onPointerDown={onFocus}
      style={{
        zIndex,
        display: isMinimized ? 'none' : 'flex',
        width: isMaximized ? '100vw' : `${width}px`,
        height: isMaximized ? 'calc(100vh - 135px)' : `${height}px`, // Keep Cortex header/nav visible or cover? Let's take calc(100vh - 135px) if we want header visible, or 100vh for full.
        // Actually, covering the workspace but keeping the header of Cortex is super clean! Let's make it cover the workspace viewport below the nav bar: top-[135px]
        position: 'fixed',
        top: isMaximized ? '135px' : '20%',
        left: isMaximized ? '0px' : '25%',
      }}
      className={cn(
        "flex flex-col bg-bg-sidebar border border-border-subtle shadow-2xl overflow-hidden transition-all duration-150 select-none",
        isMaximized ? "rounded-none" : "rounded-3xl",
        "z-[60]" // Keep windows floating above standard sidebar overlay
      )}
    >
      {/* WINDOW TITLE BAR */}
      <div
        onPointerDown={handleTitleBarPointerDown}
        onDoubleClick={handleTitleBarDoubleClick}
        className="h-12 bg-bg-card border-b border-border-subtle px-5 flex items-center justify-between cursor-move select-none shrink-0"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-text-main">
            {title}
          </span>
        </div>

        {/* WINDOW CONTROLS */}
        <div className="flex items-center gap-1">
          {/* Minimize */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="p-1.5 hover:bg-white/5 text-text-dim hover:text-text-main rounded-lg transition-colors border border-transparent hover:border-border-subtle"
            title="Minimizar"
          >
            <Minus size={14} />
          </button>
          
          {/* Maximize */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="p-1.5 hover:bg-white/5 text-text-dim hover:text-text-main rounded-lg transition-colors border border-transparent hover:border-border-subtle"
            title={isMaximized ? "Restaurar tamanho" : "Maximizar"}
          >
            {isMaximized ? <Copy size={14} /> : <Square size={14} />}
          </button>

          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 hover:bg-red-500/10 text-text-dim hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
            title="Fechar"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* WINDOW CONTENT */}
      <div className="flex-grow overflow-hidden relative bg-bg-deep">
        {children}
      </div>

      {/* RESIZE HANDLES (only when not maximized) */}
      {!isMaximized && (
        <>
          {/* Right Handle */}
          <div
            onPointerDown={(e) => handleResize('r', e)}
            className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize hover:bg-primary/20 active:bg-primary/45 transition-colors z-50"
          />
          {/* Bottom Handle */}
          <div
            onPointerDown={(e) => handleResize('b', e)}
            className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize hover:bg-primary/20 active:bg-primary/45 transition-colors z-50"
          />
          {/* Bottom-Right Diagonal Handle */}
          <div
            onPointerDown={(e) => handleResize('br', e)}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-[60] flex items-end justify-end p-0.5 opacity-40 hover:opacity-100"
          >
            {/* Simple diagonal lines icon */}
            <svg width="8" height="8" viewBox="0 0 10 10" className="text-text-dim">
              <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.5" />
              <line x1="10" y1="4" x2="4" y2="10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </>
      )}
    </motion.div>
  );
}
