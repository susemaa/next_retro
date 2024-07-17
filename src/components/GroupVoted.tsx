import { memo, useState, useRef, useEffect } from "react";
import { useRetroContext, IdeaType, Idea as IdeaInterface } from "@/contexts/RetroContext";

interface GroupVoted {
  retroId: string;
  groupId: string;
  name: string;
}

const GroupVoted: React.FC<GroupVoted> = ({ retroId, groupId, name }) => {
  const { retros } = useRetroContext();
  const [groupVotes, setGroupVotes] = useState(
    retros[retroId].groups[groupId].votes
  );

  useEffect(() => {
    setGroupVotes(
      retros[retroId].groups[groupId].votes
    );
  }, [retroId, groupId, retros]);

  return (
    <div key={groupId} className="bg-base-100 shadow-2xl p-4 flex flex-col h-auto">
      <div className="flex justify-center relative mb-4">
        <div
          className="w-2/3 text-center"
        >
          {name ? (
            <b className="text-lg underline">
              {name}
            </b>
          ) : (
            <span className="opacity-50 text-lg">
              Unlabeled
            </span>
          )}
          <div className="flex justify-center items-center space-x-2 mt-2">
						Votes&nbsp;<span className="text-lg">{groupVotes.length}</span>
          </div>
        </div>
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

export default memo(GroupVoted);
