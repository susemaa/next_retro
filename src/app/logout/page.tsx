"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function Logout() {
  useEffect(() => {
    signOut();
  }, []);
  return null;
}
