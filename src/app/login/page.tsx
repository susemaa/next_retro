"use client";
import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function Logout() {
  useEffect(() => {
    signIn("google");
  }, []);
  return null;
}
