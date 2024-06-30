"use client";
import Link from "next/link";
import { memo, useState } from "react";

interface RetroProps {
  title: string;
  items: { itemName: string; owner: string }[];
}

const RetroLi: React.FC<RetroProps> = ({ title, items }) => {
  const [opened, setOpened] = useState(false);
  const toggleOpen = () => {
    setOpened(!opened);
  };
  return (
    <li>
      <Link href="#" className="text-blue-500">{title}</Link>
      <div className="ml-4 collapse w-1/2">
        <input className="w-1/2 max-h-1/2" type="checkbox" onClick={toggleOpen} />
        <div className="collapse-title text-sm font-medium">
          <span className={`inline-block transform transition-transform duration-300 ${opened ? "rotate-90" : "rotate-0"}`}>&gt;</span> Action Items
        </div>
        <div className="collapse-content mt-0">
          <ul className="list-circle list-inside ml-4">
            {items.map((item, id) => (
              <li key={`${title}_${id}_item`}>
                {item.itemName} ({item.owner})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
};

export default memo(RetroLi);
