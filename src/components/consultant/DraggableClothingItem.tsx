
import { Rnd } from "react-rnd";
import { getOptimizedImageUrl } from "@/utils/imageUtils";
import { getImageDimensions, calculateOptimalSize } from "@/utils/imageLoadUtils";

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

  const calculateAspectRatioSize = async (containerSize: { width: number; height: number }): Promise<{ width: number; height: number }> => {
    try {
      const dimensions = await getImageDimensions(optimizedImageUrl);
      const imageAspectRatio = dimensions.width / dimensions.height;
      const containerAspectRatio = containerSize.width / containerSize.height;
      
      let finalSize;
      if (imageAspectRatio > containerAspectRatio) {
        // Image is wider than container - fit to width
        finalSize = {
          width: containerSize.width,
          height: containerSize.width / imageAspectRatio
        };
      } else {
        // Image is taller than container - fit to height
        finalSize = {
          width: containerSize.height * imageAspectRatio,
          height: containerSize.height
        };
      }
      
      return finalSize;
    } catch (error) {
      console.error('Failed to calculate aspect ratio:', error);
      return containerSize; // Fallback to container size
    }
  };

  const handleDragStart = () => {
    onSelect(id);
  };

  const handleDragStop = (e: any, data: any) => {
    const newPosition = { x: data.x, y: data.y };
    onPositionChange(id, newPosition);
  };

  const handleResizeStart = () => {
    onSelect(id);
  };

  const handleResizeStop = async (e: any, direction: any, ref: any, delta: any, newPosition: any) => {
    // Get the actual DOM dimensions after resize
    const resizedContainerSize = {
      width: ref.offsetWidth,
      height: ref.offsetHeight
    };
    const actualPosition = { x: newPosition.x, y: newPosition.y };
    
    // Calculate the center point of the current resized container
    const currentCenter = {
      x: actualPosition.x + resizedContainerSize.width / 2,
      y: actualPosition.y + resizedContainerSize.height / 2
    };
    
    // Calculate the size that respects the image's aspect ratio
    const aspectRatioSize = await calculateAspectRatioSize(resizedContainerSize);
    
    // Calculate the new position to maintain the center point
    const centeredPosition = {
      x: currentCenter.x - aspectRatioSize.width / 2,
      y: currentCenter.y - aspectRatioSize.height / 2
    };
    
    // Update with aspect ratio adjusted dimensions and centered position
    onSizeChange(id, aspectRatioSize);
    onPositionChange(id, centeredPosition);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        {/* Selection border overlay - positioned absolutely to not affect image dimensions */}
        {isSelected && (
          <div 
            className="absolute inset-0 border-2 border-dashed border-blue-500 pointer-events-none"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
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
