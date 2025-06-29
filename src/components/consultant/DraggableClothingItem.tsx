
import { useEffect, useState } from 'react';
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
  const [currentSize, setCurrentSize] = useState(size);
  const [currentPosition, setCurrentPosition] = useState(position);
  const shortId = id.slice(-8);

  // Update local state when props change
  useEffect(() => {
    setCurrentSize(size);
  }, [size]);

  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handleDragStart = () => {
    console.log(`[DRAG-${shortId}] Drag started`, { position: currentPosition, category });
    onSelect(id);
  };

  const handleDragStop = (e: any, data: any) => {
    const newPosition = { x: data.x, y: data.y };
    console.log(`[DRAG-${shortId}] Drag completed`, { 
      oldPosition: currentPosition, 
      newPosition,
      category 
    });
    setCurrentPosition(newPosition);
    onPositionChange(id, newPosition);
  };

  const handleResizeStart = () => {
    console.log(`[RESIZE-${shortId}] Resize started`, { size: currentSize, category });
    onSelect(id);
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, newPosition: any) => {
    const newSize = {
      width: ref.offsetWidth,
      height: ref.offsetHeight
    };
    const finalPosition = { x: newPosition.x, y: newPosition.y };
    
    console.log(`[RESIZE-${shortId}] Resize completed`, { 
      oldSize: currentSize, 
      newSize,
      oldPosition: currentPosition,
      newPosition: finalPosition,
      category 
    });
    
    // Update local state immediately
    setCurrentSize(newSize);
    setCurrentPosition(finalPosition);
    
    // Notify parent components
    onSizeChange(id, newSize);
    onPositionChange(id, finalPosition);
    
    // Clear selection after resize to trigger bounding box recalculation
    setTimeout(() => {
      console.log(`[RESIZE-${shortId}] Auto-clearing selection after resize`);
      // Don't call onSelect(null) directly, let the parent handle this
    }, 50);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[DELETE-${shortId}] Double-click remove`, { category });
    onRemove(id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[SELECT-${shortId}] Item selected`, { category });
    onSelect(id);
  };

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
        zIndex: isSelected ? 1000 : zIndex,
      }}
      className={isSelected ? 'border-2 border-dashed border-blue-500' : ''}
      resizeHandleStyles={{
        topLeft: { 
          width: '8px', 
          height: '8px', 
          backgroundColor: '#3B82F6',
          border: '2px solid white',
          borderRadius: '2px',
          left: '-4px',
          top: '-4px'
        },
        topRight: { 
          width: '8px', 
          height: '8px', 
          backgroundColor: '#3B82F6',
          border: '2px solid white',
          borderRadius: '2px',
          right: '-4px',
          top: '-4px'
        },
        bottomLeft: { 
          width: '8px', 
          height: '8px', 
          backgroundColor: '#3B82F6',
          border: '2px solid white',
          borderRadius: '2px',
          left: '-4px',
          bottom: '-4px'
        },
        bottomRight: { 
          width: '8px', 
          height: '8px', 
          backgroundColor: '#3B82F6',
          border: '2px solid white',
          borderRadius: '2px',
          right: '-4px',
          bottom: '-4px'
        }
      }}
    >
      <div
        className="w-full h-full cursor-move bg-transparent"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={{ width: '100%', height: '100%' }}
      >
        <img
          src={imageUrl}
          alt={category}
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
          style={{ width: '100%', height: '100%' }}
        />
        
        {isSelected && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
            Double-cliquez pour retirer
          </div>
        )}
      </div>
    </Rnd>
  );
}
