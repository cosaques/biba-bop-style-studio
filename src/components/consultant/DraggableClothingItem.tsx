
import { useState, useRef } from "react";
import { Move } from "lucide-react";

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
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, scale: 1 });
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

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setIsSelected(true);
    onSelect(id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      scale: scale
    });
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
        const maxX = containerRect.width - (itemRef.current.offsetWidth * scale);
        const maxY = containerRect.height - (itemRef.current.offsetHeight * scale);
        
        newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
        newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));
        
        setPosition(newPosition);
        onPositionChange(id, newPosition);
      }
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const scaleFactor = deltaX > 0 || deltaY > 0 ? 1 + delta / 200 : 1 - delta / 200;
      const newScale = Math.max(0.3, Math.min(3, resizeStart.scale * scaleFactor));
      
      setScale(newScale);
      onScaleChange(id, newScale);
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

  // Get size based on category
  const getSize = () => {
    const baseSize = 80;
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
        isSelected ? 'ring-2 ring-bibabop-pink shadow-lg' : ''
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
          {/* Move handle */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-bibabop-pink rounded-full flex items-center justify-center text-white cursor-move shadow-lg">
            <Move size={12} />
          </div>
          
          {/* Corner resize handles */}
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 bg-bibabop-navy border border-white cursor-nw-resize shadow-sm"
            onMouseDown={handleResizeMouseDown}
          />
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-bibabop-navy border border-white cursor-ne-resize shadow-sm"
            onMouseDown={handleResizeMouseDown}
          />
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-bibabop-navy border border-white cursor-sw-resize shadow-sm"
            onMouseDown={handleResizeMouseDown}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-bibabop-navy border border-white cursor-se-resize shadow-sm"
            onMouseDown={handleResizeMouseDown}
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
