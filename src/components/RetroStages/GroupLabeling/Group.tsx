import { memo, useState } from "react";
import { useRetroContext } from "@/contexts/RetroContext";
import useSocketValue from "@/hooks/useSocketValue";
import { mapRetroType, IdeaType } from "@/app/api/storage/storageHelpers";
import useAuthor from "@/hooks/useAuthor";
import { Idea } from "@prisma/client";

interface GroupProps {
  retroId: string;
  groupId: string;
  name: string;
  ideaIds: string[];
  draggingIdea: Idea | null;
  setDraggingIdea: React.Dispatch<React.SetStateAction<Idea | null>>
}

const Group: React.FC<GroupProps> = ({
  retroId,
  groupId,
  name,
  ideaIds,
  draggingIdea,
  setDraggingIdea,
}) => {
  const { retros, updateGroupName, changeIdeaGroup } = useRetroContext();
  const author = useAuthor(retros[retroId].createdBy);
  const canModify = author || retros[retroId].canUsersLabelGroups;
  const [currentName, setCurrentName] = useSocketValue(() => {
    return retros[retroId].groups
      .find((group) => group.id === groupId)?.name;
  }, [retros, retroId, groupId]);
  const [timer, setTimer] = useState<NodeJS.Timeout | undefined>(undefined);

  const handleBlur = () => {
    updateGroupName(retroId, groupId, currentName || "");
    clearTimeout(timer);
    setTimer(undefined);
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const newValue = e.target.value.slice(0, 20);
    setCurrentName(newValue);
    clearTimeout(timer);
    setTimer(setTimeout(() => {
      updateGroupName(retroId, groupId, newValue || "");
    }, 750));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDrop = (groupId: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    if (draggingIdea) {
      changeIdeaGroup(retroId, draggingIdea.id, groupId);
      setDraggingIdea(null);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleIdeaDragStart = (idea: Idea) => (e: React.DragEvent<HTMLDivElement>) => {
    if (author) {
      setDraggingIdea(idea);
    }
  };

  return (
    <div
      id={`group_${groupId}`}
      key={groupId}
      className="bg-base-100 shadow-2xl p-4 flex flex-col max-h-80"
      onDragOver={handleDragOver}
      onDrop={handleDrop(groupId)}
      onDragLeave={handleDragLeave}
    >
      <div className="flex justify-center relative mb-4">
        {canModify ? (
          <input
            type="text"
            className="input input-bordered w-2/3 text-center"
            placeholder="Optional Group Label"
            value={currentName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        ) : (
          <div className="w-2/3 text-center">
            {name ? (
              <b className="text-lg underline">
                {name}
              </b>
            ) : (
              <span className="opacity-50 text-lg">
                Unlabeled
              </span>
            )}
          </div>
        )}
        {currentName !== name && canModify && (
          <span
            className="absolute loading loading-spinner loading-s"
            style={{
              top: "50%",
              left: "calc(85% + 15px)",
              transform: "translate(-50%, -50%)"
            }}
          />
        )}
      </div>
      <div className="overflow-y-auto shadow-inner">
        {retros[retroId] && retros[retroId].ideas.map((idea) => {
          if (ideaIds.includes(idea.id)) {
            return (
              <div
                key={idea.id}
                className="flex items-center mb-2 border-b pb-1 border-current"
                draggable
                onDragStart={handleIdeaDragStart(idea)}
              >
                <span className="mr-2">
                  {mapRetroType(retros[retroId].retroType, idea.type as IdeaType).emoji}
                </span>
                <span>{idea.idea}</span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default memo(Group);
