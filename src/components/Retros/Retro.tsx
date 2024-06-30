"use client";
import React, { useEffect, memo } from "react";
import ShareLinkModal from "@/components/Retros/ShareLinkModal";
import { openModal } from "@/helpers";
import { useSession } from "next-auth/react";

interface RetroProps {
  id: string;
	createdBy: string;
}

const Retro: React.FC<RetroProps> = ({ id, createdBy }) => {
  const { data } = useSession();
  useEffect(() => {
    openModal("share_link_modal");
  }, []);

  return (
    <>
      <div>
        retro: {id}
      </div>
      <div>
        createdBy: {createdBy}
      </div>
      <div>
        author: {(createdBy === data?.user?.email).toString()}
      </div>
      <ShareLinkModal />
    </>
  );
};

export default memo(Retro);
