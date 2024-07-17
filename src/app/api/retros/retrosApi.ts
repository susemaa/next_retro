import { Retro, retroStages } from "@/contexts/RetroContext";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { get, getStore, set } from "@/../store";

export async function createRetro(request: Request) {
  const { email } = await request.json();
  const generatedUuid = uuidv4();
  set(
    generatedUuid,
    {
      createdAt: Date.now(),
      createdBy: email,
      stage: "lobby" as const,
      ideas: {
        "happy": [],
        "sad": [],
        "confused": [],
      },
      groups: {},
      everJoined: [],
      actionItems: [],
    });
  console.log("created,", getStore());
  return NextResponse.json({ id: generatedUuid });
}

export async function getRetro(request: Request) {
  const retroId = request.url.split("/retros/")[1];

  const retro = get(retroId);
  if (retro) {
    return NextResponse.json(retro, { status: 200 });
  } else {
    return NextResponse.json({ error: "Retro not found" }, { status: 404 });
  }
}

export async function getRetros(_request: Request) {
  const storage = getStore();
  return NextResponse.json(storage.retros);
}

export async function changeRetroStage(request: Request) {
  const retroId = request.url.split("/retros/")[1];
  const { stage } = await request.json();
  // TODO check if stage is allowed

  const retro = get(retroId);
  if (retro) {
    retro.stage = stage;
    set(retroId, retro);
    return NextResponse.json(retro, { status: 200 });
  } else {
    return NextResponse.json({ error: "Retro not found" }, { status: 404 });
  }
}

export function getRetroDataFromCookies(): Retro | null {
  const cookieStore = cookies();
  const retroData = cookieStore.get("retroData");
  if (retroData) {
    return JSON.parse(retroData.value) as Retro;
  }
  return null;
}
