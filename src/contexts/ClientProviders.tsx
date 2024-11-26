"use client";
import React, { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import SessionProviderWrapper from "@/contexts/SessionProviderWrapper";
import { RetroProvider } from "@/contexts/RetroContext";
import { Session } from "next-auth";

interface ClientProvidersProps {
  children: React.ReactNode;
}

const ClientProviders: React.FC<ClientProvidersProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
    };

    fetchSession();
  }, []);

  return (
    <SessionProviderWrapper session={session}>
      <RetroProvider initialRetros={{}}>
        {children}
      </RetroProvider>
    </SessionProviderWrapper>
  );
};

export default ClientProviders;
