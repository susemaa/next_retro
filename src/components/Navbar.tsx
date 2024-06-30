"use client";
import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

const Navbar: React.FC = () => {
  const { status } = useSession();
  // returns unauth even if authed ??
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "loading") {
      setLoading(false);
    }
  }, [status]);
  // console.log("STATUS", status);
  return (
    <div className="navbar bg-base-100 shadow-lg p-0">
      <div className="navbar-start pl-8">
        <Link href="/" className="normal-case font-bold text-xl p-0">Next Retro</Link>
      </div>
      <div className="navbar-end pr-8">
        {status === "authenticated" && <button onClick={() => signOut()} className="btn btn-primary btn-outline">Log Out</button>}
        {status === "unauthenticated" && <button onClick={() => signIn("google")} className="btn btn-primary btn-outline">Sign In with Google</button>}
        {/* {!loading && status === "authenticated" && <button onClick={() => signOut()} className="btn btn-primary">Log Out</button>}
        {!loading && status === "unauthenticated" && <button onClick={() => signIn("google")} className="btn btn-primary">Sign In with Google</button>} */}
      </div>
    </div>
  );
};

export default memo(Navbar);
