"use client";
import { memo } from "react";
import UserCard from "./UserCard";
import { UserData } from "@/contexts/RetroContext";

const CurrentUsers: React.FC<{ users: Record<string, UserData>; createdBy: string }> = ({ users, createdBy }) => {
  return (
    <div className="mb-4">
      <span className="text-2xl font-bold mb-4 pb-2 border-b-2 border-current">
        Current Users
      </span>
      <div className="pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {users && Object.entries(users)
          .map(([socketId, user]) =>
            <UserCard
              key={socketId}
              role={createdBy === user.email ? "facilitator" : "member"}
              name={user.name}
              imageSrc={user.image}
            />
          )
        }
      </div>
    </div>
  );
};

export default memo(CurrentUsers);
