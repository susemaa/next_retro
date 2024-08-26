"use client";
import React, { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRetroContext } from "@/contexts/RetroContext";
import { WelcomeModal } from "@/components/Modals";
import useSocketValue from "@/hooks/useSocketValue";
import Footer from "../../Footer";
import GroupVoted from "./GroupVoted";
import ActionItem from "../ActionItems/ActionItem";
import useAuthor from "@/hooks/useAuthor";
import { IdeaType, ideaTypes, mapRetroType } from "@/app/api/storage/storageHelpers";
import { useReactToPrint } from "react-to-print";
import Summary from "./Summary";

interface Finished {
  id: string;
  createdBy: string;
  retroName: string;
  retroSummary: string;
}

const Finished: React.FC<Finished> = ({ id, createdBy, retroName, retroSummary }) => {
  const router = useRouter();
  const { retros, updateRetroInfo, changeRetroStage } = useRetroContext();
  const [name, setName] = useSocketValue(() => retros[id].name, [retros, id]);
  const [summary, setSummary] = useSocketValue(() => retros[id].summaryMsg, [retros, id]);
  const isAuthor = useAuthor(createdBy);
  const [view, setView] = useState<"overview" | "summary">("summary");
  const [nameTimer, setNameTimer] = useState<NodeJS.Timeout | undefined>(undefined);
  const [summaryTimer, setSummaryTimer] = useState<NodeJS.Timeout | undefined>(undefined);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    clearTimeout(nameTimer);
    setNameTimer(setTimeout(() => {
      updateRetroInfo(id, e.target.value, undefined);
    }, 750));
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value);
    clearTimeout(summaryTimer);
    setSummaryTimer(setTimeout(() => {
      updateRetroInfo(id, undefined, e.target.value);
    }, 750));
  };

  const handleBlur = (type: "name" | "summary") => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (type === "name") {
      updateRetroInfo(id, name, undefined);
      clearTimeout(nameTimer);
      setNameTimer(undefined);
    } else if (type === "summary") {
      updateRetroInfo(id, undefined, summary);
      clearTimeout(summaryTimer);
      setSummaryTimer(undefined);
    }
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "summary",
  });

  return (
    <>
      <main className="flex-grow flex h-full pt-4 overflow-y-scroll">
        {view === "overview" && <>
          <div className={`flex flex-col w-1/2 md:w-2/3 lg:w-3/4 mx-4 transition-opacity duration-500 ${view === "overview" ? "opacity-100" : "opacity-0"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {retros[id].groups.sort((ga, gb) => gb.votes.length - ga.votes.length).map((group) => (
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
                isAuthor={false}
              />
            ))}
          </div>
        </>}
        {view === "summary" && (
          <div
            className="flex flex-col mx-auto">
            <Summary
              id={id}
              createdBy={createdBy}
              retroName={retroName}
              retroSummary={retroSummary}
              isAuthor={isAuthor}
              name={name}
              summary={summary}
              handleNameChange={handleNameChange}
              handleSummaryChange={handleSummaryChange}
              handleBlur={handleBlur}
            />
            <button onClick={handlePrint} className="btn btn-primary mt-4">Save summary as PDF</button>
          </div>
        )}
      </main>
      <Footer
        isAuthor={true}
        title="This retro is all wrapped up!"
        caption="Contents are read-only."
        buttonTag="Visit your dashboard"
        customBtnClasses="btn-ghost"
        customOnClick={() => router.push("/retros")}
        optionalEl={
          <label className="swap swap-rotate">
            <input
              type="checkbox"
              checked={view === "summary"}
              onChange={() => setView(view === "overview" ? "summary" : "overview")}
            />
            <div className="swap-on">Summary</div>
            <div className="swap-off">Overview</div>
          </label>
        }
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
      <div style={{ display: "none" }}>
        <Summary
          ref={printRef}
          id={id}
          createdBy={createdBy}
          retroName={retroName}
          retroSummary={retroSummary}
          isAuthor={false}
          name={name}
          summary={summary}
          handleNameChange={handleNameChange}
          handleSummaryChange={handleSummaryChange}
          handleBlur={handleBlur}
        />
      </div>
    </>
  );
};

export default memo(Finished);
