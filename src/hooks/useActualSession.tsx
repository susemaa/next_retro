"use client";
import { useSession, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { Session } from "next-auth";

export const useActualSession = () => {
  const session = useSession();
  const [actualData, setActualData] = useState<Session | null>(session.data);

  useEffect(() => {
    // hysterical trick to fix useSession returning null in prod
    const checkSession = async () => {
      if (!session.data) {
        const fallbackSession = await getSession();
        setActualData(fallbackSession);
      } else {
        setActualData(session.data);
      }
    };

    checkSession();
  }, [session.data]);

  return {
    ...session,
    data: actualData,
  };
};