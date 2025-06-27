
import { useState, useRef } from "react";
import { Scale, Move } from "lucide-react";

interface DraggableClothingItemProps {
  id: string;
  imageUrl: string;
  category: string;
  initialPosition: { x: number; y: number };
  initialScale: number;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onScaleChange: (id: string, scale: number) => void;
  onRemove: (id: string) => void;
}

export function DraggableClothingItem({
  id,
  imageUrl,
  category,
  initialPosition,
  initialScale,
  onPositionChange,
  onScaleChange,
  onRemove
}: DraggableClothingItemProps) {
  const [position, setPosition] = useState(initialPosition);
  const [scale, setScale] = useState(initialScale);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
      setIsDragging(true);
      setIsSelected(true);
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
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    onScaleChange(id, newScale);
  };

  const handleDoubleClick = () => {
    onRemove(id);
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
    <>
      <div
        ref={itemRef}
        className={`absolute cursor-move select-none transition-all duration-150 ${
          isSelected ? 'ring-2 ring-bibabop-pink shadow-lg' : ''
        } ${isDragging ? 'z-50' : 'z-10'}`}
        style={{
          left: position.x,
          top: position.y,
          width: size.width * scale,
          height: size.height * scale,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onClick={(e) => {
          e.stopPropagation();
          setIsSelected(true);
        }}
      >
        <img
          src={imageUrl}
          alt={category}
          className="w-full h-full object-contain pointer-events-none"
          style={{ opacity: isDragging ? 0.8 : 1 }}
          draggable={false}
        />
        
        {isSelected && !isDragging && (
          <>
            {/* Move handle */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-bibabop-pink rounded-full flex items-center justify-center text-white cursor-move shadow-lg">
              <Move size={12} />
            </div>
            
            {/* Scale handle */}
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-bibabop-navy rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg">
              <Scale size={12} />
            </div>
            
            {/* Remove hint */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Double-cliquez pour retirer
            </div>
          </>
        )}
      </div>

      {/* Scale slider when selected */}
      {isSelected && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 flex items-center gap-3 z-50">
          <Scale size={16} className="text-bibabop-navy" />
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-sm font-medium min-w-[3rem]">{Math.round(scale * 100)}%</span>
        </div>
      )}
    </>
  );
}
