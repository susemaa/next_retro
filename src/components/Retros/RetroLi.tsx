"use client";
import { FullRetro } from "@/app/api/storage/storage";
import Link from "next/link";
import { memo, useRef, useState } from "react";

interface RetroProps {
  title: string;
  retro: FullRetro;
  id: string;
}

const RetroLi: React.FC<RetroProps> = ({ title, retro, id }) => {
  const [opened, setOpened] = useState(false);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const toggleOpen = () => {
    setOpened(!opened);
  };

  return (
    <li className={`collapse pointer-events-none ${opened ? "collapse-open" : ""}`}>
      <input className="w-1/2 max-h-1/2" type="checkbox" onClick={toggleOpen} />
      <div className="collapse-title text-sm font-medium">
        <button
          className={`inline-block transform transition-transform duration-300 mr-4 pointer-events-auto ${opened ? "rotate-90" : "rotate-0"}`}
          onClick={toggleOpen}
        >
          &gt;
        </button>
        {" "}<Link href={`/retros/${id}`} className="text-blue-500 pointer-events-auto">{title}</Link>
      </div>
      <div className="collapse-content mt-0">
        <ul className="list-circle list-inside ml-4">
          <li>
            Stage - {retro.stage}
          </li>
          {retro.actionItems.length > 0 && retro.actionItems.map((item, id) => (
            <li key={`${title}_${id}_item`}>
              {retro.everJoinedUsers.find(user => user.email === item.authorEmail)?.name || "Unauthored"}
              {" - "}{item.name}{" "}
              ({retro.everJoinedUsers.find(user => user.email === item.assignedEmail)?.name || "Unassigned"})
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

export default memo(RetroLi);
