import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'motion/react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WindowProps {
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  snapState?: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;
  onSnapChange?: (snap: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null) => void;
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
  snapState = null,
  onSnapChange,
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

  const [showSnapMenu, setShowSnapMenu] = useState(false);
  const snapMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterMaximize = () => {
    if (snapMenuTimeoutRef.current) clearTimeout(snapMenuTimeoutRef.current);
    setShowSnapMenu(true);
  };

  const handleMouseLeaveMaximize = () => {
    snapMenuTimeoutRef.current = setTimeout(() => {
      setShowSnapMenu(false);
    }, 250);
  };

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
      // If snapped, release the snap on drag start!
      if (snapState && onSnapChange) {
        onSnapChange(null);
      }
      dragControls.start(e);
    }
  };

  // Double click title bar to toggle maximize
  const handleTitleBarDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button')) {
      if (snapState && onSnapChange) {
        onSnapChange(null);
      } else {
        onMaximize();
      }
    }
  };

  // Compute layout style depending on snapState or maximize state
  let top = '20%';
  let left = '25%';
  let computedWidth = `${width}px`;
  let computedHeight = `${height}px`;

  if (isMaximized) {
    top = '135px';
    left = '0px';
    computedWidth = '100vw';
    computedHeight = 'calc(100vh - 135px - 56px)';
  } else if (snapState) {
    top = '135px';
    computedHeight = 'calc(100vh - 135px - 56px)';
    if (snapState === 'left') {
      left = '0px';
      computedWidth = '50vw';
    } else if (snapState === 'right') {
      left = '50vw';
      computedWidth = '50vw';
    } else if (snapState === 'top-left') {
      left = '0px';
      computedWidth = '50vw';
      computedHeight = 'calc((100vh - 135px - 56px) / 2)';
    } else if (snapState === 'top-right') {
      left = '50vw';
      computedWidth = '50vw';
      computedHeight = 'calc((100vh - 135px - 56px) / 2)';
    } else if (snapState === 'bottom-left') {
      left = '0px';
      top = 'calc(135px + (100vh - 135px - 56px) / 2)';
      computedWidth = '50vw';
      computedHeight = 'calc((100vh - 135px - 56px) / 2)';
    } else if (snapState === 'bottom-right') {
      left = '50vw';
      top = 'calc(135px + (100vh - 135px - 56px) / 2)';
      computedWidth = '50vw';
      computedHeight = 'calc((100vh - 135px - 56px) / 2)';
    }
  }

  return (
    <motion.div
      ref={windowRef}
      drag={!isMaximized && !snapState}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={{ top: 0 }}
      onPointerDown={onFocus}
      style={{
        zIndex,
        display: isMinimized ? 'none' : 'flex',
        width: computedWidth,
        height: computedHeight,
        position: 'fixed',
        top,
        left,
      }}
      className={cn(
        "flex flex-col bg-bg-sidebar border border-border-subtle shadow-2xl overflow-hidden transition-all duration-150 select-none",
        isMaximized || snapState ? "rounded-none" : "rounded-3xl",
        "z-[60]"
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
            className="p-1.5 hover:bg-white/5 text-text-dim hover:text-text-main rounded-lg transition-colors border border-transparent hover:border-border-subtle cursor-pointer"
            title="Minimizar"
          >
            <Minus size={14} />
          </button>
          
          {/* Maximize */}
          <div 
            className="relative"
            onMouseEnter={handleMouseEnterMaximize}
            onMouseLeave={handleMouseLeaveMaximize}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (snapState && onSnapChange) {
                  onSnapChange(null);
                } else {
                  onMaximize();
                }
              }}
              className="p-1.5 hover:bg-white/5 text-text-dim hover:text-text-main rounded-lg transition-colors border border-transparent hover:border-border-subtle cursor-pointer"
              title={isMaximized || snapState ? "Restaurar tamanho" : "Maximizar"}
            >
              {isMaximized || snapState ? <Copy size={14} /> : <Square size={14} />}
            </button>

            {showSnapMenu && (
              <div
                onMouseEnter={() => {
                  if (snapMenuTimeoutRef.current) clearTimeout(snapMenuTimeoutRef.current);
                }}
                onMouseLeave={handleMouseLeaveMaximize}
                className="absolute right-0 top-10 bg-bg-sidebar/95 backdrop-blur-xl border border-border-subtle p-3 rounded-2xl shadow-2xl z-[9999] flex flex-col gap-2.5 w-48 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <span className="text-[9px] font-black text-text-dim/60 uppercase tracking-widest text-center border-b border-border-subtle/50 pb-1.5">Dividir Tela (Snap)</span>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* Left / Right */}
                  <button
                    onClick={() => { if (onSnapChange) onSnapChange('left'); setShowSnapMenu(false); }}
                    className="h-12 border border-border-subtle hover:border-primary/50 bg-bg-card hover:bg-primary/5 rounded-lg flex items-center justify-center relative overflow-hidden transition-all group cursor-pointer"
                    title="Esquerda"
                  >
                    <div className="absolute left-0 top-0 w-1/2 h-full bg-primary/20 group-hover:bg-primary/35 transition-colors border-r border-border-subtle" />
                  </button>
                  <button
                    onClick={() => { if (onSnapChange) onSnapChange('right'); setShowSnapMenu(false); }}
                    className="h-12 border border-border-subtle hover:border-primary/50 bg-bg-card hover:bg-primary/5 rounded-lg flex items-center justify-center relative overflow-hidden transition-all group cursor-pointer"
                    title="Direita"
                  >
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-primary/20 group-hover:bg-primary/35 transition-colors border-l border-border-subtle" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Top-Left / Top-Right */}
                  <button
                    onClick={() => { if (onSnapChange) onSnapChange('top-left'); setShowSnapMenu(false); }}
                    className="h-10 border border-border-subtle hover:border-primary/50 bg-bg-card hover:bg-primary/5 rounded-lg flex items-center justify-center relative overflow-hidden transition-all group cursor-pointer"
                    title="Superior Esquerdo"
                  >
                    <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-primary/20 group-hover:bg-primary/35 transition-colors border-r border-b border-border-subtle" />
                  </button>
                  <button
                    onClick={() => { if (onSnapChange) onSnapChange('top-right'); setShowSnapMenu(false); }}
                    className="h-10 border border-border-subtle hover:border-primary/50 bg-bg-card hover:bg-primary/5 rounded-lg flex items-center justify-center relative overflow-hidden transition-all group cursor-pointer"
                    title="Superior Direito"
                  >
                    <div className="absolute right-0 top-0 w-1/2 h-1/2 bg-primary/20 group-hover:bg-primary/35 transition-colors border-l border-b border-border-subtle" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Bottom-Left / Bottom-Right */}
                  <button
                    onClick={() => { if (onSnapChange) onSnapChange('bottom-left'); setShowSnapMenu(false); }}
                    className="h-10 border border-border-subtle hover:border-primary/50 bg-bg-card hover:bg-primary/5 rounded-lg flex items-center justify-center relative overflow-hidden transition-all group cursor-pointer"
                    title="Inferior Esquerdo"
                  >
                    <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-primary/20 group-hover:bg-primary/35 transition-colors border-r border-t border-border-subtle" />
                  </button>
                  <button
                    onClick={() => { if (onSnapChange) onSnapChange('bottom-right'); setShowSnapMenu(false); }}
                    className="h-10 border border-border-subtle hover:border-primary/50 bg-bg-card hover:bg-primary/5 rounded-lg flex items-center justify-center relative overflow-hidden transition-all group cursor-pointer"
                    title="Inferior Direito"
                  >
                    <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-primary/20 group-hover:bg-primary/35 transition-colors border-l border-t border-border-subtle" />
                  </button>
                </div>
                
                <button
                  onClick={() => { if (onSnapChange) onSnapChange(null); onMaximize(); setShowSnapMenu(false); }}
                  className="py-1.5 px-2 border border-border-subtle hover:border-primary/45 bg-bg-card text-[9px] font-black uppercase tracking-widest text-text-dim hover:text-primary rounded-lg transition-colors text-center cursor-pointer"
                >
                  Tela Cheia
                </button>
              </div>
            )}
          </div>

          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 hover:bg-red-500/10 text-text-dim hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
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

      {/* RESIZE HANDLES (only when not maximized and not snapped) */}
      {!isMaximized && !snapState && (
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
