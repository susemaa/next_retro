"use client";
import React, { useEffect, memo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CurrentUsers from "../Retros/CurrentUsers";
import { useRetroContext } from "@/contexts/RetroContext";
import ConfirmModal from "../Retros/ConfirmModal";
import { notify, openModal } from "@/helpers";
import WelcomeModal from "../Modals/WelcomeModal";
import Link from "next/link";
import useAuthor from "@/hooks/useAuthor";
import Idea from "@/components/Idea";
import { Idea as IdeaInterface } from "@/contexts/RetroContext";
import { ideaTypes, IdeaType } from "@/contexts/RetroContext";
import Draggable from "../Draggable";
import Group from "../Group";
import Footer from "../Footer";

interface GroupLabeling {
  id: string;
  createdBy: string;
}

const GroupLabeling: React.FC<GroupLabeling> = ({ id, createdBy }) => {
  const { data } = useSession();
  const isAuthor = useAuthor(createdBy);
  const [loading, setLoading] = useState(false);
  const { sendIdea, updateIdea, users, changeRetroStage, retros, updatePosition } = useRetroContext();

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
          {Object.keys(retros[id].groups).map((groupId) => (
            <Group
              key={`${id}_group_${groupId}`}
              groupId={groupId}
              retroId={id}
              name={retros[id].groups[groupId].name}
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
