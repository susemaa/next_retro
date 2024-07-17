"use client";
import React, { useEffect, memo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CurrentUsers from "../Retros/CurrentUsers";
import { useRetroContext } from "@/contexts/RetroContext";
import ConfirmModal from "../Retros/ConfirmModal";
import { notify, openModal } from "@/helpers";
import WelcomeModal from "../Modals/WelcomeModal";
import Link from "next/link";
import useAuthor from "@/hooks/useAuthor";

interface PrimeDirective {
  id: string;
  createdBy: string;
}

const PrimeDirective: React.FC<PrimeDirective> = ({ id, createdBy }) => {
  const [loading, setLoading] = useState(false);
  const isAuthor = useAuthor(createdBy);
  const { users, changeRetroStage } = useRetroContext();

  const handleConfirm = () => {
    setLoading(true);
    changeRetroStage(id, "idea_generation", (res) => {
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
          Prime directive
        </h1>
        <div>
          Regardless of what we discover,we understand and truly believe that everyone did the best job they could, given what they knew at the time, their skills and abilities, the resources available, and the situation at hand.
        </div>
      </header>
      {users && <CurrentUsers users={users[id]} createdBy={createdBy}/>}
      {isAuthor && (
        <button className="btn btn-primary" onClick={() => openModal("confirm_modal") }>
          Idea Generation
        </button>
      )}
      <ConfirmModal
        message="Is everyone ready to begin?"
        loading={loading}
        onConfirm={handleConfirm}
      />
      <WelcomeModal
        title="Stage Change: The Prime Directive!"
        body={
          <>
            <Link className="btn-link" href="https://retrospectivewiki.org/index.php?title=The_Prime_Directive">Norm Kerth&apos;s Prime Directive</Link>
            {"\u00A0"}sets the stage for every retrospective, such that the time spent is as constructive as possible.
            <br />
            Guidance:
            <ul className="list-disc list-inside ml-4">
              <li>Solicit a volunteer to read the Prime Directive aloud.</li>
              <li>Ask each member of the team if they can agree to the Prime Directive.</li>
              <div className="pl-6">
                - <span className="font-bold">Note</span>: If someone earnestly cannot agree, there are likely trust issues on the team that should be addressed with a manager.
              </div>
              <li>Once the team has agreed to the Prime Directive, advance to Idea Generation.</li>
            </ul>
          </>
        }
      />
    </main>
  );
};

export default memo(PrimeDirective);
