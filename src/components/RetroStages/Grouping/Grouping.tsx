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
import { IdeaType, mapRetroType } from "@/app/api/storage/storageHelpers";

interface Grouping {
  id: string;
  createdBy: string;
}

const Grouping: React.FC<Grouping> = ({ id, createdBy }) => {
  const isAuthor = useAuthor(createdBy);
  const { initGroups, changeRetroStage, retros, updatePosition, updatePositions } = useRetroContext();
  const draggableParent = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [newPosition, setNewPosition] = useState({ x: 0, y: 0 });
  const [draggingIdea, setDraggingIdea] = useState<IdeaInterface | null>(null);
  const [draggingGroup, setDraggingGroup] = useState<number | null>(null);
  const [ideas, setIdeas] = useState<IdeaInterface[]>(retros[id].ideas);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [groups, setGroup] = useState<Record<string, number>>({});

  const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (draggableParent.current && retros[id]) {
      // const parentRect = draggableParent.current.getBoundingClientRect();
      // const { maxX, maxY } = retros[id].ideas.reduce(
      //   (acc, idea) => {
      //     const el = document.getElementById(idea.id);
      //     if (el) {
      //       const elWidth = el.clientWidth;
      //       const elHeight = el.clientHeight;
      //       if (idea.x + elWidth > acc.maxX) {
      //         acc.maxX = idea.x + elWidth;
      //       }
      //       if (idea.y + elHeight > acc.maxY) {
      //         acc.maxY = idea.y + elHeight;
      //       }
      //     }
      //     return acc;
      //   },
      //   { maxX: 0, maxY: 0 }
      // );

      // const scaleX = maxX > parentRect.width ? parentRect.width / maxX : 1;
      // const scaleY = maxY > parentRect.height ? parentRect.height / maxY : 1;
      const scaleX = 1;
      const scaleY = 1;
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
    if (!ideas || draggingGroup) {
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
  }, [ideas, draggingIdea, newPosition, draggingGroup]);

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
      const scrollTop = draggableParent.current.scrollTop;
      const scrollLeft = draggableParent.current.scrollLeft;
      const newX = (e.clientX - parentRect.left + scrollLeft - offset.x) / scale.x;
      const newY = (e.clientY - parentRect.top + scrollTop - offset.y) / scale.y;
      setNewPosition({ x: newX, y: newY });
    } else if (lastTouch && draggableParent.current) {
      const deltaX = e.clientX - lastTouch.x;
      const deltaY = e.clientY - lastTouch.y;

      draggableParent.current.scrollLeft -= deltaX;
      draggableParent.current.scrollTop -= deltaY;

      setLastTouch({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseDownDraggable = (idea: IdeaInterface) => (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if (e.currentTarget && draggableParent.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const parentRect = draggableParent.current.getBoundingClientRect();
      const scrollTop = draggableParent.current.scrollTop;
      const scrollLeft = draggableParent.current.scrollLeft;
      const xOffset = e.clientX - rect.left;
      const yOffset = e.clientY - rect.top;
      const newX = (e.clientX - parentRect.left + scrollLeft - xOffset) / scale.x;
      const newY = (e.clientY - parentRect.top + scrollTop - yOffset) / scale.y;
      setOffset({ x: xOffset , y: yOffset });
      setNewPosition({ x: newX, y: newY });
      setDraggingIdea(idea);

      if ((e.ctrlKey || e.metaKey) && isAuthor) {
        const groupNumber = groups[idea.id];
        setDraggingGroup(groupNumber);
      }
    }
  };

  const handleMouseUp = () => {
    if (draggingIdea) {
      if (draggingGroup !== null) {
        const newPositions: Record<string, { x: number; y: number }> = {};
        ideas.forEach((idea) => {
          if (groups[idea.id] === draggingGroup) {
            const newGroupPosition = {
              x: idea.x + (newPosition.x - draggingIdea!.x),
              y: idea.y + (newPosition.y - draggingIdea!.y),
            };
            newPositions[idea.id] = newGroupPosition;
          }
        });
        updatePositions(id, newPositions);
      } else {
        updatePosition(id, draggingIdea!.id, newPosition);
      }
      setDraggingIdea(null);
      setDraggingGroup(null);
    } else {
      setLastTouch(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setLastTouch({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setLastTouch({ x: touch.clientX, y: touch.clientY });
    }

  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && lastTouch && draggableParent.current) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouch.x;
      const deltaY = touch.clientY - lastTouch.y;

      draggableParent.current.scrollLeft -= deltaX;
      draggableParent.current.scrollTop -= deltaY;

      setLastTouch({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = () => {
    setLastTouch(null);
  };

  return (
    <>
      <main className="flex-grow flex flex-col h-full">
        <div
          ref={draggableParent}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-grow relative overflow-y-auto overflow-x-auto"
          style={{
            "cursor": draggingIdea
              ? "move"
              : lastTouch
                ? "grabbing"
                : "grab",
            touchAction: "none",
          }}
        >
          {retros[id] &&
            retros[id].ideas.map((iterIdea) => (
              <Draggable
                key={iterIdea.id}
                idea={`${mapRetroType(retros[id].retroType, iterIdea.type as IdeaType).emoji} ${iterIdea.idea}`}
                ideaId={iterIdea.id}
                left={
                  draggingIdea?.id === iterIdea.id
                    ? newPosition.x
                    : draggingGroup !== null && groups[iterIdea.id] === draggingGroup
                      ? iterIdea.x + (newPosition.x - draggingIdea!.x)
                      : iterIdea.x
                }
                top={
                  draggingIdea?.id === iterIdea.id
                    ? newPosition.y
                    : draggingGroup !== null && groups[iterIdea.id] === draggingGroup
                      ? iterIdea.y + (newPosition.y - draggingIdea!.y)
                      : iterIdea.y
                }
                zIndex={iterIdea.z}
                onMouseDown={handleMouseDownDraggable(iterIdea)}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                scale={scale}
                groupNumber={groups[iterIdea.id]}
                isDragging={
                  draggingIdea?.id === iterIdea.id ||
                  (draggingGroup !== null && groups[iterIdea.id] === draggingGroup)
                }
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
