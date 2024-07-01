import { memo } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/nextAuth";

const Navbar: React.FC = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div className="navbar bg-base-100 shadow-lg p-0">
      <div className="navbar-start pl-8">
        <Link href="/" className="normal-case font-bold text-xl p-0">Next Retro</Link>
      </div>
      <div className="navbar-end pr-8">
        {/* questionable */}
        {!session && <Link href="/login" className="btn btn-primary btn-outline">Log In</Link>}
        {session && <Link href="/logout" className="btn btn-primary btn-outline">Log Out</Link>}
      </div>
    </div>
  );
};

export default memo(Navbar);
