
import { useState, useRef } from "react";

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
    itemRect: { x: 0, y: 0, width: 0, height: 0 }
  });
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
      setIsDragging(true);
      setIsSelected(true);
      onSelect(id);
      const rect = itemRef.current?.getBoundingClientRect();
      if (rect) {
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
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
    if (rect) {
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        scale: scale,
        handle: handle,
        itemRect: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        }
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && itemRef.current) {
      const container = itemRef.current.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const newPosition = {
          x: e.clientX - containerRect.left - dragStart.x,
          y: e.clientY - containerRect.top - dragStart.y
        };
        
        // Constrain to container bounds
        const itemWidth = itemRef.current.offsetWidth;
        const itemHeight = itemRef.current.offsetHeight;
        const maxX = containerRect.width - itemWidth;
        const maxY = containerRect.height - itemHeight;
        
        newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
        newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));
        
        setPosition(newPosition);
        onPositionChange(id, newPosition);
      }
    } else if (isResizing && itemRef.current) {
      const container = itemRef.current.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const { handle, itemRect } = resizeStart;
        
        // Calculate new scale based on handle and mouse position
        let newScale = scale;
        let newPosition = { ...position };
        
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        // Calculate scale factor based on the handle being dragged
        let scaleFactor = 1;
        
        switch (handle) {
          case 'se': // Bottom right - scale from top-left
            scaleFactor = 1 + Math.max(deltaX, deltaY) / 100;
            break;
          case 'sw': // Bottom left - scale from top-right
            scaleFactor = 1 + Math.max(-deltaX, deltaY) / 100;
            newPosition.x = position.x + deltaX * 0.5;
            break;
          case 'ne': // Top right - scale from bottom-left
            scaleFactor = 1 + Math.max(deltaX, -deltaY) / 100;
            newPosition.y = position.y + deltaY * 0.5;
            break;
          case 'nw': // Top left - scale from bottom-right
            scaleFactor = 1 + Math.max(-deltaX, -deltaY) / 100;
            newPosition.x = position.x + deltaX * 0.5;
            newPosition.y = position.y + deltaY * 0.5;
            break;
        }
        
        newScale = Math.max(0.3, Math.min(3, resizeStart.scale * scaleFactor));
        
        // Constrain position to container
        const newWidth = getSize().width * newScale;
        const newHeight = getSize().height * newScale;
        const maxX = containerRect.width - newWidth;
        const maxY = containerRect.height - newHeight;
        
        newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
        newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));
        
        setScale(newScale);
        setPosition(newPosition);
        onScaleChange(id, newScale);
        onPositionChange(id, newPosition);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleDoubleClick = () => {
    onRemove(id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    onSelect(id);
  };

  // Get size based on category - increased base sizes
  const getSize = () => {
    const baseSize = 120; // Increased from 80
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
      ref={itemRef}
      className={`absolute cursor-move select-none transition-all duration-150 ${
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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
  );
}
