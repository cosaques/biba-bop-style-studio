import { useState, useRef, useEffect, useCallback } from "react";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

interface DraggableClothingItemProps {
  id: string;
  imageUrl: string;
  category: string;
  initialPosition: { x: number; y: number };
  initialScale: number;
  zIndex: number;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onScaleChange: (id: string, scale: number) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected?: boolean;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

export function DraggableClothingItem({
  id,
  imageUrl,
  category,
  initialPosition,
  initialScale,
  zIndex,
  onPositionChange,
  onScaleChange,
  onRemove,
  onSelect,
  isSelected = false
}: DraggableClothingItemProps) {
  const [position, setPosition] = useState(initialPosition);
  const [scale, setScale] = useState(initialScale);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 150, height: 150 });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const itemRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationFrameRef = useRef<number>();
  const dragStateRef = useRef({
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    startPosition: { x: 0, y: 0 },
    startScale: 1,
    resizeHandle: 'se' as ResizeHandle,
    resizeAnchorX: 0,
    resizeAnchorY: 0,
    lastUpdateTime: 0,
    pendingPosition: null as { x: number; y: number } | null
  });

  // Single optimized image URL for all use cases (400px for browser cache efficiency)
  const optimizedImageUrl = getOptimizedImageUrl(imageUrl, 400);

  // Memoize container bounds to avoid recalculation
  const containerBounds = useRef({ width: 800, height: 600 });

  const updateContainerBounds = useCallback(() => {
    const container = itemRef.current?.parentElement;
    if (container) {
      const newBounds = {
        width: container.clientWidth,
        height: container.clientHeight
      };
      containerBounds.current = newBounds;
    }
  }, []);

  // Update container bounds only when needed
  useEffect(() => {
    updateContainerBounds();
    
    const handleResize = () => updateContainerBounds();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateContainerBounds]);

  // Load and calculate optimal image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 150;
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      
      // Calculate dimensions that maintain aspect ratio
      const dimensions = aspectRatio > 1 
        ? { width: maxSize, height: maxSize / aspectRatio }
        : { width: maxSize * aspectRatio, height: maxSize };
      
      setImageDimensions(dimensions);
      setImageLoaded(true);
    };
    img.src = optimizedImageUrl;
  }, [optimizedImageUrl]);

  // RAF-based position update for ultra-smooth dragging
  const schedulePositionUpdate = useCallback((newPosition: { x: number; y: number }) => {
    dragStateRef.current.pendingPosition = newPosition;
    
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => {
        const pendingPos = dragStateRef.current.pendingPosition;
        if (pendingPos) {
          setPosition(pendingPos);
          dragStateRef.current.pendingPosition = null;
        }
        animationFrameRef.current = undefined;
      });
    }
  }, []);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Global mouse handlers with performance optimizations
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const dragState = dragStateRef.current;
      
      if (dragState.isDragging) {
        e.preventDefault();
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        
        const newPosition = {
          x: dragState.startPosition.x + deltaX,
          y: dragState.startPosition.y + deltaY
        };

        const constrainedPosition = {
          x: Math.max(0, Math.min(newPosition.x, containerBounds.current.width - (imageDimensions.width * scale))),
          y: Math.max(0, Math.min(newPosition.y, containerBounds.current.height - (imageDimensions.height * scale)))
        };

        // Use RAF for ultra-smooth updates
        schedulePositionUpdate(constrainedPosition);
        
      } else if (dragState.isResizing) {
        e.preventDefault();
        const mouseDeltaX = e.clientX - dragState.startX;
        const mouseDeltaY = e.clientY - dragState.startY;
        
        let scaleFactor = 1;
        const sensitivity = 0.01;
        
        // Calculate scale based on handle and mouse movement
        switch (dragState.resizeHandle) {
          case 'se':
            scaleFactor = 1 + Math.max(mouseDeltaX, mouseDeltaY) * sensitivity;
            break;
          case 'sw':
            scaleFactor = 1 + Math.max(-mouseDeltaX, mouseDeltaY) * sensitivity;
            break;
          case 'ne':
            scaleFactor = 1 + Math.max(mouseDeltaX, -mouseDeltaY) * sensitivity;
            break;
          case 'nw':
            scaleFactor = 1 + Math.max(-mouseDeltaX, -mouseDeltaY) * sensitivity;
            break;
        }
        
        const newScale = Math.max(0.2, Math.min(4, dragState.startScale * scaleFactor));
        const newWidth = imageDimensions.width * newScale;
        const newHeight = imageDimensions.height * newScale;
        
        // Calculate new position to keep the opposite corner fixed
        let newPosition = { x: position.x, y: position.y };
        
        switch (dragState.resizeHandle) {
          case 'se':
            newPosition = { x: dragState.resizeAnchorX, y: dragState.resizeAnchorY };
            break;
          case 'sw':
            newPosition = { x: dragState.resizeAnchorX - newWidth, y: dragState.resizeAnchorY };
            break;
          case 'ne':
            newPosition = { x: dragState.resizeAnchorX, y: dragState.resizeAnchorY - newHeight };
            break;
          case 'nw':
            newPosition = { x: dragState.resizeAnchorX - newWidth, y: dragState.resizeAnchorY - newHeight };
            break;
        }
        
        const constrainedPosition = {
          x: Math.max(0, Math.min(newPosition.x, containerBounds.current.width - newWidth)),
          y: Math.max(0, Math.min(newPosition.y, containerBounds.current.height - newHeight))
        };
        
        setScale(newScale);
        schedulePositionUpdate(constrainedPosition);
      }
    };

    const handleGlobalMouseUp = () => {
      const dragState = dragStateRef.current;
      
      if (dragState.isDragging) {
        onPositionChange(id, position);
        dragState.isDragging = false;
        setIsDragging(false);
      }
      
      if (dragState.isResizing) {
        onScaleChange(id, scale);
        onPositionChange(id, position);
        dragState.isResizing = false;
        setIsResizing(false);
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, id, onPositionChange, onScaleChange, imageDimensions, scale, position, schedulePositionUpdate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelect(id);
    setIsDragging(true);
    
    dragStateRef.current = {
      ...dragStateRef.current,
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosition: { ...position },
      lastUpdateTime: performance.now()
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    
    onSelect(id);
    setIsResizing(true);
    
    // Calculate the anchor point (opposite corner that should stay fixed)
    let anchorX, anchorY;
    switch (handle) {
      case 'se':
        anchorX = position.x;
        anchorY = position.y;
        break;
      case 'sw':
        anchorX = position.x + imageDimensions.width * scale;
        anchorY = position.y;
        break;
      case 'ne':
        anchorX = position.x;
        anchorY = position.y + imageDimensions.height * scale;
        break;
      case 'nw':
        anchorX = position.x + imageDimensions.width * scale;
        anchorY = position.y + imageDimensions.height * scale;
        break;
    }
    
    dragStateRef.current = {
      ...dragStateRef.current,
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startScale: scale,
      resizeHandle: handle,
      resizeAnchorX: anchorX,
      resizeAnchorY: anchorY,
      lastUpdateTime: performance.now()
    };
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  // Don't render until image is loaded to avoid layout shifts
  if (!imageLoaded) {
    return (
      <div className="absolute animate-pulse bg-gray-200 rounded" style={{
        left: initialPosition.x,
        top: initialPosition.y,
        width: 150,
        height: 150
      }} />
    );
  }

  return (
    <div
      ref={itemRef}
      className={`absolute select-none transition-all duration-75 ${
        isSelected ? 'ring-2 ring-bibabop-navy shadow-lg' : ''
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: position.x,
        top: position.y,
        width: imageDimensions.width * scale,
        height: imageDimensions.height * scale,
        zIndex: isSelected ? 1000 : zIndex,
        // Use GPU acceleration for smoother animations
        transform: isDragging || isResizing ? 'translateZ(0)' : 'none',
        willChange: isDragging || isResizing ? 'transform' : 'auto'
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      <img
        ref={imageRef}
        src={optimizedImageUrl}
        alt={category}
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
      
      {isSelected && !isResizing && !isDragging && (
        <>
          {/* Corner resize handles */}
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 bg-bibabop-navy border border-white cursor-nw-resize shadow-sm"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-bibabop-navy border border-white cursor-ne-resize shadow-sm"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-bibabop-navy border border-white cursor-sw-resize shadow-sm"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-bibabop-navy border border-white cursor-se-resize shadow-sm"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          
          {/* Remove hint */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Double-cliquez pour retirer
          </div>
        </>
      )}
    </div>
  );
}
