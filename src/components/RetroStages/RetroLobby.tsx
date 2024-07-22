"use client";
import React, { useEffect, memo, useState } from "react";
import { notify, openModal } from "@/helpers";
import { ConfirmModal, ShareLinkModal } from "@/components/Modals";
import { useRetroContext } from "@/contexts/RetroContext";
import CurrentUsers from "../Retros/CurrentUsers";
import useAuthor from "@/hooks/useAuthor";

interface RetroLobby {
  id: string;
  createdBy: string;
}

const RetroLobby: React.FC<RetroLobby> = ({ id, createdBy }) => {
  const [loading, setLoading] = useState(false);
  const { changeRetroStage, users } = useRetroContext();
  const isAuthor = useAuthor(createdBy);

  useEffect(() => {
    openModal("share_link_modal");
  }, []);

  const handleConfirm = () => {
    setLoading(true);
    changeRetroStage(id, "prime_directive", (res) => {
      if (res.status !== 200) {
        console.error("Couldnt update retro stage");
        setLoading(false);
        notify("error", "Couldnt update retro stage", document.getElementById("confirm_modal"));
      }
    });
  };

  return (
    <main className="flex-grow flex flex-col p-8 h-full">
      <header className="pb-16">
        <h1
          className="text-2xl font-bold mb-4 border-b pb-2 inline-block border-b-2 border-current"
        >
          Retro Lobby
        </h1>
        <div>
          {isAuthor
            ? "As facilitator of this retro, it will be your responsibility to advance the retro once your party has arrived. Get them in here!"
            : "Member message"
          }
        </div>
      </header>
      {users && <CurrentUsers users={users[id]} createdBy={createdBy}/>}
      {isAuthor && (
        <button className="btn btn-primary" onClick={() => openModal("confirm_modal") }>
          Begin Retro!
        </button>
      )}
      <ShareLinkModal />
      <ConfirmModal
        message="Make sure everyone joined. Are you sure you want to begin retro?"
        loading={loading}
        onConfirm={handleConfirm}
      />
    </main>
  );
};

export default memo(RetroLobby);
