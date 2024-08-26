import { NextRequest, NextResponse } from "next/server";
import { createRetro } from "./storage";
import { getToken } from "next-auth/jwt";
import { RetroType } from "@prisma/client";

export async function POST(req: Request) {
  const token = await getToken({ req: req as NextRequest, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.email) {
    return NextResponse.json({ status: 401, error: "Unauthorized" });
  }
  try {
    const { retroType, votesAmount, canUsersLabelGroups } = await req.json();
    if (!(retroType in RetroType)) {
      return NextResponse.json({ status: 400, error: "Invalid retro type" });
    }
    const retro = await createRetro(token.email, retroType, votesAmount, canUsersLabelGroups);
    return NextResponse.json({ status: 200, message: `successfully created ${retro.uId}`, id: retro.uId });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ status: 500, error: `Error creating retro: ${error}` });
  }
}

