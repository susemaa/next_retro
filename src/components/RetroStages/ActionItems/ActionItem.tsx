"use client";
import { memo, useState, useRef, useEffect } from "react";
import { ActionItem as ActionItemInterface } from "@prisma/client";
import { useRetroContext } from "@/contexts/RetroContext";
import useSocketValue from "@/hooks/useSocketValue";

interface ActionItemProps {
  actionItem: ActionItemInterface;
  id: number;
  retroId: string;
  isAuthor: boolean;
  finished?: boolean;
}

const ActionItem: React.FC<ActionItemProps> = ({
  actionItem,
  id,
  retroId,
  finished,
  isAuthor,
}) => {
  const { removeActionItem, updateActionItem, updateActionAuthor, retros } = useRetroContext();
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
    const emailToAssign = retros[retroId].actionItems.find(item => item.id === id)?.assignedEmail;
    const userToAssign = retros[retroId].everJoinedUsers.find(user => user.email === emailToAssign);
    if (userToAssign) {
      updateActionItem(retroId, id, userToAssign, currentItem.name);
      setEditing(false);
    }
  };

  const handleSelectChange = (type: "assignee" | "author") => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUser = retros[retroId].everJoinedUsers.find(user => user.name === e.target.value);
    if (type === "assignee") {
      updateActionItem(retroId, id, newUser || e.target.value as "unassigned", currentItem.name);
    } else if (type === "author") {
      updateActionAuthor(retroId, id, newUser || e.target.value as "unauthored");
    }
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
        <span>
          {retros[retroId].everJoinedUsers.find(user => user.email === currentItem.authorEmail)?.name || "Unauthored"}
          {" - "}{currentItem.name}
          {" "}({retros[retroId].everJoinedUsers.find(user => user.email === currentItem.assignedEmail)?.name || "Unassiged"})
        </span>
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
            <div className="dropdown dropdown-left">
              <button tabIndex={0} className="btn btn-xs btn-outline btn-circle">✏️</button>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <div
                    className="inline-flex cursor-pointer select-none appearance-none h-12 min-h-12 pl-4 pr-10 text-sm text-left leading-5 rounded-btn bg-fallback-b1 border border-gray-600"
                    onClick={handleEdit}
                  >
                    Text
                  </div>
                </li>
                <li>
                  <select
                    className="select select-bordered w-full"
                    onChange={handleSelectChange("assignee")}
                    value={retros[retroId].everJoinedUsers.find(user => user.email === currentItem.assignedEmail)?.name || "Unassigned"}
                  >
                    <option value="unassigned">Unassigned</option>
                    {retros[retroId].everJoinedUsers.map(user => (
                      <option key={user.email} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                </li>
                {isAuthor && <li>
                  <select
                    className="select select-bordered w-full"
                    onChange={handleSelectChange("author")}
                    value={retros[retroId].everJoinedUsers.find(user => user.email === currentItem.authorEmail)?.name || "unauthored"}
                  >
                    <option value="unauthored">Unauthored</option>
                    {retros[retroId].everJoinedUsers.map(user => (
                      <option key={user.email} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                </li>}
              </ul>
            </div>
            <button className="btn btn-xs btn-outline btn-circle" onClick={handleRemove}>x</button>
          </>
        }
      </div>}
    </div>
  );
};

export default memo(ActionItem);
