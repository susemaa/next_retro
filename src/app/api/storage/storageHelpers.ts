import { RetroType } from "@prisma/client";
import { FullRetro, getFullStore, getStore } from "./storage";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function hasAccess(req: Request, retroId: string): Promise<boolean> {
  const token = await getToken({ req: req as NextRequest, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.email) {
    return false;
  }
  const retros = await getStore(token.email);
  return retros.some(retro => retro.uId === retroId);
}

export type IdeaType = 0 | 1 | 2
export const ideaTypes = [0, 1, 2] as const;

export type MsgType = "Happy" | "Sad" | "Confused" | "Start" | "Stop" | "Continue";

const emotionsQ = "I was";
const progressQ = "I want to";

const map: Record<
    RetroType, Record<IdeaType, {
      emoji: string;
      msg: MsgType;
      synonyms: string[];
      question: string;
    }>
  > = {
    "emotions": {
      0: {
        emoji: "😊",
        msg: "Happy",
        synonyms: ["joyful", "content", "pleased"],
        question: emotionsQ,
      },
      1: {
        emoji: "😢",
        msg: "Sad",
        synonyms: ["unhappy", "sorrowful", "dejected"],
        question: emotionsQ,
      },
      2: {
        emoji: "😕",
        msg: "Confused",
        synonyms: ["perplexed", "baffled", "bewildered"],
        question: emotionsQ,
      },
    },
    "progress": {
      0: {
        emoji: "🟢",
        msg: "Start",
        synonyms: ["begin", "commence", "initiate"],
        question: progressQ,
      },
      1: {
        emoji: "🔴",
        msg: "Stop",
        synonyms: ["halt", "cease", "terminate"],
        question: progressQ,
      },
      2: {
        emoji: "🟡",
        msg: "Continue",
        synonyms: ["persist", "proceed", "carry on"],
        question: progressQ,
      },
    }
  };

export const mapRetroType = (retroType: RetroType, ideaType: IdeaType) => {
  return map[retroType][ideaType];
};

export const getIdeaTypeFromMsg = (retroType: RetroType, msg: MsgType): IdeaType => {
  const ideaTypes = map[retroType];
  for (const [key, value] of Object.entries(ideaTypes)) {
    if (value.msg === msg) {
      return parseInt(key) as IdeaType;
    }
  }
  throw new Error(`Invalid message: ${msg}`);
};
