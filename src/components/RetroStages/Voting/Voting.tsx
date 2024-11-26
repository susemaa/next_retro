"use client";
import React, { useEffect, memo, useState, useRef } from "react";
import { useRetroContext } from "@/contexts/RetroContext";
import ConfirmModal from "../../Modals/ConfirmModal";
import { notify, openModal } from "@/helpers";
import WelcomeModal from "../../Modals/WelcomeModal";
import useAuthor from "@/hooks/useAuthor";
import Footer from "../../Footer";
import GroupVoting from "./GroupVoting";
import { User } from "@prisma/client";
import { useActualSession } from "@/hooks/useActualSession";

interface Voting {
  id: string;
  createdBy: string;
}

const Voting: React.FC<Voting> = ({ id, createdBy }) => {
  const { data } = useActualSession();
  const isAuthor = useAuthor(createdBy);
  const [loading, setLoading] = useState(false);
  const { changeRetroStage, retros } = useRetroContext();
  const [userVotes, setUserVotes] = useState(-1);

  const [finishedUsers, setFinishedUsers] = useState<User[]>([]);

  useEffect(() => {
    const finishedUsers = retros[id].everJoinedUsers.map((user) => {
      const votesLeft = retros[id].groups.reduce((acc, group) => {
        group.votes.forEach(vote => {
          if (vote === user.email) {
            acc -= 1;
          }
        });
        return acc;
      }, retros[id].votesAmount);
      return votesLeft === 0 ? user : null;
    }).filter(user => !!user);

    setFinishedUsers(finishedUsers);
  }, [data, id, retros]);

  useEffect(() => {
    if (data && data.user && data.user.email) {
      const userVotes = retros[id].groups.reduce((acc, group) => {
        group.votes.forEach(vote => {
          if (vote === data.user?.email) {
            acc -= 1;
          }
        });
        return acc;
      }, retros[id].votesAmount);
      setUserVotes(userVotes);
    }
  }, [data, id, retros]);

  const handleConfirm = () => {
    setLoading(true);
    changeRetroStage(id, "action_items", (res) => {
      if (res.status !== 200) {
        setLoading(false);
        notify("error", "Couldnt update retro stage", document.getElementById("confirm_modal"));
      }
    });
  };

  return (
    <>
      <main className="flex-grow flex flex-col h-full pt-4 overflow-y-scroll">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {retros[id] && retros[id].groups.map((group) => (
            <GroupVoting
              key={group.id}
              groupId={group.id}
              retroId={id}
              name={group.name}
              userVotes={userVotes}
              ideaIds={group.ideas}
            />
          ))}
        </div>
      </main>
      <Footer
        isAuthor={isAuthor}
        title={userVotes + ""}
        caption="Votes Left"
        buttonTag="Action Items"
        optionalEl={
          <div className="w-full flex flex-col justify-center items-center">
            <div className="text-center mb-2">Finished Users</div>
            <div className="tooltip w-full h-full" data-tip={finishedUsers.length === retros[id].everJoinedUsers.length
              ? "Everyone finished"
              : `Not finished: ${retros[id].everJoinedUsers
                .filter(user => !finishedUsers.includes(user))
                .map(user => user.name)
                .join(", ")}`}>
              <progress
                className="progress progress-primary w-3/4 h-4"
                value={finishedUsers.length}
                max={retros[id].everJoinedUsers.length}>
              </progress>
            </div>
          </div>
        }
      />
      <ConfirmModal
        message="Is your team satisfied with their votes?"
        loading={loading}
        onConfirm={handleConfirm}
      />
      <WelcomeModal
        title="Stage Change: Voting!"
        body={
          <>
            Guidance:
            <ul className="list-disc list-inside ml-4">
              <li>Apply votes to the items you feel are <b>most important</b> for the team to discuss.</li>
              <li>Multiple votes can be supplied to a single item.</li>
              <li>Voting is blind. Totals will be revealed when the facilitator advances the retro.</li>
            </ul>
          </>
        }
      />
    </>
  );
};

export default memo(Voting);
