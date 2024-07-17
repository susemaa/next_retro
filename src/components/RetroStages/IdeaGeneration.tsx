"use client";
import React, { useEffect, memo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Ideas, useRetroContext } from "@/contexts/RetroContext";
import ConfirmModal from "../Retros/ConfirmModal";
import { notify, openModal } from "@/helpers";
import WelcomeModal from "../Modals/WelcomeModal";
import useAuthor from "@/hooks/useAuthor";
import IdeaComponent from "@/components/Idea";
import { Idea as IdeaInterface } from "@/contexts/RetroContext";
import { ideaTypes, IdeaType } from "@/contexts/RetroContext";
import FooterWInput from "../FooterWInput";

interface IdeaGeneration {
  id: string;
  createdBy: string;
}

const IdeaGeneration: React.FC<IdeaGeneration> = ({ id, createdBy }) => {
  const { data } = useSession();
  const router = useRouter();
  const isAuthor = useAuthor(createdBy);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendIdea, updateIdea, initPositions: socketInitPosistions, changeRetroStage, retros } = useRetroContext();
  const [type, setType] = useState<IdeaType>("happy");
  const [draggingIdea, setDraggingIdea] = useState<IdeaInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const initPositions = (ideas: Ideas, callback: () => void) => {
    const getDimensions = (idea: IdeaInterface): { width: number; height: number } => {
      const span = document.createElement("span");
      span.style.visibility = "hidden";
      span.style.position = "absolute";
      span.textContent = idea.idea;
      span.classList.add("p-2", "whitespace-nowrap", "max-w-xs");
      document.body.appendChild(span);
      const { width, height } = span.getBoundingClientRect();
      document.body.removeChild(span);
      return { width, height };
    };

    let xOffset = 0;
    let yOffset = 5;
    let heightest = -1;
    let counter = 1;

    const positioned = Object.keys(ideas).reduce((acc: Ideas, type) => {
      const positionedType = ideas[type as IdeaType].map((idea) => {
        const { width, height } = getDimensions(idea);
        idea.position.x = xOffset;
        idea.position.y = yOffset;
        idea.position.z = counter;
        if (xOffset < 1000) {
          xOffset += width + 10;
          if (height > heightest) {
            heightest = height;
          }
        } else {
          xOffset = 0;
          yOffset += heightest + 10;
          heightest = -1;
        }
        counter += 1;
        return idea;
      });
      acc[type as IdeaType] = positionedType;
      return acc;
    }, {
      "happy": [],
      "sad": [],
      "confused": [],
    });

    socketInitPosistions(id, positioned, ({ status }) => {
      if (status !== 200) {
        setLoading(false);
        notify("error", "Couldnt init positions for ideas", document.getElementById("confirm_modal"));
      } else {
        callback();
      }
    });
  };

  const handleConfirm = () => {
    setLoading(true);
    initPositions(retros[id].ideas, () => {
      changeRetroStage(id, "grouping", (res) => {
        if (res.status !== 200) {
          setLoading(false);
          notify("error", "Couldnt update retro stage", document.getElementById("confirm_modal"));
        }
      });
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendIdea(id, type, message);
    setMessage("");
  };

  const handleDragStart = (idea: IdeaInterface) => (e: React.DragEvent<HTMLDivElement>) => {
    setDraggingIdea(idea);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (newType: IdeaType) => (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("drag-over");
    if (draggingIdea) {
      updateIdea(id, draggingIdea.id, newType, draggingIdea.idea);
      setDraggingIdea(null);
    }
  };

  const handleSetType = (type: IdeaType) => {
    setType(type);
    if (inputRef.current) {
      inputRef.current.select();
      inputRef.current.focus();
    }
  };

  const handleClick = (ideaType: IdeaType) => () => {
    handleSetType(ideaType);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSetType(e.target.value as IdeaType);
  };

  return (
    <>
      <main className="flex-grow flex flex-col px-8 h-full overflow-y-auto">
        <div className="flex flex-grow">
          {ideaTypes.map((ideaType) => (
            <div
              key={ideaType}
              className="w-1/3 p-4"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop(ideaType)}
            >
              <button
                className="text-center text-xl font-bold mb-4 border-b pb-1 border-b-2 border-current w-full"
                onClick={handleClick(ideaType)}
              >
                {ideaType === "happy" ? "😊 Happy" : ideaType === "sad" ? "😢 Sad" : "😕 Confused"}
              </button>
              {retros[id] && retros[id].ideas[ideaType].map((iterIdea) => (
                <IdeaComponent
                  idea={iterIdea.idea}
                  key={`${ideaType}_${iterIdea.id}`}
                  id={iterIdea.id}
                  type={ideaType}
                  retroId={id}
                  onDragStart={handleDragStart(iterIdea)}
                />
              ))}
            </div>
          ))}
        </div>
      </main>
      <FooterWInput
        options={ideaTypes as unknown as string[]}
        selectedOption={type}
        handleSubmit={handleSubmit}
        onSelectChange={handleSelectChange}
        buttonTag="Grouping"
        isAuthor={isAuthor}
        message={message}
        setMessage={setMessage}
        ref={inputRef}
      />
      <ConfirmModal
        message="Are you sure you would like to proceed to the idea grouping stage?"
        loading={loading}
        onConfirm={handleConfirm}
      />
      <WelcomeModal
        title="Stage Change: Idea Generation!"
        body={
          <>
            Guidance:
            <ul className="list-disc list-inside ml-4">
              <li>Reflect on the events of this past sprint.</li>
              <li>Submit items that made you happy, sad, or just plain confused.</li>
              <li>Be thoughtful and blameless with your language; we&apos;re all here to improve.</li>
            </ul>
          </>
        }
      />
    </>
  );
};

export default memo(IdeaGeneration);
