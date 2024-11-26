import { memo } from "react";

interface DraggableProps extends React.HTMLAttributes<HTMLSpanElement> {
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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const mouseEvent = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
    });
    e.currentTarget.dispatchEvent(mouseEvent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const mouseEvent = new MouseEvent("mousemove", {
      bubbles: true,
      cancelable: true,
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
    });
    e.currentTarget.dispatchEvent(mouseEvent);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const mouseEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      clientX: e.changedTouches[0].clientX,
      clientY: e.changedTouches[0].clientY,
    });
    e.currentTarget.dispatchEvent(mouseEvent);
  };

  function stopPropagationWrapper<T extends(e: any) => void, E extends React.SyntheticEvent<any>>(handler: T): (e: E) => void {
    return (e: E) => {
      e.stopPropagation();
      handler(e);
    };
  }

  return (
    <span
      id={ideaId}
      className="border absolute select-none p-2 rounded-md max-w-xs cursor-move"
      style={{
        left: `${left * scale.x}px`,
        top: `${top * scale.y}px`,
        zIndex,
        transformOrigin: "top left",
        transform: `scale(${scale.x}, ${scale.y})`,
        pointerEvents: isDragging ? "none" : "auto",
        touchAction: "none",
        backgroundColor: "white",
        borderColor: `${groupNumber === -1 ? "black" : colors[groupNumber % colors.length]}`,
      }}
      onMouseDown={stopPropagationWrapper(onMouseDown)}
      onMouseUp={stopPropagationWrapper(onMouseUp)}
      onMouseMove={stopPropagationWrapper(onMouseMove)}
      onTouchStart={stopPropagationWrapper(handleTouchStart)}
      onTouchMove={stopPropagationWrapper(handleTouchMove)}
      onTouchEnd={stopPropagationWrapper(handleTouchEnd)}
    >
      {idea}
    </span>
  );
};

export default memo(Draggable);
