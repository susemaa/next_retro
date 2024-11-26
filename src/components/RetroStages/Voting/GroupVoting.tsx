import { memo, useState, useRef, useEffect } from "react";
import { useRetroContext } from "@/contexts/RetroContext";
import { IdeaType, mapRetroType } from "@/app/api/storage/storageHelpers";
import { useActualSession } from "@/hooks/useActualSession";

interface GroupVoting {
  retroId: string;
  groupId: string;
  name: string;
  userVotes: number;
  ideaIds: string[];
}

const GroupVoting: React.FC<GroupVoting> = ({ retroId, groupId, name, userVotes, ideaIds }) => {
  const { retros, voteAdd, voteSubstract, getGroup } = useRetroContext();
  const { data } = useActualSession();
  const [groupVotes, setGroupVotes] = useState(
    getGroup(retroId, groupId)?.votes.filter(email => email === data?.user?.email || "")
  );

  useEffect(() => {
    setGroupVotes(
      getGroup(retroId, groupId)?.votes.filter(email => email === data?.user?.email || "")
    );
  }, [retroId, groupId, retros, data?.user?.email, getGroup]);

  const handleAdd = () => {
    if (data?.user?.email) {
      voteAdd(retroId, groupId, data.user.email);
    }
  };

  const handleSubstract = () => {
    if (data?.user?.email) {
      voteSubstract(retroId, groupId, data.user.email);
    }
  };

  return (
    <div key={groupId} className="bg-base-100 shadow-2xl p-4 flex flex-col max-h-80">
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
            <button
              className="btn btn-outline btn-xs"
              onClick={handleSubstract}
              disabled={!getGroup(retroId, groupId)?.votes.includes(data?.user?.email || "")}
            >
              -
            </button>
            <span className="text-lg">{groupVotes?.length}</span>
            <button
              className="btn btn-outline btn-xs"
              onClick={handleAdd}
              disabled={userVotes === 0}
            >
              +
            </button>
          </div>
        </div>
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

export default memo(GroupVoting);
