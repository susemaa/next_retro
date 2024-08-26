import { FullRetro } from "@/app/api/storage/storage";
import { ideaTypes, mapRetroType, IdeaType } from "@/app/api/storage/storageHelpers";

export function generateSummaryHTML(retro: FullRetro) {
  const members = retro.everJoinedUsers.map(user => user.name).join(", ");

  const questions = ideaTypes.map((type) => {
    const { emoji, question, msg, synonyms } = mapRetroType(retro.retroType, type);
    return `<li>${question} ${msg} (${synonyms.join(", ")}) - <strong>${msg.toUpperCase()}</strong> ${emoji}</li>`;
  }).join("");

  const groups = retro.groups.sort((a, b) => b.votes.length - a.votes.length).map((group) => {
    const ideas = group.ideas.map((ideaId) => {
      const idea = retro.ideas.find((idea) => idea.id === ideaId);
      return idea ? `<div style="margin-bottom: 8px;">${mapRetroType(retro.retroType, idea.type as IdeaType).emoji} ${idea.idea}</div>` : "";
    }).join("");
    return `
      <div style="border: 1px solid #d1d5db; background-color: #f3f4f6; border-radius: 8px; margin-bottom: 8px;">
        <div style="padding: 16px; font-size: 18px; font-weight: 500;">${group.name || "Unlabeled"} - ${group.votes.length} votes</div>
        <div style="padding: 16px;">${ideas}</div>
      </div>
    `;
  }).join("");

  const actionItems = retro.actionItems.map((item) => {
    const authorName = retro.everJoinedUsers.find(user => user.email === item.authorEmail)?.name || "Unauthored";
    const assignedName = retro.everJoinedUsers.find(user => user.email === item.assignedEmail)?.name || "Unassigned";
    return `<li>${authorName} - ${item.name} (${assignedName})</li>`;
  }).join("");

  const facilitatorName = retro.everJoinedUsers.find(user => user.email === retro.createdBy)?.name || retro.createdBy;

  return `
    <div style="padding: 16px; display: block; margin: auto;">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Retro: ${retro.name}</div>
      <div style="margin-bottom: 16px;">Summary: ${retro.summaryMsg}</div>
      <div style="margin-bottom: 16px;">
        <strong>Members (${retro.everJoinedUsers.length}):</strong> ${members}
      </div>
      <div style="margin-bottom: 16px;">
        <span>Each member anonymously answered the following 3 questions:</span>
        <ol style="list-style-type: decimal; padding-left: 20px;">${questions}</ol>
      </div>
      <div style="margin-bottom: 16px;">
        We clustered them into <strong>${retro.groups.length} thematic groups</strong> and prioritized as follows:
        ${groups}
      </div>
      <div style="margin-bottom: 16px;">
        As a result, the participants developed the following <strong>action plan for priority growth areas:</strong>
        <ul style="list-style-type: disc; padding-left: 20px;">${actionItems}</ul>
      </div>
      <div>
        The retrospective was facilitated by
        <a href="mailto:${retro.createdBy}" style="color: blue;">${facilitatorName}</a>
        using <a href="/" style="color: blue;">Next Retro</a> technology.
      </div>
    </div>
  `;
}
