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
  const [imageDimensions, setImageDimensions] = useState({ width: 200, height: 200 });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const itemRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStateRef = useRef({
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    startPosition: { x: 0, y: 0 },
    startScale: 1,
    resizeHandle: 'se' as ResizeHandle,
    itemCenterX: 0,
    itemCenterY: 0,
    resizeAnchorX: 0,
    resizeAnchorY: 0
  });

  console.log(`[${id}] Component render - position:`, position, 'scale:', scale, 'isDragging:', isDragging, 'isResizing:', isResizing, 'isSelected:', isSelected, 'imageDimensions:', imageDimensions);

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

  // Load image and get its natural dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 150; // Base size for scaling
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      
      let width, height;
      if (aspectRatio > 1) {
        // Wide image
        width = maxSize;
        height = maxSize / aspectRatio;
      } else {
        // Tall image
        height = maxSize;
        width = maxSize * aspectRatio;
      }
      
      console.log(`[${id}] Image loaded - natural: ${img.naturalWidth}x${img.naturalHeight}, calculated: ${width}x${height}, aspect ratio: ${aspectRatio}`);
      
      setImageDimensions({ width, height });
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl, id]);

  // Global mouse handlers
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

        const constrainedPosition = {
          x: Math.max(0, Math.min(newPosition.x, containerBounds.current.width - (imageDimensions.width * scale))),
          y: Math.max(0, Math.min(newPosition.y, containerBounds.current.height - (imageDimensions.height * scale)))
        };

        console.log(`[${id}] Setting new position:`, constrainedPosition);
        setPosition(constrainedPosition);
        
      } else if (dragState.isResizing) {
        e.preventDefault();
        const mouseDeltaX = e.clientX - dragState.startX;
        const mouseDeltaY = e.clientY - dragState.startY;
        
        console.log(`[${id}] Resize deltas - deltaX: ${mouseDeltaX}, deltaY: ${mouseDeltaY}, handle: ${dragState.resizeHandle}`);
        
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
        console.log(`[${id}] New scale calculated:`, newScale, 'from factor:', scaleFactor);
        
        const newWidth = imageDimensions.width * newScale;
        const newHeight = imageDimensions.height * newScale;
        
        // Calculate new position to keep the opposite corner fixed
        let newPosition = { x: position.x, y: position.y };
        
        switch (dragState.resizeHandle) {
          case 'se':
            // Keep top-left corner fixed
            newPosition = {
              x: dragState.resizeAnchorX,
              y: dragState.resizeAnchorY
            };
            break;
          case 'sw':
            // Keep top-right corner fixed
            newPosition = {
              x: dragState.resizeAnchorX - newWidth,
              y: dragState.resizeAnchorY
            };
            break;
          case 'ne':
            // Keep bottom-left corner fixed
            newPosition = {
              x: dragState.resizeAnchorX,
              y: dragState.resizeAnchorY - newHeight
            };
            break;
          case 'nw':
            // Keep bottom-right corner fixed
            newPosition = {
              x: dragState.resizeAnchorX - newWidth,
              y: dragState.resizeAnchorY - newHeight
            };
            break;
        }
        
        console.log(`[${id}] Resize - new position:`, newPosition, 'anchor:', { x: dragState.resizeAnchorX, y: dragState.resizeAnchorY });
        
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
        console.log(`[${id}] Resize end - final scale:`, scale, 'final position:', position);
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
  }, [isDragging, isResizing, id, onPositionChange, onScaleChange, imageDimensions, scale, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`[${id}] Drag start - clientX: ${e.clientX}, clientY: ${e.clientY}, current position:`, position);
    
    // Always select on drag start
    onSelect(id);
    setIsDragging(true);
    
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
    
    console.log(`[${id}] Resize start - handle: ${handle}, clientX: ${e.clientX}, clientY: ${e.clientY}, current position:`, position, 'scale:', scale);
    
    onSelect(id);
    setIsResizing(true);
    
    // Calculate the anchor point (opposite corner that should stay fixed)
    let anchorX, anchorY;
    switch (handle) {
      case 'se':
        // Anchor at top-left
        anchorX = position.x;
        anchorY = position.y;
        break;
      case 'sw':
        // Anchor at top-right
        anchorX = position.x + imageDimensions.width * scale;
        anchorY = position.y;
        break;
      case 'ne':
        // Anchor at bottom-left
        anchorX = position.x;
        anchorY = position.y + imageDimensions.height * scale;
        break;
      case 'nw':
        // Anchor at bottom-right
        anchorX = position.x + imageDimensions.width * scale;
        anchorY = position.y + imageDimensions.height * scale;
        break;
    }
    
    console.log(`[${id}] Resize anchor point set:`, { anchorX, anchorY });
    
    dragStateRef.current = {
      ...dragStateRef.current,
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startScale: scale,
      resizeHandle: handle,
      resizeAnchorX: anchorX,
      resizeAnchorY: anchorY
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
    onSelect(id);
  };

  // Don't render until image is loaded to avoid layout shifts
  if (!imageLoaded) {
    return null;
  }

  return (
    <div
      ref={itemRef}
      className={`absolute select-none transition-all duration-150 ${
        isSelected ? 'ring-2 ring-bibabop-navy shadow-lg' : ''
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: position.x,
        top: position.y,
        width: imageDimensions.width * scale,
        height: imageDimensions.height * scale,
        zIndex: isSelected ? 1000 : zIndex,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      <img
        ref={imageRef}
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
