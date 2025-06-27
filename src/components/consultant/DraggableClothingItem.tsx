
import { useState, useRef, useEffect, useCallback } from "react";

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
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const itemRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    startPosition: { x: 0, y: 0 },
    startScale: 1,
    resizeHandle: 'se' as ResizeHandle,
    itemCenterX: 0,
    itemCenterY: 0
  });

  console.log(`[${id}] Component render - position:`, position, 'scale:', scale, 'isDragging:', isDragging, 'isResizing:', isResizing);

  // Memoize container bounds to avoid recalculation on every render
  const containerBounds = useRef({ width: 800, height: 600 });

  const updateContainerBounds = useCallback(() => {
    const container = itemRef.current?.parentElement;
    if (container) {
      containerBounds.current = {
        width: container.clientWidth,
        height: container.clientHeight
      };
      console.log(`[${id}] Container bounds updated:`, containerBounds.current);
    }
  }, [id]);

  // Update container bounds only when needed
  useEffect(() => {
    updateContainerBounds();
    
    const handleResize = () => updateContainerBounds();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateContainerBounds]);

  // Listen for clicks outside to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        console.log(`[${id}] Deselecting item due to outside click`);
        setIsSelected(false);
      }
    };

    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSelected, id]);

  const getSize = useCallback(() => {
    const baseSize = 200;
    switch (category) {
      case "top": return { width: baseSize * 1.2, height: baseSize };
      case "bottom": return { width: baseSize * 0.8, height: baseSize };
      case "one_piece": return { width: baseSize * 1.2, height: baseSize * 1.5 };
      case "shoes": return { width: baseSize * 0.7, height: baseSize * 0.5 };
      case "outerwear": return { width: baseSize * 1.3, height: baseSize * 1.1 };
      case "accessory": return { width: baseSize * 0.5, height: baseSize * 0.5 };
      default: return { width: baseSize, height: baseSize };
    }
  }, [category]);

  // Global mouse handlers - Fixed to prevent infinite loops
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const dragState = dragStateRef.current;
      
      console.log(`[${id}] Mouse move - clientX: ${e.clientX}, clientY: ${e.clientY}, isDragging: ${dragState.isDragging}, isResizing: ${dragState.isResizing}`);
      
      if (dragState.isDragging) {
        e.preventDefault();
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        
        console.log(`[${id}] Drag delta - deltaX: ${deltaX}, deltaY: ${deltaY}`);
        
        const newPosition = {
          x: dragState.startPosition.x + deltaX,
          y: dragState.startPosition.y + deltaY
        };

        const size = getSize();
        const constrainedPosition = {
          x: Math.max(0, Math.min(newPosition.x, containerBounds.current.width - (size.width * scale))),
          y: Math.max(0, Math.min(newPosition.y, containerBounds.current.height - (size.height * scale)))
        };

        console.log(`[${id}] Setting new position:`, constrainedPosition);
        setPosition(constrainedPosition);
        
      } else if (dragState.isResizing) {
        e.preventDefault();
        const mouseDeltaX = e.clientX - dragState.startX;
        const mouseDeltaY = e.clientY - dragState.startY;
        
        let scaleFactor = 1;
        const sensitivity = 0.01;
        
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
        
        const size = getSize();
        const newWidth = size.width * newScale;
        const newHeight = size.height * newScale;
        
        const newPosition = {
          x: dragState.itemCenterX - newWidth / 2,
          y: dragState.itemCenterY - newHeight / 2
        };
        
        const constrainedPosition = {
          x: Math.max(0, Math.min(newPosition.x, containerBounds.current.width - newWidth)),
          y: Math.max(0, Math.min(newPosition.y, containerBounds.current.height - newHeight))
        };
        
        setScale(newScale);
        setPosition(constrainedPosition);
      }
    };

    const handleGlobalMouseUp = () => {
      const dragState = dragStateRef.current;
      
      if (dragState.isDragging) {
        console.log(`[${id}] Drag end - final position:`, position);
        onPositionChange(id, position);
        dragState.isDragging = false;
        setIsDragging(false);
      }
      
      if (dragState.isResizing) {
        console.log(`[${id}] Resize end - final scale:`, scale);
        onScaleChange(id, scale);
        onPositionChange(id, position);
        dragState.isResizing = false;
        setIsResizing(false);
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, id, onPositionChange, onScaleChange, getSize, scale, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`[${id}] Drag start - clientX: ${e.clientX}, clientY: ${e.clientY}`);
    
    setIsSelected(true);
    setIsDragging(true);
    onSelect(id);
    
    dragStateRef.current = {
      ...dragStateRef.current,
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosition: { ...position }
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log(`[${id}] Resize start - handle: ${handle}, clientX: ${e.clientX}, clientY: ${e.clientY}`);
    
    setIsSelected(true);
    setIsResizing(true);
    onSelect(id);
    
    const size = getSize();
    const itemCenterX = position.x + (size.width * scale) / 2;
    const itemCenterY = position.y + (size.height * scale) / 2;
    
    dragStateRef.current = {
      ...dragStateRef.current,
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startScale: scale,
      resizeHandle: handle,
      itemCenterX,
      itemCenterY
    };
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[${id}] Double click - removing item`);
    onRemove(id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[${id}] Click - selecting item`);
    setIsSelected(true);
    onSelect(id);
  };

  const size = getSize();

  return (
    <div
      ref={itemRef}
      className={`absolute select-none transition-all duration-150 ${
        isSelected ? 'ring-2 ring-bibabop-navy shadow-lg' : ''
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width * scale,
        height: size.height * scale,
        zIndex: isSelected ? 1000 : zIndex,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      <img
        src={imageUrl}
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
