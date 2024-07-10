"use client";
import { getRetroDataFromCookies } from "@/app/api/retros/retrosApi";
import Grouping from "@/components/RetroStages/Grouping";
import IdeaGeneration from "@/components/RetroStages/IdeaGeneration";
import PrimeDirective from "@/components/RetroStages/PrimeDirective";
import RetroLobby from "@/components/RetroStages/RetroLobby";
import { GetRetroCallback, Retro, useRetroContext } from "@/contexts/RetroContext";
import { get } from "http";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

// async function getRetroData(retroId: string): Promise<Retro> {
//     const response = await fetch(new URL(`/api/retros/${retroId}`, "http://localhost:3000"), {
//         method: "GET",
//         cache: "no-store",
//     });
//     if (!response.ok) {
//         throw new Error(`Failed to fetch retro data: ${response.statusText}`);
//     }
//     return response.json();
// }

// export default async function RetroPage({ params }: { params: { retro_id: string } }) {
export default function RetroPage({ params }: { params: { retro_id: string } }) {
  // const retroData = await getRetroDataFromCookies();
  // const retroData = await getRetroData(params.retro_id);
  const { retros, isLoading, updStorage, sendUserData } = useRetroContext();
  const { data } = useSession();
  const [retroData, setRetroData] = useState(retros[params.retro_id]);

  useEffect(() => {
    setRetroData(retros[params.retro_id]);
  }, [params.retro_id, retros]);

  useEffect(() => {
    console.log("RETRO PAGE", params.retro_id);
    if (data?.user) {
      console.log("CLIENT sending", params.retro_id, data.user);
      sendUserData(params.retro_id, data.user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user, params.retro_id]);

  if (!retroData || !data?.user) {
    setTimeout(() => {
      if (isLoading) {
        updStorage();
      }
    }, 1500);
    return (
      <div className="flex-grow flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="text-lg font-bold">Loading...</div>
          <span className="loading loading-spinner loading-lg mt-2"></span>
        </div>
      </div>
    );
  }

  const { createdBy, stage } = retroData;
  return (
    <>
      {stage === "lobby" && <RetroLobby id={params.retro_id} createdBy={createdBy} />}
      {stage === "prime_directive" && <PrimeDirective id={params.retro_id} createdBy={createdBy} />}
      {stage === "idea_generation" && <IdeaGeneration id={params.retro_id} createdBy={createdBy} />}
      {stage === "grouping" && <Grouping id={params.retro_id} createdBy={createdBy} />}
    </>
  );
}
