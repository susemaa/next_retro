import { memo } from "react";

interface DraggableProps {
  ideaId: string;
  left: number;
  top: number;
  zIndex: number;
  idea: string;
  scale: { x: number; y: number };
  onMouseDown: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  groupNumber: number;
  isDragging: boolean;
}

const Draggable: React.FC<DraggableProps> = ({
  ideaId,
  left,
  top,
  zIndex,
  idea,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  scale,
  groupNumber,
  isDragging,
}) => {
  const colors = ["red", "blue", "green", "yellow", "purple", "orange"];

  return (
    <span
      id={ideaId}
      className="border absolute select-none p-2 whitespace-nowrap rounded-md max-w-xs"
      style={{
        left: `${left * scale.x}px`,
        top: `${top * scale.y}px`,
        zIndex,
        transformOrigin: "top left",
        transform: `scale(${scale.x}, ${scale.y})`,
        pointerEvents: isDragging ? "none" : "auto",
        borderColor: `${groupNumber === -1 ? "white" : colors[groupNumber % colors.length]}`,
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {idea}
    </span>
  );
};

export default memo(Draggable);
