"use client";
import React, { useEffect, memo, useState, useRef } from "react";
import { useRetroContext } from "@/contexts/RetroContext";
import ConfirmModal from "../../Modals/ConfirmModal";
import { notify } from "@/helpers";
import WelcomeModal from "../../Modals/WelcomeModal";
import useAuthor from "@/hooks/useAuthor";
import { Idea as IdeaInterface } from "@prisma/client";
import Draggable from "./Draggable";
import Footer from "../../Footer";

interface Grouping {
  id: string;
  createdBy: string;
}

const Grouping: React.FC<Grouping> = ({ id, createdBy }) => {
  const isAuthor = useAuthor(createdBy);
  const { initGroups, changeRetroStage, retros, updatePosition } = useRetroContext();
  const draggableParent = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [newPosition, setNewPosition] = useState({ x: 0, y: 0 });
  const [draggingIdea, setDraggingIdea] = useState<IdeaInterface | null>(null);
  const [ideas, setIdeas] = useState<IdeaInterface[]>(retros[id].ideas);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [groups, setGroup] = useState<Record<string, number>>({});

  useEffect(() => {
    if (draggableParent.current && retros[id]) {
      const parentRect = draggableParent.current.getBoundingClientRect();
      const { maxX, maxY } = retros[id].ideas.reduce(
        (acc, idea) => {
          const el = document.getElementById(idea.id);
          if (el) {
            const elWidth = el.clientWidth;
            const elHeight = el.clientHeight;
            if (idea.x + elWidth > acc.maxX) {
              acc.maxX = idea.x + elWidth;
            }
            if (idea.y + elHeight > acc.maxY) {
              acc.maxY = idea.y + elHeight;
            }
          }
          return acc;
        },
        { maxX: 0, maxY: 0 }
      );

      const scaleX = maxX > parentRect.width ? parentRect.width / maxX : 1;
      const scaleY = maxY > parentRect.height ? parentRect.height / maxY : 1;
      setScale({ x: scaleX, y: scaleY });
    }
  }, [retros, id, draggableParent]);

  const checkCollision = (rect1: DOMRect, rect2: DOMRect) => {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  };

  useEffect(() => {
    if (!ideas) {
      return;
    }
    const ideasRects: Record<string, DOMRect> = {};

    const handleRect = (idea: IdeaInterface) => {
      if (!ideasRects[idea.id]) {
        const currEl = document.getElementById(idea.id);
        if (!currEl) {
          throw new Error(`Cant find idea with ${idea.id} in DOM`);
        }
        const currRect = currEl.getBoundingClientRect();
        ideasRects[idea.id] = currRect;
      }
    };

    const newGroups: Record<string, number> = {};
    let newGroupNumber = 0;

    const bfs = (startIdea: IdeaInterface) => {
      const queue = [startIdea];
      newGroups[startIdea.id] = -1;

      while (queue.length > 0) {
        const currIdea = queue.shift()!;
        handleRect(currIdea);

        ideas.forEach((iterIdea) => {
          if (currIdea.id !== iterIdea.id && newGroups[iterIdea.id] === undefined) {
            handleRect(iterIdea);
            if (checkCollision(ideasRects[currIdea.id], ideasRects[iterIdea.id])) {
              newGroups[iterIdea.id] = newGroupNumber;
              newGroups[startIdea.id] = newGroupNumber;
              queue.push(iterIdea);
            }
          }
        });
      }
    };

    ideas.forEach((currentIdea) => {
      if (newGroups[currentIdea.id] === undefined) {
        bfs(currentIdea);
        newGroupNumber += 1;
      }
    });

    setGroup(newGroups);
  }, [ideas, draggingIdea, newPosition]);

  useEffect(() => {
    setIdeas(retros[id].ideas);
  }, [id, retros]);

  const handleConfirm = () => {
    let aloneCounter = 0;
    const grouped = Object.entries(groups).reduce((acc: Record<string, string[]>, [ideaId, groupNumber]) => {
      if (groupNumber === -1) {
        acc[+(groupNumber - aloneCounter)] = [ideaId];
        aloneCounter += 1;
      } else if (!acc[+groupNumber]) {
        acc[+groupNumber] = [ideaId];
      } else {
        acc[+groupNumber].push(ideaId);
      }
      return acc;
    }, {});
    setLoading(true);

    initGroups(id, grouped, ({ status }) => {
      if (status !== 200) {
        setLoading(false);
        notify("error", "Couldnt initiate groups", document.getElementById("confirm_modal"));
        return;
      }
      changeRetroStage(id, "group_labeling", (res) => {
        if (res.status !== 200) {
          setLoading(false);
          notify("error", "Couldnt update retro stage", document.getElementById("confirm_modal"));
        }
      });
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

  return (
    <>
      <main className="flex-grow flex flex-col h-full">
        <div
          ref={draggableParent}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex-grow relative"
        >
          {retros[id] &&
            retros[id].ideas.map((iterIdea) => (
              <Draggable
                key={iterIdea.id}
                idea={iterIdea.idea}
                ideaId={iterIdea.id}
                left={draggingIdea?.id === iterIdea.id ? newPosition.x : iterIdea.x}
                top={draggingIdea?.id === iterIdea.id ? newPosition.y : iterIdea.y}
                zIndex={iterIdea.z}
                onMouseDown={handleMouseDown(iterIdea)}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                scale={scale}
                groupNumber={groups[iterIdea.id]}
                isDragging={draggingIdea?.id === iterIdea.id}
              />
            ))}
        </div>
      </main>
      <Footer
        isAuthor={isAuthor}
        title="Grouping"
        caption="Group Related Ideas"
        buttonTag="Group Labeling"
      />
      <ConfirmModal
        message="Has your team finished grouping the ideas?"
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
    </>
  );
};

export default memo(Grouping);
