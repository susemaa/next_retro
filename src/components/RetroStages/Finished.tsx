
// welcome:
// The Retrospective Has Been Closed!

// The facilitator has closed the retro and distributed the action items via email. You can stick around and review the board, or revisit this retro and all action items generated via your retro dashboard.
"use client";
import React, { useEffect, memo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CurrentUsers from "../Retros/CurrentUsers";
import { Groups, useRetroContext } from "@/contexts/RetroContext";
import ConfirmModal from "../Retros/ConfirmModal";
import { notify, openModal } from "@/helpers";
import WelcomeModal from "../Modals/WelcomeModal";
import Link from "next/link";
import useAuthor from "@/hooks/useAuthor";
import Footer from "../Footer";
import GroupVoting from "../GroupVoting";
import GroupVoted from "../GroupVoted";
import FooterWInput from "../FooterWInput";
import Idea from "../Idea";
import ActionItem from "../ActionItem";

interface ActionItems {
  id: string;
  createdBy: string;
}

const ActionItems: React.FC<ActionItems> = ({ id }) => {
  const { data } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { changeRetroStage, retros, sendActionItem } = useRetroContext();
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [assignee, setAssignee] = useState(retros[id].everJoined[0]);

  const handleConfirm = () => {
    setLoading(true);
    changeRetroStage(id, "finished", (res) => {
      if (res.status !== 200) {
        setLoading(false);
        notify("error", "Couldnt update retro stage", document.getElementById("confirm_modal"));
      }
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sender = retros[id].everJoined.find(user => user.email === data?.user?.email);
    if (sender) {
      sendActionItem(id, sender, assignee, message);
      setMessage("");
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = retros[id].everJoined.find(user => user.name === e.target.value);
    if (user) {
      setAssignee(user);
      if (inputRef.current) {
        inputRef.current.select();
        inputRef.current.focus();
      }
    }
  };

  return (
    <>
      <main className="flex-grow flex h-full pt-4 overflow-y-scroll">
        <div className="flex flex-col w-1/2 md:w-2/3 lg:w-3/4 mx-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(retros[id].groups).map((groupId) => (
              <GroupVoted
                key={`${id}_group_${groupId}`}
                groupId={groupId}
                retroId={id}
                name={retros[id].groups[groupId].name}
              />
            ))}
          </div>
        </div>
        <div
          className="w-1/2 md:w-1/3 lg:w-1/4 mr-4"
        >
          <div
            className="text-center text-xl font-bold mb-4 border-b pb-1 border-b-2 border-current"
          >
            🚀 Action Items
          </div>
          {retros[id] && retros[id].actionItems.map((iterItem) => (
            <ActionItem
              retroId={id}
              id={iterItem.id}
              actionItem={iterItem}
              key={iterItem.id}
              finished={true}
            />
          ))}
        </div>
      </main>
      <Footer
        isAuthor={true}
        title="This retro is all wrapped up!"
        caption="Contents are read-only."
        buttonTag="Visit your dashboard"
        customBtnClasses="btn-ghost"
        customOnClick={() => router.push("/retros")}
      />
      <WelcomeModal
        title="The Retrospective Has Been Closed!"
        body={
          <>
            The facilitator has closed the retro and distributed the action items via email.
            You can stick around and review the board, or revisit this retro and all action items generated via your <Link href="/retros" prefetch={false}>retro dashboard</Link>.
          </>
        }
      />
    </>
  );
};

export default memo(ActionItems);
