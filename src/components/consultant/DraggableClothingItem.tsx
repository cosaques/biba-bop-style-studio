
import { Rnd } from "react-rnd";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import { getImageDimensions, calculateOptimalSize } from "@/utils/imageLoadUtils";
import { useState, useRef } from "react";

interface DraggableClothingItemProps {
  id: string;
  imageUrl: string;
  category: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isSelected: boolean;
  zIndex: number;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSizeChange: (id: string, size: { width: number; height: number }) => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  containerBounds: { width: number; height: number };
}

export function DraggableClothingItem({
  id,
  imageUrl,
  category,
  position,
  size,
  isSelected,
  zIndex,
  onPositionChange,
  onSizeChange,
  onSelect,
  onRemove,
  containerBounds
}: DraggableClothingItemProps) {
  const optimizedImageUrl = getOptimizedImageUrl(imageUrl, 400);
  const shortId = id.slice(-8);
  const [isResizing, setIsResizing] = useState(false);
  const pendingUpdatesRef = useRef<{
    size?: { width: number; height: number };
    position?: { x: number; y: number };
  }>({});

  console.log(`[RENDER-${shortId}] Component render:`, JSON.stringify({
    position,
    size,
    isSelected,
    isResizing,
    containerBounds,
    category,
    timestamp: Date.now()
  }));

  const calculateAspectRatioSize = async (containerSize: { width: number; height: number }): Promise<{ width: number; height: number }> => {
    try {
      const dimensions = await getImageDimensions(optimizedImageUrl);
      const imageAspectRatio = dimensions.width / dimensions.height;
      const containerAspectRatio = containerSize.width / containerSize.height;
      
      let finalSize;
      if (imageAspectRatio > containerAspectRatio) {
        finalSize = {
          width: containerSize.width,
          height: containerSize.width / imageAspectRatio
        };
      } else {
        finalSize = {
          width: containerSize.height * imageAspectRatio,
          height: containerSize.height
        };
      }
      
      console.log(`[ASPECT-RATIO-${shortId}] Calculated:`, JSON.stringify({
        originalDimensions: dimensions,
        imageAspectRatio,
        containerSize,
        finalSize,
        timestamp: Date.now()
      }));
      
      return finalSize;
    } catch (error) {
      console.error(`[ASPECT-RATIO-${shortId}] Failed:`, error);
      return containerSize;
    }
  };

  const handleDragStart = () => {
    console.log(`[DRAG-START-${shortId}] Drag initiated:`, JSON.stringify({ 
      position, 
      category,
      timestamp: Date.now()
    }));
    onSelect(id);
  };

  const handleDragStop = (e: any, data: any) => {
    const newPosition = { x: data.x, y: data.y };
    console.log(`[DRAG-END-${shortId}] Drag completed:`, JSON.stringify({ 
      oldPosition: position, 
      newPosition,
      category,
      timestamp: Date.now()
    }));
    onPositionChange(id, newPosition);
  };

  const handleResizeStart = () => {
    console.log(`[RESIZE-START-${shortId}] Resize initiated:`, JSON.stringify({ 
      size, 
      category,
      position,
      timestamp: Date.now()
    }));
    setIsResizing(true);
    pendingUpdatesRef.current = {};
    onSelect(id);
  };

  const handleResizeStop = async (e: any, direction: any, ref: any, delta: any, newPosition: any) => {
    console.log(`[RESIZE-PHASE-1-${shortId}] Resize completed - getting DOM dimensions:`, JSON.stringify({
      timestamp: Date.now()
    }));

    const resizedContainerSize = {
      width: ref.offsetWidth,
      height: ref.offsetHeight
    };
    const actualPosition = { x: newPosition.x, y: newPosition.y };
    
    const currentCenter = {
      x: actualPosition.x + resizedContainerSize.width / 2,
      y: actualPosition.y + resizedContainerSize.height / 2
    };
    
    console.log(`[RESIZE-PHASE-2-${shortId}] Before aspect ratio calculation:`, JSON.stringify({ 
      oldSize: size, 
      resizedContainerSize,
      oldPosition: position,
      newPosition: actualPosition,
      currentCenter,
      category,
      direction,
      delta: { width: delta.width, height: delta.height },
      timestamp: Date.now()
    }));
    
    console.log(`[RESIZE-PHASE-3-${shortId}] Starting aspect ratio calculation:`, JSON.stringify({
      timestamp: Date.now()
    }));

    const aspectRatioSize = await calculateAspectRatioSize(resizedContainerSize);
    
    console.log(`[RESIZE-PHASE-4-${shortId}] Aspect ratio calculation completed:`, JSON.stringify({
      aspectRatioSize,
      timestamp: Date.now()
    }));
    
    const centeredPosition = {
      x: currentCenter.x - aspectRatioSize.width / 2,
      y: currentCenter.y - aspectRatioSize.height / 2
    };
    
    console.log(`[RESIZE-PHASE-5-${shortId}] Final calculations before state update:`, JSON.stringify({
      resizedContainerSize,
      aspectRatioSize,
      currentCenter,
      centeredPosition,
      timestamp: Date.now()
    }));
    
    // Store pending updates
    pendingUpdatesRef.current = {
      size: aspectRatioSize,
      position: centeredPosition
    };
    
    console.log(`[RESIZE-PHASE-6-${shortId}] Applying batch updates:`, JSON.stringify({
      newSize: aspectRatioSize,
      newPosition: centeredPosition,
      timestamp: Date.now()
    }));
    
    // Apply updates in batch
    onSizeChange(id, aspectRatioSize);
    onPositionChange(id, centeredPosition);
    
    // Reset resizing state after a brief delay to prevent flicker
    setTimeout(() => {
      setIsResizing(false);
      pendingUpdatesRef.current = {};
      console.log(`[RESIZE-COMPLETE-${shortId}] Resize operation completed:`, JSON.stringify({
        finalSize: aspectRatioSize,
        finalPosition: centeredPosition,
        timestamp: Date.now()
      }));
    }, 50);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[DOUBLE-CLICK-${shortId}] Item removal:`, JSON.stringify({ 
      category,
      timestamp: Date.now()
    }));
    onRemove(id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[CLICK-${shortId}] Item selected:`, JSON.stringify({ 
      category,
      timestamp: Date.now()
    }));
    onSelect(id);
  };

  // Mobile touch handling - improved for better mobile experience
  let touchStartTime = 0;
  let touchTimeout: NodeJS.Timeout;
  let isLongPress = false;

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    touchStartTime = Date.now();
    isLongPress = false;
    
    // Long press for delete (1 second)
    touchTimeout = setTimeout(() => {
      isLongPress = true;
      console.log(`[LONG-PRESS-${shortId}] Item removal via long press:`, JSON.stringify({ 
        category,
        timestamp: Date.now()
      }));
      onRemove(id);
    }, 1000);
    
    onSelect(id);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    clearTimeout(touchTimeout);
    
    const touchDuration = Date.now() - touchStartTime;
    
    // If it was a short touch (not a long press), treat as selection
    if (!isLongPress && touchDuration < 500) {
      console.log(`[TOUCH-SELECT-${shortId}] Item selected via touch:`, JSON.stringify({ 
        category,
        duration: touchDuration,
        timestamp: Date.now()
      }));
      onSelect(id);
    }
  };

  // Use pending updates during resize to prevent flicker
  const currentSize = isResizing && pendingUpdatesRef.current.size ? pendingUpdatesRef.current.size : size;
  const currentPosition = isResizing && pendingUpdatesRef.current.position ? pendingUpdatesRef.current.position : position;

  return (
    <Rnd
      size={currentSize}
      position={currentPosition}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      bounds="parent"
      minWidth={30}
      minHeight={30}
      maxWidth={containerBounds.width}
      maxHeight={containerBounds.height}
      enableResizing={isSelected}
      disableDragging={false}
      style={{
        zIndex: isSelected ? 1000 : zIndex
      }}
      resizeHandleStyles={{
        topLeft: { 
          width: '12px', 
          height: '12px', 
          backgroundColor: '#3B82F6',
          border: '2px solid white',
          borderRadius: '2px'
        },
        topRight: { 
          width: '12px', 
          height: '12px', 
          backgroundColor: '#3B82F6',
          border: '2px solid white',
          borderRadius: '2px'
        },
        bottomLeft: { 
          width: '12px', 
          height: '12px', 
          backgroundColor: '#3B82F6',
          border: '2px solid white',
          borderRadius: '2px'
        },
        bottomRight: { 
          width: '12px', 
          height: '12px', 
          backgroundColor: '#3B82F6',
          border: '2px solid white',
          borderRadius: '2px'
        }
      }}
    >
      <div
        className="w-full h-full cursor-move relative"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        {/* Selection border as overlay */}
        {isSelected && (
          <div 
            className="absolute pointer-events-none border-2 border-dashed border-blue-500"
            style={{
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px'
            }}
          />
        )}
        
        <img
          src={optimizedImageUrl}
          alt={category}
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
        
        {isSelected && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Double-cliquez pour retirer
          </div>
        )}
      </div>
    </Rnd>
  );
}
