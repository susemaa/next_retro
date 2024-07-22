import { NextResponse } from "next/server";
import { addIdea, getFullRetro } from "../storage";
import { hasAccess } from "../storageHelpers";

interface Params {
  params: { retroId: string }
}

export async function GET(req: Request, { params }: Params) {
  const { retroId } = params;
  if (!hasAccess(req, retroId)) {
    return NextResponse.json({ status: 401, error: "Unauthorized" });
  }
  try {
    const retro = await getFullRetro(retroId);
    return NextResponse.json({ status: 200, retro });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ status: 500, error: `Error creating ${retroId}: ${error}` });
  }
}

export async function POST(req: Request, { params }: Params) {
  const { retroId } = params;
  if (!hasAccess(req, retroId)) {
    return NextResponse.json({ status: 401, error: "Unauthorized" });
  }
  try {
    // const { idea } = await req.json();
    // await addIdea(retroId, idea);
    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 500, error: `Error sending idea: ${error}` });
  }
}
