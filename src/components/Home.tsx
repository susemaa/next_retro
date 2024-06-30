"use client";
import { signIn } from "next-auth/react";
import { memo } from "react";

const Home: React.FC = () => {
  const handleClick = () => {
    signIn("google");
  };

  return (
    <main className="flex-grow flex flex-col items-center pt-36 h-full">
      <h1 className="text-4xl font-bold mb-4">Welcome to Next Retro</h1>
      <button className="btn btn-primary btn-outline" onClick={handleClick}>Sign in with Google to get started</button>
    </main>
  );
};

export default memo(Home);