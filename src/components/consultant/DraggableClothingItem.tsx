import { useState, useRef, useEffect } from "react";
import Draggable from 'react-draggable';

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
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ 
    x: 0, 
    y: 0, 
    scale: 1, 
    handle: 'se' as ResizeHandle,
    itemCenterX: 0,
    itemCenterY: 0
  });
  const itemRef = useRef<HTMLDivElement>(null);

  console.log(`[${id}] Component render - position:`, position, 'scale:', scale, 'isResizing:', isResizing);

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

  // Global mouse move and up handlers for resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      console.log(`[${id}] Global mouse move - clientX: ${e.clientX}, clientY: ${e.clientY}`);
      
      const containerBounds = getContainerBounds();
      const { handle, itemCenterX, itemCenterY } = resizeStart;
      
      const mouseDeltaX = e.clientX - resizeStart.x;
      const mouseDeltaY = e.clientY - resizeStart.y;
      
      console.log(`[${id}] Mouse deltas - deltaX: ${mouseDeltaX}, deltaY: ${mouseDeltaY}`);
      
      // Calculate scale based on distance from center and handle direction
      let scaleFactor = 1;
      const sensitivity = 0.01; // Reduced sensitivity for better control
      
      switch (handle) {
        case 'se': // Bottom right - increase scale when moving away from center
          scaleFactor = 1 + Math.max(mouseDeltaX, mouseDeltaY) * sensitivity;
          break;
        case 'sw': // Bottom left - increase scale when moving left or down
          scaleFactor = 1 + Math.max(-mouseDeltaX, mouseDeltaY) * sensitivity;
          break;
        case 'ne': // Top right - increase scale when moving right or up
          scaleFactor = 1 + Math.max(mouseDeltaX, -mouseDeltaY) * sensitivity;
          break;
        case 'nw': // Top left - increase scale when moving up or left
          scaleFactor = 1 + Math.max(-mouseDeltaX, -mouseDeltaY) * sensitivity;
          break;
      }
      
      const newScale = Math.max(0.2, Math.min(4, resizeStart.scale * scaleFactor));
      console.log(`[${id}] Scale calculation - handle: ${handle}, scaleFactor: ${scaleFactor}, newScale: ${newScale}`);
      
      const size = getSize();
      const newWidth = size.width * newScale;
      const newHeight = size.height * newScale;
      
      // Calculate new position to keep item centered around the original center
      const newPosition = {
        x: itemCenterX - newWidth / 2,
        y: itemCenterY - newHeight / 2
      };
      
      // Constrain to container bounds
      const constrainedPosition = {
        x: Math.max(0, Math.min(newPosition.x, containerBounds.width - newWidth)),
        y: Math.max(0, Math.min(newPosition.y, containerBounds.height - newHeight))
      };
      
      console.log(`[${id}] Position update - new: {x: ${constrainedPosition.x}, y: ${constrainedPosition.y}}`);
      
      setScale(newScale);
      setPosition(constrainedPosition);
      onScaleChange(id, newScale);
      onPositionChange(id, constrainedPosition);
    };

    const handleGlobalMouseUp = () => {
      console.log(`[${id}] Global mouse up - ending resize`);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isResizing, resizeStart, id, onScaleChange, onPositionChange]);

  const getContainerBounds = () => {
    const container = itemRef.current?.parentElement;
    if (!container) {
      console.log(`[${id}] No container found`);
      return { width: 800, height: 600 }; // Fallback
    }
    const bounds = {
      width: container.clientWidth,
      height: container.clientHeight
    };
    console.log(`[${id}] Container bounds:`, bounds);
    return bounds;
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log(`[${id}] Resize mouse down - handle: ${handle}, clientX: ${e.clientX}, clientY: ${e.clientY}`);
    
    setIsResizing(true);
    setIsSelected(true);
    onSelect(id);
    
    const size = getSize();
    const itemCenterX = position.x + (size.width * scale) / 2;
    const itemCenterY = position.y + (size.height * scale) / 2;
    
    console.log(`[${id}] Resize start - itemCenter: {x: ${itemCenterX}, y: ${itemCenterY}}, current scale: ${scale}`);
    
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      scale: scale,
      handle: handle,
      itemCenterX,
      itemCenterY
    });
  };

  const handleDragStart = () => {
    console.log(`[${id}] Drag start`);
    setIsSelected(true);
    onSelect(id);
  };

  const handleDrag = (e: any, data: any) => {
    const newPosition = { x: data.x, y: data.y };
    console.log(`[${id}] Drag - new position:`, newPosition);
    setPosition(newPosition);
    onPositionChange(id, newPosition);
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

  // Get size based on category - using more reasonable base sizes
  const getSize = () => {
    const baseSize = 200; // Reduced from 480 to 200 for better usability
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
  const containerBounds = getContainerBounds();

  return (
    <Draggable
      position={position}
      onStart={handleDragStart}
      onDrag={handleDrag}
      disabled={isResizing}
      bounds={{
        left: 0,
        top: 0,
        right: containerBounds.width - (size.width * scale),
        bottom: containerBounds.height - (size.height * scale)
      }}
    >
      <div
        ref={itemRef}
        className={`absolute cursor-move select-none transition-all duration-150 ${
          isSelected ? 'ring-2 ring-bibabop-navy shadow-lg' : ''
        }`}
        style={{
          width: size.width * scale,
          height: size.height * scale,
          zIndex: isSelected ? 1000 : zIndex,
        }}
        onDoubleClick={handleDoubleClick}
        onClick={handleClick}
      >
        <img
          src={imageUrl}
          alt={category}
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
        
        {isSelected && !isResizing && (
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
    </Draggable>
  );
}
