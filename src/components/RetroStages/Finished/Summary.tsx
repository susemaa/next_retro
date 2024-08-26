import React, { forwardRef } from "react";
import Link from "next/link";
import { useRetroContext } from "@/contexts/RetroContext";
import { IdeaType, ideaTypes, mapRetroType } from "@/app/api/storage/storageHelpers";
import { FullRetro } from "@/app/api/storage/storage";

interface SummaryProps {
  id: string;
  createdBy: string;
  retroName: string;
  retroSummary: string;
  isAuthor: boolean;
  name: string;
  summary: string;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSummaryChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleBlur: (type: "name" | "summary") => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const Summary = forwardRef<HTMLDivElement, SummaryProps>(({
  id,
  createdBy,
  retroName,
  retroSummary,
  isAuthor,
  name,
  summary,
  handleNameChange,
  handleSummaryChange,
  handleBlur,
}, ref) => {
  const { retros } = useRetroContext();

  return (
    <div ref={ref} className="p-4 flex flex-col mx-auto">
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
            <input type="checkbox" defaultChecked />
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
  );
});

Summary.displayName = "Summary";
export default Summary;
