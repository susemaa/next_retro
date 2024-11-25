"use client";
import { memo, useState, useEffect } from "react";
import { useRetroContext } from "@/contexts/RetroContext";
import { IdeaType, mapRetroType } from "@/app/api/storage/storageHelpers";

interface GroupVoted {
  retroId: string;
  groupId: string;
  name: string;
  ideaIds: string[];
}

const GroupVoted: React.FC<GroupVoted> = ({ retroId, groupId, name, ideaIds }) => {
  const { retros, getGroup } = useRetroContext();
  const [groupVotes, setGroupVotes] = useState(
    getGroup(retroId, groupId)?.votes || []
  );

  useEffect(() => {
    const group = getGroup(retroId, groupId);
    if (group) {
      setGroupVotes(group.votes);
    }
  }, [retroId, groupId, retros, getGroup]);

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

export default memo(GroupVoted);
