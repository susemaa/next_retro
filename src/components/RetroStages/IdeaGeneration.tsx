"use client";
import React, { useEffect, memo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CurrentUsers from "../Retros/CurrentUsers";
import { Ideas, useRetroContext } from "@/contexts/RetroContext";
import ConfirmModal from "../Retros/ConfirmModal";
import { notify, openModal } from "@/helpers";
import WelcomeModal from "../Modals/WelcomeModal";
import Link from "next/link";
import useAuthor from "@/hooks/useAuthor";
import IdeaComponent from "@/components/Idea";
import { Idea as IdeaInterface } from "@/contexts/RetroContext";
import { ideaTypes, IdeaType } from "@/contexts/RetroContext";

interface IdeaGeneration {
  id: string;
  createdBy: string;
}

const IdeaGeneration: React.FC<IdeaGeneration> = ({ id, createdBy }) => {
  const { data } = useSession();
  const router = useRouter();
  const isAuthor = useAuthor(createdBy);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendIdea, updateIdea, initPositions: socketInitPosistions, changeRetroState, retros } = useRetroContext();
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
      changeRetroState(id, "grouping", (res) => {
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

  return (
    <main className="flex-grow flex flex-col px-8 h-full">
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
              onClick={() => {
                setType(ideaType);
                if (inputRef.current) {
                  inputRef.current.select();
                  inputRef.current.focus();
                }
              }}
            >
              {ideaType === "happy" ? "😊 Happy" : ideaType === "sad" ? "😢 Sad" : "😕 Confused"}
            </button>
            {retros[id] && retros[id].ideas[ideaType].map(({ idea, id: ideaId, position }) => (
              <IdeaComponent
                idea={idea}
                key={`${ideaType}_${ideaId}`}
                id={ideaId}
                type={ideaType}
                retroId={id}
                onDragStart={handleDragStart({ id: ideaId, idea, position })}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex py-4 justify-between">
        <select
          className="select select-bordered w-1/4 flex-grow"
          value={type}
          onChange={(e) => setType(e.target.value as IdeaType)}
        >
          <option value="happy">Happy</option>
          <option value="sad">Sad</option>
          <option value="confused">Confused</option>
        </select>
        <form className="flex w-full" onSubmit={handleSubmit}>
          <input
            type="text"
            ref={inputRef}
            className="input input-bordered w-1/2 mx-4 flex-grow"
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary w-1/8 mr-4 flex-grow"
            disabled={message.length === 0}
          >
            Submit
          </button>
        </form>
        <button className="btn btn-primary w-1/8 flex-grow" disabled={!isAuthor} onClick={() => openModal("confirm_modal") }>
          Grouping
        </button>
      </div>
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
    </main>
  );
};

export default memo(IdeaGeneration);
