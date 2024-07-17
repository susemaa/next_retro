import { memo } from "react";
import Image from "next/image";

interface UserCardProps {
  imageSrc?: string | null;
  name?: string | null;
  role: "facilitator" | "member";
}

const UserCard: React.FC<UserCardProps> = ({ imageSrc, name, role }) => {
  const isLoading = !imageSrc || !name;

  return (
    <div className="grid">
      <div className="card bg-base-100 shadow-2xl">
        <div className="card-body pl-0">
          <div className="flex items-center space-x-4">
            <div className="avatar">
              <div className={`w-12 rounded-full ${isLoading ? "skeleton" : ""}`}>
                {!isLoading && (
                  <Image src={imageSrc || "/avatar-placeholder.png"} alt="User Avatar" width={100} height={100}/>
                )}
              </div>
            </div>
            <div>
              <div className={`card-title h-5 w-28 mb-4 ${isLoading ? "skeleton" : ""}`}>
                {!isLoading && name}
              </div>
              <div className={`h-4 w-20 ${isLoading ? "skeleton" : "text-sm"}`}>
                {!isLoading && `${role[0].toUpperCase()}${role.slice(1)}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(UserCard);
