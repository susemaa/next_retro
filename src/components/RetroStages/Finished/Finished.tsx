"use client";
import React, { memo, useState } from "react";
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

interface Finished {
  id: string;
  createdBy: string;
  retroName: string;
  retroSummary: string;
}

const Finished: React.FC<Finished> = ({ id, createdBy, retroName, retroSummary }) => {
  const router = useRouter();
  const { retros, updateRetroInfo } = useRetroContext();
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

  return (
    <>
      <main className="flex-grow flex h-full pt-4 overflow-y-scroll">
        {view === "overview" && <>
          <div className={`flex flex-col w-1/2 md:w-2/3 lg:w-3/4 mx-4 transition-opacity duration-500 ${view === "overview" ? "opacity-100" : "opacity-0"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {retros[id].groups.map((group) => (
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
          <div className="p-4 flex flex-col mx-auto">
            {isAuthor ? (
              <div className="relative flex justify-center mb-4">
                <input
                  value={name}
                  onChange={handleNameChange}
                  onBlur={handleBlur("name")}
                  className="input input-bordered w-full"
                  placeholder="Retro Name"
                />
                {retroName !== name && (
                  <span
                    className="absolute loading loading-spinner loading-s"
                    style={{
                      top: "50%",
                      right: "15px",
                      transform: "translateY(-50%)"
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="text-2xl font-bold mb-4">Retro: {name}</div>
            )}
            {isAuthor ? (
              <div className="relative flex flex-grow justify-center mb-4">
                <textarea
                  value={summary}
                  onChange={handleSummaryChange}
                  onBlur={handleBlur("summary")}
                  className="textarea textarea-bordered w-full resize-none"
                  placeholder="Retro Summary"
                />
                {retroSummary !== summary && (
                  <span
                    className="absolute loading loading-spinner loading-s"
                    style={{
                      top: "50%",
                      right: "15px",
                      transform: "translateY(-50%)"
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="mb-4">Summary: {summary}</div>
            )}
            <div className="mb-4">
              <strong>Members {retros[id].everJoinedUsers.length}:</strong> {retros[id].everJoinedUsers.map(user => user.name).join(", ")}
            </div>
            <div className="mb-4">
              <span className="mb-4">Each member anonymously answered 3 following questions:</span>
              <ol className="list-decimal list-inside">
                {ideaTypes.map((type) => {
                  const { emoji, question, msg, synonyms} = mapRetroType(retros[id].retroType, type);
                  return (
                    <li key={type}>
                      {question}{" "}{msg}
                      {" "}({synonyms.join(", ")})
                      {" - "}<strong>{msg.toUpperCase()}</strong>{" "}{emoji}
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="mb-4">
              We clustered them into <strong>{retros[id].groups.length} thematic groups</strong> and prioritized as follows:
              {retros[id].groups.sort((a, b) => b.votes.length - a.votes.length).map((group) => (
                <div key={group.id} className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-2">
                  <input type="checkbox" />
                  <div className="collapse-title text-lg font-medium">
                    {group.name} - {group.votes.length} votes
                  </div>
                  <div className="collapse-content">
                    {group.ideas.map((ideaId) => {
                      const idea = retros[id].ideas.find((idea) => idea.id === ideaId);
                      return idea && (
                        <div key={ideaId} className="mb-2">
                          {mapRetroType(retros[id].retroType, idea.type as IdeaType).emoji} {idea.idea}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-4">
              As a result, the participants developed the following <strong>action plan for priority growth areas:</strong>
              <ul className="list-disc list-inside">
                {retros[id].actionItems.map((item) => (
                  <li key={item.id}>
                    {retros[id].everJoinedUsers.find(user => user.email === item.authorEmail)?.name || "Unauthored"}
                    {" - "}{item.name}{" "}
                    ({retros[id].everJoinedUsers.find(user => user.email === item.assignedEmail)?.name || "Unassigned"})
                  </li>
                ))}
              </ul>
            </div>
            <div>
              The retrospective was facilitated by
              {" "}<Link href={`mailto:${createdBy}`} className="text-blue-500">{retros[id].everJoinedUsers.find(user => user.email === createdBy)?.name || createdBy}</Link>
              {" "}using <Link href="/" className="text-blue-500">Next Retro</Link> technology.
            </div>
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
    </>
  );
};

export default memo(Finished);
