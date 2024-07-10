"use client";
import React, { useEffect, memo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CurrentUsers from "../Retros/CurrentUsers";
import { useRetroContext } from "@/contexts/RetroContext";
import ConfirmModal from "../Retros/ConfirmModal";
import { notify, openModal } from "@/helpers";
import WelcomeModal from "../Modals/WelcomeModal";
import Link from "next/link";
import useAuthor from "@/hooks/useAuthor";
import Idea from "@/components/Idea";
import { Idea as IdeaInterface } from "@/contexts/RetroContext";
import { ideaTypes, IdeaType } from "@/contexts/RetroContext";
import Draggable from "../Draggable";

interface Grouping {
  id: string;
  createdBy: string;
}

const Grouping: React.FC<Grouping> = ({ id, createdBy }) => {
  const { data } = useSession();
  const isAuthor = useAuthor(createdBy);
  const { sendIdea, updateIdea, users, changeRetroState, retros, updatePosition } = useRetroContext();
  const draggableParent = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [newPosition, setNewPosition] = useState({ x: 0, y: 0 });
  const [draggingIdea, setDraggingIdea] = useState<IdeaInterface | null>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  useEffect(() => {
    if (draggableParent.current) {
      const parentRect = draggableParent.current.getBoundingClientRect();
      const { maxX, maxY } = ideaTypes.reduce(
        (acc, type) => {
          retros[id].ideas[type].forEach(({ id: ideaId, position }) => {
            const el = document.getElementById(ideaId);
            if (el) {
              const elRect = el.getBoundingClientRect();
              const elWidth = elRect.width;
              const elHeight = elRect.height;
              if (position.x + elWidth > acc.maxX) acc.maxX = position.x + elWidth;
              if (position.y + elHeight > acc.maxY) acc.maxY = position.y + elHeight;
            }
          });
          return acc;
        },
        { maxX: 0, maxY: 0 }
      );

      const scaleX = maxX > parentRect.width ? parentRect.width / maxX : 1;
      const scaleY = maxY > parentRect.height ? parentRect.height / maxY : 1;
      setScale({ x: scaleX, y: scaleY });
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retros, id, draggableParent.current]);

  const handleConfirm = () => {
    setLoading(true);
    changeRetroState(id, "grouping", (res) => {
      if (res.status !== 200) {
        setLoading(false);
        notify("error", "Couldnt update retro stage", document.getElementById("confirm_modal"));
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (draggingIdea && draggableParent.current) {
      const parentRect = draggableParent.current.getBoundingClientRect();
      const newX = (e.clientX - parentRect.left - offset.x) / scale.x;
      const newY = (e.clientY - parentRect.top - offset.y) / scale.y;
      setNewPosition({ x: newX, y: newY });
    }
  };

  const handleMouseDown = (idea: IdeaInterface) => (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if (e.currentTarget && draggableParent.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const parentRect = draggableParent.current.getBoundingClientRect();
      const xOffset = e.clientX - rect.left;
      const yOffset = e.clientY - rect.top;
      const newX = (e.clientX - parentRect.left - xOffset) / scale.x;
      const newY = (e.clientY - parentRect.top - yOffset) / scale.y;
      setOffset({ x: xOffset , y: yOffset });
      setNewPosition({ x: newX, y: newY });
      setDraggingIdea(idea);
    }
  };

  const handleMouseUp = () => {
    if (draggingIdea) {
      updatePosition(id, draggingIdea.id, newPosition);
      setDraggingIdea(null);
    }
  };

  const checkCollision = (rect1: DOMRect, rect2: DOMRect) => {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  };

  const shouldHighlight = (ideaId: string) => {
    const currentElement = document.getElementById(ideaId);
    if (!currentElement) return false;

    const currentRect = currentElement.getBoundingClientRect();
    for (const type of ideaTypes) {
      for (const { id: otherIdeaId } of retros[id].ideas[type]) {
        if (otherIdeaId !== ideaId) {
          const otherElement = document.getElementById(otherIdeaId);
          if (otherElement && checkCollision(currentRect, otherElement.getBoundingClientRect())) {
            return true;
          }
        }
      }
    }
    return false;
  };

  return (
    <main className="flex-grow flex flex-col h-full">
      <div
        ref={draggableParent}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-grow relative"
      >
        {retros[id] && ideaTypes.flatMap((type) => (retros[id].ideas[type]
          .map(({ id: ideaId, idea, position }) => (
            <Draggable
              key={`${type}_${ideaId}`}
              idea={idea}
              type={type}
              ideaId={ideaId}
              left={draggingIdea?.id === ideaId ? newPosition.x : position.x}
              top={draggingIdea?.id === ideaId ? newPosition.y : position.y}
              zIndex={position.z}
              onMouseDown={handleMouseDown({ id: ideaId, idea, position })}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              scale={scale}
              shouldHighlight={shouldHighlight(ideaId)}
              isDragging={draggingIdea?.id === ideaId}
            />
          )))
        )}
      </div>
      <div className="flex py-4 justify-between border">
        footer
      </div>
      <ConfirmModal
        message="Are you sure you would like to proceed to the idea grouping stage?"
        loading={loading}
        onConfirm={handleConfirm}
      />
      <WelcomeModal
        title="Stage Change: Grouping!"
        body={
          <>
            Guidance:
            <ul className="list-disc list-inside ml-4">
              <li>Bring related ideas into contact.</li>
              <li>Leave disparate ideas far apart.</li>
              <li>If there&apos;s a disagreement, attempt to settle it without speaking.</li>
            </ul>
          </>
        }
      />
    </main>
  );
};

export default memo(Grouping);
