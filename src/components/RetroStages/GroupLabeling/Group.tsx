import { memo, useState } from "react";
import { useRetroContext } from "@/contexts/RetroContext";
import useSocketValue from "@/hooks/useSocketValue";
import { mapRetroType, IdeaType } from "@/app/api/storage/storageHelpers";

interface GroupProps {
  retroId: string;
  groupId: string;
  name: string;
  ideaIds: string[];
}

const Group: React.FC<GroupProps> = ({ retroId, groupId, name, ideaIds }) => {
  const { retros, updateGroupName } = useRetroContext();
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
    setCurrentName(e.target.value);
    clearTimeout(timer);
    setTimer(setTimeout(() => {
      updateGroupName(retroId, groupId, e.target.value || "");
    }, 750));
  };

  return (
    <div key={groupId} className="bg-base-100 shadow-2xl p-4 flex flex-col max-h-80">
      <div className="flex justify-center relative mb-4">
        <input
          type="text"
          className="input input-bordered w-2/3 text-center"
          placeholder="Optional Group Label"
          value={currentName}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {currentName !== name && (
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
              <div key={idea.id} className="flex items-center mb-2 border-b pb-1 border-current">
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
