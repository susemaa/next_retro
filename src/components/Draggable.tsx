import { memo, useEffect, useState, useRef } from "react";
import { IdeaType } from "@/contexts/RetroContext";

interface DraggableProps {
  type: IdeaType;
  ideaId: string;
  left: number;
  top: number;
  zIndex: number;
  idea: string;
  scale: { x: number; y: number };
  onMouseDown: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  shouldHighlight: boolean;
  isDragging: boolean;
}

const Draggable: React.FC<DraggableProps> = ({
  type,
  ideaId,
  left,
  top,
  zIndex,
  idea,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  scale,
  shouldHighlight,
  isDragging,
}) => {

  return (
    <span
      id={ideaId}
      className={`border absolute select-none whitespace-nowrap max-w-xs ${shouldHighlight && "border-red-700"}`}
      style={{
        left: `${left * scale.x}px`,
        top: `${top * scale.y}px`,
        zIndex,
        transformOrigin: "top left",
        transform: `scale(${scale.x}, ${scale.y})`,
        pointerEvents: isDragging ? "none" : "auto",
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
