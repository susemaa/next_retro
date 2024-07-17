"use client";
import { memo, useState, useRef, useEffect } from "react";
import { useRetroContext, ActionItem as ActionItemInterface } from "@/contexts/RetroContext";
import useSocketValue from "@/hooks/useSocketValue";

interface ActionItemProps {
  actionItem: ActionItemInterface;
  id: string;
  retroId: string;
  finished?: boolean;
}

const ActionItem: React.FC<ActionItemProps> = ({ actionItem, id, retroId, finished }) => {
  const { removeActionItem, updateActionItem, retros } = useRetroContext();
  const [currentItem, setCurrentItem] = useSocketValue(() => {
    return retros[retroId].actionItems.find(item => item.id === id) as ActionItemInterface;
  }, [retros, retroId, id]);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRemove = () => {
    removeActionItem(retroId, id);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setCurrentItem(actionItem);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateActionItem(retroId, id, retros[retroId].actionItems.find(item => item.id === id)!.assignedUser, currentItem.name);
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
      className="flex justify-between items-center border-b pb-1 border-b border-current mb-4"
    >
      {editing ? (
        <form id={`edit-form-${id}`} onSubmit={handleSubmit} className="flex-grow">
          <input
            ref={inputRef}
            value={currentItem.name}
            onChange={(e) => setCurrentItem(prev => ({ ...prev, name: e.target.value }))}
            className="border-none outline-none bg-transparent w-full"
          />
        </form>
      ) : (
        <span className="whitespace-nowrap overflow-x-auto">{currentItem.name} ({currentItem.assignedUser.name})</span>
      )}
      {!finished && <div className="flex space-x-2">
        {editing
          ?
          <>
            <button form={`edit-form-${id}`} type="submit" className="btn btn-xs btn-outline btn-circle btn-success">✓</button>
            <button className="btn btn-xs btn-outline btn-circle btn-error" onClick={handleCancel}>x</button>
          </>
          :
          <>
            {currentItem !== actionItem && <span className="loading loading-spinner loading-xs"></span>}
            <button className="btn btn-xs btn-outline btn-circle" onClick={handleEdit}>✏️</button>
            <button className="btn btn-xs btn-outline btn-circle" onClick={handleRemove}>x</button>
          </>
        }
      </div>}
    </div>
  );
};

export default memo(ActionItem);
