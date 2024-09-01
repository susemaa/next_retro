"use client";
import React, { memo, useState, useRef } from "react";
import { Idea } from "@prisma/client";
import { WelcomeModal, ConfirmModal } from "@/components/Modals";
import { useRetroContext } from "@/contexts/RetroContext";
import { notify } from "@/helpers";
import useAuthor from "@/hooks/useAuthor";
import { Idea as IdeaComponent } from "./";
import FooterWInput from "../../FooterWInput";
import { getIdeaTypeFromMsg, IdeaType, ideaTypes, mapRetroType, MsgType } from "@/app/api/storage/storageHelpers";

interface IdeaGeneration {
  id: string;
  createdBy: string;
}

const IdeaGeneration: React.FC<IdeaGeneration> = ({ id, createdBy }) => {
  const isAuthor = useAuthor(createdBy);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendIdea, updateIdea, initPositions: socketInitPosistions, changeRetroStage, retros } = useRetroContext();
  const [type, setType] = useState<IdeaType>(0);
  const [draggingIdea, setDraggingIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const initPositions = (ideas: Idea[], onErrCallback: () => void) => {
    const getDimensions = (idea: Idea): { width: number; height: number } => {
      const span = document.createElement("span");
      span.style.visibility = "hidden";
      span.style.position = "absolute";
      span.textContent = `${mapRetroType(retros[id].retroType, idea.type as IdeaType).emoji} ${idea.idea}`;
      span.classList.add("p-2", "max-w-xs");
      document.body.appendChild(span);
      const { width, height } = span.getBoundingClientRect();
      document.body.removeChild(span);
      return { width, height };
    };

    let xOffset = 0;
    let yOffset = 5;
    let heightest = -1;
    let counter = 1;

    // const { totalWidth, totalHeight } = ideas.reduce((acc, idea) => {
    //   const { width, height } = getDimensions(idea);
    //   return {
    //     totalHeight: acc.totalHeight + height,
    //     totalWidth: acc.totalWidth + width,
    //   };
    // }, { totalHeight: 0, totalWidth: 0 });
    // const rowWidth = Math.sqrt(totalWidth * totalHeight);
    const padding = 10;

    const positioned: Idea[] = ideas.map((idea, index) => {
      const { width, height } = getDimensions(idea);
      idea.x = xOffset;
      idea.y = yOffset;
      idea.z = counter;
      if (xOffset < 1000) {
        xOffset += width + padding;
        if (height > heightest) {
          heightest = height;
        }
      } else {
        xOffset = 0;
        yOffset += heightest + padding;
        heightest = -1;
      }
      counter += 1;
      return idea;
    });

    socketInitPosistions(id, positioned, ({ status }) => {
      if (status !== 200) {
        setLoading(false);
        notify("error", "Couldnt init positions for ideas", document.getElementById("confirm_modal"));
      } else {
        onErrCallback();
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

  const handleDragStart = (idea: Idea) => (e: React.DragEvent<HTMLDivElement>) => {
    setDraggingIdea(idea);

    const el = document.createElement("div");
    const spanText = document.createElement("span");
    el.className = "flex justify-between items-center absolute top-[9999px] left-[9999px]";
    spanText.className = "whitespace-nowrap overflow-x-auto";
    spanText.textContent = idea.idea;
    el.appendChild(spanText);
    document.body.appendChild(el);

    e.dataTransfer.setDragImage(el,
      e.clientX - e.currentTarget.getBoundingClientRect().left,
      e.clientY - e.currentTarget.getBoundingClientRect().top
    );
    setTimeout(() => {
      document.body.removeChild(el);
    }, 0);
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
    handleSetType(getIdeaTypeFromMsg(retros[id].retroType, e.target.value as MsgType));
  };


  return (
    <>
      <main className="flex-grow flex flex-col px-8 h-full overflow-y-auto">
        <div className="flex-grow hidden md:grid grid-cols-3 gap-4">
          {ideaTypes.map((ideaType) => (
            <div
              key={`idea_type_${ideaType}`}
              className="w-full pt-4"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop(ideaType)}
            >
              <button
                className="text-center text-xl font-bold mb-4 border-b pb-1 border-b-2 border-current w-full"
                onClick={handleClick(ideaType)}
              >
                {retros[id] && `${mapRetroType(retros[id].retroType, ideaType).emoji} ${mapRetroType(retros[id].retroType, ideaType).msg}`}
              </button>
              {retros[id] &&
              retros[id].ideas.filter((idea) => idea.type === ideaType).map((iterIdea) => (
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
        <div className="flex flex-grow flex-col md:hidden">
          <div className="w-full grid grid-cols-3 gap-1 pt-4 mb-4">
            {ideaTypes.map((ideaType) => (
              <div
                key={`idea_type_${ideaType}`}
                className={`w-full ${ideaType === type && "selected-type"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop(ideaType)}
              >
                <button
                  className="text-center text-xl font-bold border-b pb-1 border-b-2 border-current w-full"
                  onClick={handleClick(ideaType)}
                >
                  {retros[id] && `${mapRetroType(retros[id].retroType, ideaType).emoji}`}
                </button>
              </div>
            ))}
          </div>
          {retros[id] &&
          retros[id].ideas.filter((idea) => idea.type === type).map((iterIdea) => (
            <IdeaComponent
              idea={iterIdea.idea}
              key={`${type}_${iterIdea.id}`}
              id={iterIdea.id}
              type={type}
              retroId={id}
              onDragStart={handleDragStart(iterIdea)}
            />
          ))}
        </div>
      </main>
      <FooterWInput
        options={ideaTypes.map(ideaType => mapRetroType(retros[id]?.retroType, ideaType).msg)}
        selectedOption={mapRetroType(retros[id]?.retroType, type).msg}
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
