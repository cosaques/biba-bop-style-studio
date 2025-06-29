

import { Rnd } from "react-rnd";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

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

  console.log(`[BOUNDS-${shortId}] Component render:`, JSON.stringify({
    position,
    size,
    isSelected,
    containerBounds,
    category
  }));

  const handleDragStart = () => {
    console.log(`[DRAG-${shortId}] Drag started:`, JSON.stringify({ 
      position, 
      category,
      boundingBox: { ...position, ...size },
      isSelected
    }));
    onSelect(id);
  };

  const handleDragStop = (e: any, data: any) => {
    const newPosition = { x: data.x, y: data.y };
    console.log(`[DRAG-${shortId}] Drag completed:`, JSON.stringify({ 
      oldPosition: position, 
      newPosition,
      category,
      boundingBoxBefore: { ...position, ...size },
      boundingBoxAfter: { ...newPosition, ...size }
    }));
    onPositionChange(id, newPosition);
  };

  const handleResizeStart = () => {
    console.log(`[RESIZE-${shortId}] Resize started:`, JSON.stringify({ 
      size, 
      category,
      position,
      boundingBox: { ...position, ...size },
      isSelected
    }));
    onSelect(id);
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, newPosition: any) => {
    // Get the actual DOM dimensions after resize
    const actualSize = {
      width: ref.offsetWidth,
      height: ref.offsetHeight
    };
    const actualPosition = { x: newPosition.x, y: newPosition.y };
    
    console.log(`[RESIZE-${shortId}] Resize completed:`, JSON.stringify({ 
      oldSize: size, 
      newSize: actualSize,
      oldPosition: position,
      newPosition: actualPosition,
      category,
      oldBoundingBox: { ...position, ...size },
      newBoundingBox: { ...actualPosition, ...actualSize },
      direction,
      delta: { width: delta.width, height: delta.height },
      refDimensions: { width: ref.offsetWidth, height: ref.offsetHeight }
    }));
    
    // Update with actual DOM dimensions
    onSizeChange(id, actualSize);
    onPositionChange(id, actualPosition);
    
    console.log(`[RESIZE-${shortId}] State updates sent:`, JSON.stringify({
      sizeUpdate: actualSize,
      positionUpdate: actualPosition,
      expectedBoundingBox: { ...actualPosition, ...actualSize }
    }));
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[DELETE-${shortId}] Double-click remove:`, JSON.stringify({ 
      category,
      finalBoundingBox: { ...position, ...size }
    }));
    onRemove(id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clickPosition = { x: e.clientX, y: e.clientY };
    const relativeClick = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    const currentBounds = e.currentTarget.getBoundingClientRect();
    
    console.log(`[CLICK-DEBUG-${shortId}] Click details:`, JSON.stringify({
      category,
      currentBoundingBox: { ...position, ...size },
      clickPosition,
      relativeClick,
      currentBounds: { 
        width: currentBounds.width, 
        height: currentBounds.height,
        x: currentBounds.x,
        y: currentBounds.y
      },
      elementSize: {
        offsetWidth: (e.currentTarget as HTMLElement).offsetWidth,
        offsetHeight: (e.currentTarget as HTMLElement).offsetHeight
      },
      isCurrentlySelected: isSelected
    }));
    
    console.log(`[SELECT-${shortId}] Item selected:`, JSON.stringify({ 
      category,
      currentBoundingBox: { ...position, ...size },
      clickPosition,
      isCurrentlySelected: isSelected
    }));
    onSelect(id);
  };

  return (
    <Rnd
      size={size}
      position={position}
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
        zIndex: isSelected ? 1000 : zIndex,
        border: isSelected ? '2px dashed #3B82F6' : 'none',
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
        className="w-full h-full cursor-move"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
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
