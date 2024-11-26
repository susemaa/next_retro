"use client";
import { memo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "./Card";
import { useRetroContext } from "@/contexts/RetroContext";
import { notify } from "@/helpers";
import { RetroType } from "@prisma/client";
import { useActualSession } from "@/hooks/useActualSession";

interface ModalProps {
  title: string;
}

const CreateRetroModal: React.FC<ModalProps> = ({ title }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [counter, setCounter] = useState(3);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const { data } = useActualSession();
  const { updStorage } = useRetroContext();
  const router = useRouter();

  const handleClick = (retroType: RetroType) => {
    setLoading("");
    fetch("/api/storage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        retroType,
        votesAmount: counter,
        canUsersLabelGroups: checkboxRef.current?.checked,
      }),
    })
      .then((res) => res.json())
      .then((resData) => {
        setLoading(resData.id);
        updStorage(data?.user?.email || "");
        router.push(`/retros/${resData.id}`);
      })
      .catch((err) => {
        console.error("Failed to fetch /api/storage", err);
        notify("error", "Couldn't create retro, try again later", document.getElementById("create_retro_modal"));
        setLoading(null);
      });
  };

  if (loading !== null) {
    return (
      <dialog id="create_retro_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-center">{title}</h3>
          <div className="flex items-center justify-center pt-2">
            {loading !== undefined && loading.length === 0
              ? "Creating retro, please wait..."
              : (
                <div>
                  Succesfully created, <Link className="btn-link" href={`/retros/${loading}`}>redirecting</Link>...
                </div>
              )
            }
          </div>
        </div>
      </dialog>
    );
  }

  return (
    <dialog id="create_retro_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-center">{title}</h3>
        <Card
          title="Happy/Sad/Confused"
          description="Standard iteration retrospective for teams new to retrospectives. Ideal for unearthing wins, concerns, and painpoints in a collaborative setting where the team can decide the most impactful changes they can make to their process."
          additional="Suggested time allotment: 1 hour"
          imageSrc="happy.svg"
          imageAlt="Smiley face"
          onClick={() => handleClick("emotions")}
        />
        <Card
          title="Start/Stop/Continue"
          description="A format focused on the rapid brainstorming of possible action items, and honing the ones most likely to drive positive change in the team."
          additional="Suggested time allotment: 45 - 60 minutes"
          imageSrc="traffic-light.svg"
          imageAlt="Traffic light"
          onClick={() => handleClick("progress")}
        />
        <div className="text-center mt-6">
          Group votes amount
        </div>
        <div className="flex justify-center items-center space-x-2">
          <button
            className="btn btn-outline btn-xs"
            onClick={() => setCounter(prev => (prev - 1) || 1)}
            disabled={counter === 1}
          >
            -
          </button>
          <span className="text-lg">{counter}</span>
          <button
            className="btn btn-outline btn-xs"
            onClick={() => setCounter(prev => prev + 1)}
          >
            +
          </button>
        </div>
        <div className="form-control mt-4">
          <label className="label cursor-pointer">
            <span className="label-text">All Users Can Label Groups</span>
            <input ref={checkboxRef} type="checkbox" className="checkbox checkbox-primary" defaultChecked />
          </label>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" className="cursor-default">
          close
        </button>
      </form>
    </dialog>
  );
};

export default memo(CreateRetroModal);
