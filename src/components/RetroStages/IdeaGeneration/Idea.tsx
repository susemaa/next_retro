"use client";
import { memo, useState, useRef, useEffect } from "react";
import { useRetroContext } from "@/contexts/RetroContext";
import { IdeaType } from "@/app/api/storage/storageHelpers";
import useSocketValue from "@/hooks/useSocketValue";

interface IdeaProps {
  type: IdeaType;
  idea: string;
  id: string;
  retroId: string;
  onDragStart: React.DragEventHandler<HTMLDivElement>;
}

const Idea: React.FC<IdeaProps> = ({ type, idea, id, retroId, onDragStart }) => {
  const { removeIdea, updateIdea, retros } = useRetroContext();
  const [currentIdea, setCurrentIdea] = useSocketValue(() => {
    return retros[retroId].ideas.find((idea) => idea.id === id)?.idea;
  }, [retros, retroId, id]);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRemove = () => {
    removeIdea(retroId, id);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setCurrentIdea(idea);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateIdea(retroId, id, type, currentIdea || "");
    setEditing(false);
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  return (
    <div
      className="flex justify-between items-center border-b pb-1 border-b border-current mb-4 cursor-move"
      draggable
      onDragStart={onDragStart}
    >
      {editing ? (
        <form id={`edit-form-${id}`} onSubmit={handleSubmit} className="flex-grow">
          <input
            ref={inputRef}
            value={currentIdea}
            onChange={(e) => setCurrentIdea(e.target.value)}
            className="border-none outline-none bg-transparent w-full"
          />
        </form>
      ) : (
        <span className="whitespace-nowrap overflow-x-auto">{currentIdea}</span>
      )}
      <div className="flex space-x-2">
        {editing
          ?
          <>
            <button form={`edit-form-${id}`} type="submit" className="btn btn-xs btn-outline btn-circle btn-success">✓</button>
            <button className="btn btn-xs btn-outline btn-circle btn-error" onClick={handleCancel}>x</button>
          </>
          :
          <>
            {currentIdea !== idea && <span className="loading loading-spinner loading-xs"></span>}
            <button className="btn btn-xs btn-outline btn-circle" onClick={handleEdit}>✏️</button>
            <button className="btn btn-xs btn-outline btn-circle" onClick={handleRemove}>x</button>
          </>
        }
      </div>
    </div>
  );
};

export default memo(Idea);
