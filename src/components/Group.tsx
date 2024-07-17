import { memo, useState, useRef, useEffect } from "react";
import { useRetroContext, IdeaType, Idea as IdeaInterface } from "@/contexts/RetroContext";
import useSocketValue from "@/hooks/useSocketValue";

interface GroupProps {
  retroId: string;
  groupId: string;
  name: string;
}

const Group: React.FC<GroupProps> = ({ retroId, groupId, name }) => {
  const { retros, updateGroupName } = useRetroContext();
  const [currentName, setCurrentName] = useSocketValue(() => {
    return Object.entries(retros[retroId].groups)
      .find(([iterGroupId, _group]) => iterGroupId === groupId)?.[1].name;
  }, [retros, retroId, groupId]);
  const [timer, setTimer] = useState<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

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
        {retros[retroId].groups[groupId].ideas.map((ideaId: string) => {
          const ideaData = Object.keys(retros[retroId].ideas).reduce(
            (acc: { idea: IdeaInterface | undefined; type: string | undefined }, type) => {
              const idea = retros[retroId].ideas[type as IdeaType].find((idea) => idea?.id === ideaId);
              if (idea) {
                return { idea, type };
              }
              return acc;
            },
            { idea: undefined, type: undefined }
          );
          return (
            ideaData.idea && (
              <div key={ideaData.idea.id} className="flex items-center mb-2 border-b pb-1 border-current">
                <span className="mr-2">
                  {ideaData.type === "happy" ? "😊" : ideaData.type === "sad" ? "😢" : "😕"}
                </span>
                <span>{ideaData.idea.idea}</span>
              </div>
            )
          );
        })}
      </div>
    </div>
  );
};

export default memo(Group);
