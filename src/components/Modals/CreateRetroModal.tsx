"use client";
import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Card from "../Retros/Card";
import { useRetroContext } from "@/contexts/RetroContext";
import { toastDurationMS } from "../../../tailwind.config";
import { getErrorNotification } from "@/helpers";

interface ModalProps {
  title: string;
}

const CreateRetroModal: React.FC<ModalProps> = ({ title }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { data } = useSession();
  const { updStorage } = useRetroContext();
  const router = useRouter();

  const handleClick = () => {
    setLoading("");
    fetch("/api/retros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: data?.user?.email }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(data.id);
        updStorage();
        router.push(`/retros/${data.id}`);
      })
      .catch((err) => {
        console.error("Failed to fetch /api/retros", err);
        const toast = getErrorNotification("Couldn't create retro, try again later");
        document.getElementById("create_retro_modal")?.appendChild(toast);
        setTimeout(() => {
          document.getElementById("create_retro_modal")?.removeChild(toast);
        }, toastDurationMS);
        setLoading(null);
      });
  };

  if (loading !== null) {
    return (
      <dialog id="create_retro_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-center">{title}</h3>
          <div className="flex items-center justify-center pt-2">
            {loading.length === 0
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
          onClick={handleClick}
        />
        <Card
          title="Start/Stop/Continue"
          description="A format focused on the rapid brainstorming of possible action items, and honing the ones most likely to drive positive change in the team."
          additional="Suggested time allotment: 45 - 60 minutes"
          imageSrc="traffic-light.svg"
          imageAlt="Traffic light"
          onClick={handleClick}
        />
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
