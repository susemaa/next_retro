import { Retro } from "@/contexts/RetroContext";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// TODO replace with real storage
// Mock storage for retros
const retros = new Map<string, Retro>();
retros.set("123", {
  createdAt: 1,
  createdBy: "ryan@gosling.com",
  
});

export async function createRetro(request: Request) {
  const { email } = await request.json();
  const generatedUuid = uuidv4();
  retros.set(generatedUuid, { createdAt: Date.now(), createdBy: email });
  console.log("created,", retros);
  return NextResponse.json({ id: generatedUuid });
}

export async function getRetro(request: Request) {
  const retroId = request.url.split("/retros/")[1];

  if (retros.has(retroId)) {
    return NextResponse.json(retros.get(retroId), { status: 200 });
  } else {
    return NextResponse.json({ error: "Retro not found" }, { status: 404 });
  }
}
