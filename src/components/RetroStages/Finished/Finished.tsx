
"use client";
import React, { memo } from "react";
import { useRouter } from "next/navigation";
import { useRetroContext } from "@/contexts/RetroContext";
import { WelcomeModal } from "@/components/Modals";
import Link from "next/link";
import Footer from "../../Footer";
import GroupVoted from "./GroupVoted";
import ActionItem from "../ActionItems/ActionItem";

interface ActionItems {
  id: string;
  createdBy: string;
}

const ActionItems: React.FC<ActionItems> = ({ id }) => {
  const router = useRouter();
  const { retros } = useRetroContext();

  return (
    <>
      <main className="flex-grow flex h-full pt-4 overflow-y-scroll">
        <div className="flex flex-col w-1/2 md:w-2/3 lg:w-3/4 mx-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {retros[id].groups.map((group) => (
              <GroupVoted
                key={group.id}
                groupId={group.id}
                retroId={id}
                name={group.name}
                ideaIds={group.ideas}
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
