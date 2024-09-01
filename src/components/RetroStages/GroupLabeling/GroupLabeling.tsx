"use client";
import React, { memo, useState } from "react";
import { useRetroContext } from "@/contexts/RetroContext";
import { ConfirmModal, WelcomeModal } from "@/components/Modals";
import { notify } from "@/helpers";
import useAuthor from "@/hooks/useAuthor";
import Group from "./Group";
import Footer from "../../Footer";
import { Idea } from "@prisma/client";

interface GroupLabeling {
  id: string;
  createdBy: string;
}

const GroupLabeling: React.FC<GroupLabeling> = ({ id, createdBy }) => {
  const isAuthor = useAuthor(createdBy);
  const [loading, setLoading] = useState(false);
  const { changeRetroStage, retros } = useRetroContext();
  const [draggingIdea, setDraggingIdea] = useState<Idea | null>(null);

  const handleConfirm = () => {
    setLoading(true);
    changeRetroStage(id, "voting", (res) => {
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
          {retros[id] &&
          retros[id].groups.map((group) => (
            <Group
              key={group.id}
              groupId={group.id}
              retroId={id}
              ideaIds={group.ideas}
              name={group.name}
              draggingIdea={draggingIdea}
              setDraggingIdea={setDraggingIdea}
            />
          ))}
        </div>
      </main>
      <Footer
        isAuthor={isAuthor}
        title="Labeling"
        caption="Arrive at sensible group labels"
        buttonTag="Voting"
      />
      <ConfirmModal
        message="Is your team satisfied with the applied labels?"
        loading={loading}
        onConfirm={handleConfirm}
      />
      <WelcomeModal
        title="Stage Change: Labeling!"
        body={
          <>
            Guidance:
            <ul className="list-disc list-inside ml-4">
              <li>Work as a team to arrive at sensible labels for each group of ideas.</li>
              <li>Don&apos;t spend too much time labeling any one group. An approximate label is good enough.</li>
            </ul>
          </>
        }
      />
    </>
  );
};

export default memo(GroupLabeling);
