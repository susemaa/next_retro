"use client";
import React, { useEffect, memo, useState } from "react";
import ShareLinkModal from "@/components/Retros/ShareLinkModal";
import { openModal } from "@/helpers";
import { useSession } from "next-auth/react";

interface RetroProps {
  id: string;
  createdBy: string;
}

const Retro: React.FC<RetroProps> = ({ id, createdBy }) => {
  const { data } = useSession();
  const [isAuthor, setIsAuthor] = useState(createdBy === data?.user?.email);

  useEffect(() => {
    openModal("share_link_modal");
  }, []);

  useEffect(() => {
    setIsAuthor(createdBy === data?.user?.email);
  }, [data?.user?.email, createdBy]);

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
            : "Not Author message"
          }
        </div>
      </header>
      <div>
        <span className="text-2xl font-bold mb-4 pb-2 border-b-2 border-current">
          Current Users
        </span>
      </div>
      <ShareLinkModal />
    </main>
  );
};

export default memo(Retro);
