
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';
import { getImageDimensions } from '@/utils/imageLoadUtils';

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

export const DraggableClothingItem: React.FC<DraggableClothingItemProps> = ({
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
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const rndRef = useRef<Rnd>(null);

  // Get image aspect ratio
  useEffect(() => {
    const loadImageAspectRatio = async () => {
      try {
        const dimensions = await getImageDimensions(imageUrl);
        const aspectRatio = dimensions.width / dimensions.height;
        setImageAspectRatio(aspectRatio);
      } catch (error) {
        console.error('Failed to load image dimensions:', error);
        setImageAspectRatio(1); // Fallback to square
      }
    };

    if (imageUrl) {
      loadImageAspectRatio();
    }
  }, [imageUrl]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    onSelect(id);
  }, [id, onSelect]);

  const handleDragStop = useCallback((e: any, data: any) => {
    setIsDragging(false);
    onPositionChange(id, { x: data.x, y: data.y });
  }, [id, onPositionChange]);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
    onSelect(id);
  }, [id, onSelect]);

  const handleResizeStop = useCallback((e: any, direction: any, ref: any, delta: any, position: any) => {
    setIsResizing(false);
    
    // Get the container's current size
    const containerRect = ref.getBoundingClientRect();
    const resizedContainerSize = {
      width: containerRect.width,
      height: containerRect.height
    };

    // If we have the image aspect ratio, calculate the proper size maintaining aspect ratio
    if (imageAspectRatio) {
      let finalSize: { width: number; height: number };
      
      if (resizedContainerSize.width / resizedContainerSize.height > imageAspectRatio) {
        // Container is wider than image aspect ratio, fit by height
        finalSize = {
          width: resizedContainerSize.height * imageAspectRatio,
          height: resizedContainerSize.height
        };
      } else {
        // Container is taller than image aspect ratio, fit by width
        finalSize = {
          width: resizedContainerSize.width,
          height: resizedContainerSize.width / imageAspectRatio
        };
      }

      // Calculate centered position based on the new size
      const currentCenter = {
        x: position.x + resizedContainerSize.width / 2,
        y: position.y + resizedContainerSize.height / 2
      };

      const centeredPosition = {
        x: currentCenter.x - finalSize.width / 2,
        y: currentCenter.y - finalSize.height / 2
      };

      // Update size and position
      onSizeChange(id, finalSize);
      onPositionChange(id, centeredPosition);
    } else {
      // Fallback if aspect ratio not available
      onSizeChange(id, resizedContainerSize);
      onPositionChange(id, position);
    }
  }, [id, imageAspectRatio, onSizeChange, onPositionChange]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
  }, [id, onRemove]);

  const handleSingleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  }, [id, onSelect]);

  return (
    <Rnd
      ref={rndRef}
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      bounds="parent"
      style={{
        zIndex: zIndex,
        border: isSelected ? '2px solid #ff6b9d' : '2px solid transparent',
        borderRadius: '4px',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      resizeHandleStyles={{
        bottomRight: {
          bottom: -5,
          right: -5,
          width: 10,
          height: 10,
          backgroundColor: isSelected ? '#ff6b9d' : 'transparent',
          border: isSelected ? '2px solid white' : 'none',
          borderRadius: '50%',
          cursor: 'se-resize'
        },
        topLeft: {
          top: -5,
          left: -5,
          width: 10,
          height: 10,
          backgroundColor: isSelected ? '#ff6b9d' : 'transparent',
          border: isSelected ? '2px solid white' : 'none',
          borderRadius: '50%',
          cursor: 'nw-resize'
        },
        topRight: {
          top: -5,
          right: -5,
          width: 10,
          height: 10,
          backgroundColor: isSelected ? '#ff6b9d' : 'transparent',
          border: isSelected ? '2px solid white' : 'none',
          borderRadius: '50%',
          cursor: 'ne-resize'
        },
        bottomLeft: {
          bottom: -5,
          left: -5,
          width: 10,
          height: 10,
          backgroundColor: isSelected ? '#ff6b9d' : 'transparent',
          border: isSelected ? '2px solid white' : 'none',
          borderRadius: '50%',
          cursor: 'sw-resize'
        }
      }}
      enableResizing={isSelected}
    >
      <div 
        className="w-full h-full flex items-center justify-center relative bg-white rounded"
        onClick={handleSingleClick}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={imageUrl}
          alt={`Clothing item ${category}`}
          className="max-w-full max-h-full object-contain pointer-events-none"
          draggable={false}
        />
        
        {isSelected && (
          <button
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </Rnd>
  );
};
