import { useState, useRef, useEffect } from "react";

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
  onSelect
}: DraggableClothingItemProps) {
  const [position, setPosition] = useState(initialPosition);
  const [scale, setScale] = useState(initialScale);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ 
    x: 0, 
    y: 0, 
    scale: 1, 
    handle: 'se' as ResizeHandle,
    centerX: 0,
    centerY: 0
  });
  const itemRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for clicks outside to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setIsSelected(false);
      }
    };

    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSelected]);

  // Get container bounds
  const getContainerBounds = () => {
    const container = itemRef.current?.parentElement;
    if (!container) return { width: 0, height: 0 };
    return {
      width: container.clientWidth,
      height: container.clientHeight
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
      setIsDragging(true);
      setIsSelected(true);
      onSelect(id);
      
      const rect = itemRef.current?.getBoundingClientRect();
      const container = itemRef.current?.parentElement?.getBoundingClientRect();
      
      if (rect && container) {
        setDragStart({
          x: e.clientX - (rect.left - container.left),
          y: e.clientY - (rect.top - container.top)
        });
      }
      e.preventDefault();
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    setIsResizing(true);
    setIsSelected(true);
    onSelect(id);
    
    const rect = itemRef.current?.getBoundingClientRect();
    const container = itemRef.current?.parentElement?.getBoundingClientRect();
    
    if (rect && container) {
      const centerX = position.x + (getSize().width * scale) / 2;
      const centerY = position.y + (getSize().height * scale) / 2;
      
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        scale: scale,
        handle: handle,
        centerX,
        centerY
      });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const containerBounds = getContainerBounds();
      const size = getSize();
      const itemWidth = size.width * scale;
      const itemHeight = size.height * scale;
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Constrain to container bounds
      const constrainedX = Math.max(0, Math.min(newX, containerBounds.width - itemWidth));
      const constrainedY = Math.max(0, Math.min(newY, containerBounds.height - itemHeight));
      
      const newPosition = { x: constrainedX, y: constrainedY };
      setPosition(newPosition);
      onPositionChange(id, newPosition);
      
    } else if (isResizing) {
      const containerBounds = getContainerBounds();
      const { handle, centerX, centerY } = resizeStart;
      
      const mouseDeltaX = e.clientX - resizeStart.x;
      const mouseDeltaY = e.clientY - resizeStart.y;
      
      // Calculate scale based on distance from center
      let scaleFactor = 1;
      const baseDistance = 100; // Base distance for scale calculation
      
      switch (handle) {
        case 'se': // Bottom right
          scaleFactor = 1 + Math.max(mouseDeltaX, mouseDeltaY) / baseDistance;
          break;
        case 'sw': // Bottom left
          scaleFactor = 1 + Math.max(-mouseDeltaX, mouseDeltaY) / baseDistance;
          break;
        case 'ne': // Top right
          scaleFactor = 1 + Math.max(mouseDeltaX, -mouseDeltaY) / baseDistance;
          break;
        case 'nw': // Top left
          scaleFactor = 1 + Math.max(-mouseDeltaX, -mouseDeltaY) / baseDistance;
          break;
      }
      
      const newScale = Math.max(0.3, Math.min(3, resizeStart.scale * scaleFactor));
      const size = getSize();
      const newWidth = size.width * newScale;
      const newHeight = size.height * newScale;
      
      // Calculate new position to keep the item centered during resize
      let newPosition = { ...position };
      
      // Adjust position based on which corner is being dragged
      switch (handle) {
        case 'se': // Scale from top-left, no position change needed
          break;
        case 'sw': // Scale from top-right
          newPosition.x = centerX - newWidth / 2;
          break;
        case 'ne': // Scale from bottom-left
          newPosition.y = centerY - newHeight / 2;
          break;
        case 'nw': // Scale from bottom-right
          newPosition.x = centerX - newWidth / 2;
          newPosition.y = centerY - newHeight / 2;
          break;
      }
      
      // Constrain to container bounds
      newPosition.x = Math.max(0, Math.min(newPosition.x, containerBounds.width - newWidth));
      newPosition.y = Math.max(0, Math.min(newPosition.y, containerBounds.height - newHeight));
      
      setScale(newScale);
      setPosition(newPosition);
      onScaleChange(id, newScale);
      onPositionChange(id, newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    onSelect(id);
  };

  // Get size based on category - doubled the base sizes
  const getSize = () => {
    const baseSize = 240; // Doubled from 120
    switch (category) {
      case "top": return { width: baseSize * 1.2, height: baseSize };
      case "bottom": return { width: baseSize * 0.8, height: baseSize };
      case "one_piece": return { width: baseSize * 1.2, height: baseSize * 1.5 };
      case "shoes": return { width: baseSize * 0.7, height: baseSize * 0.5 };
      case "outerwear": return { width: baseSize * 1.3, height: baseSize * 1.1 };
      case "accessory": return { width: baseSize * 0.5, height: baseSize * 0.5 };
      default: return { width: baseSize, height: baseSize };
    }
  };

  const size = getSize();

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="absolute inset-0 pointer-events-none"
    >
      <div
        ref={itemRef}
        className={`absolute cursor-move select-none transition-all duration-150 pointer-events-auto ${
          isSelected ? 'ring-2 ring-bibabop-navy shadow-lg' : ''
        }`}
        style={{
          left: position.x,
          top: position.y,
          width: size.width * scale,
          height: size.height * scale,
          zIndex: isDragging || isResizing ? 1000 : zIndex,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onClick={handleClick}
      >
        <img
          src={imageUrl}
          alt={category}
          className="w-full h-full object-contain pointer-events-none"
          style={{ opacity: isDragging ? 0.8 : 1 }}
          draggable={false}
        />
        
        {isSelected && !isDragging && !isResizing && (
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
    </div>
  );
}
