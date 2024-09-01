import { PrismaClient, RetroType, Group, Idea, User, Retro, ActionItem } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

export type FullRetro = Retro & {
  groups: Group[];
  ideas: Idea[];
  everJoinedUsers: User[];
  actionItems: ActionItem[];
};

export async function getRetro(uId: string) {
  return await prisma.retro.findUnique({
    where: { uId },
  });
}

export async function getGroups(uId: string) {
  return await prisma.group.findMany({
    where: { retroUId: uId },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getIdeas(uId: string) {
  return await prisma.idea.findMany({
    where: { retroUId: uId },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getActionItems(uId: string) {
  return await prisma.actionItem.findMany({
    where: { retroUId: uId },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getEverjoined(uId: string) {
  return await prisma.user.findMany({
    where: {
      retroUIds: {
        has: uId,
      },
    },
  });
}

export async function getUser(email: string) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function getFullRetro(uId: string): Promise<FullRetro | null> {
  const retro = await getRetro(uId);
  if (!retro) {
    return null;
  }
  const groups = await getGroups(uId);
  const ideas = await getIdeas(uId);
  const everJoinedUsers = await getEverjoined(uId);
  const actionItems = await getActionItems(uId);
  return {
    ...retro,
    groups,
    ideas,
    actionItems,
    everJoinedUsers,
  };
}

export async function createRetro(
  createdBy: string,
  retroType: RetroType,
  votesAmount: number,
  canUsersLabelGroups = true,
) {
  const uId = uuid();
  const stage = "lobby";
  return await prisma.retro.upsert({
    where: { uId },
    update: { retroType, stage, createdBy },
    create: {
      uId,
      retroType,
      stage,
      createdBy,
      canUsersLabelGroups,
      createdAt: Math.floor(Date.now() / 1000),
      votesAmount,
      everJoined: [],
      ideas: { create: [] },
      groups: { create: [] },
      actionItems: { create: [] },
    },
  });
}

export async function addUser(email: string, name: string, image: string) {
  return await prisma.user.create({
    data: {
      email,
      name,
      image,
    },
  });
}

export async function updateUser(email: string, joinedRetroId: string) {
  return await prisma.user.update({
    where: { email },
    data: {
      retroUIds: {
        push: joinedRetroId,
      },
    },
  });
}

export async function addGroup(retroUId: string, ideaIds: string[]) {
  return await prisma.group.create({
    data: {
      retroUId,
      name: "",
      ideas: ideaIds,
    },
  });
}

export async function addGroups(retroUId: string, ideaIds: string[][]) {
  const groupsData = ideaIds.map(ideas => ({
    retroUId,
    name: "",
    ideas: { set: ideas },
  }));

  return await prisma.group.createMany({
    data: groupsData,
  });
}

export async function updateGroup(groupId: string, newGroup: Group) {
  return await prisma.group.update({
    where: { id: groupId },
    data: newGroup,
  });
}

export async function addIdea(retroUId: string, idea: string, ideaType: number) {
  return await prisma.idea.create({
    data: {
      retroUId,
      idea,
      type: ideaType,
      x: 0,
      y: 0,
      z: 0,
    },
  });
}

export async function updateIdea(ideaId: string, newIdeaData: Idea) {
  return await prisma.idea.update({
    where: { id: ideaId },
    data: newIdeaData,
  });
}

export async function deleteIdea(ideaId: string) {
  return await prisma.idea.delete({
    where: { id: ideaId },
  });
}

export async function addEverjoined(retroUId: string, email: string) {
  const retro = await getRetro(retroUId);

  if (retro && !retro.everJoined.includes(email)) {
    await updateUser(email, retroUId);
    return await prisma.retro.update({
      where: { uId: retroUId },
      data: {
        everJoined: {
          push: email,
        },
      },
    });
  }

  return null;
}

export async function addActionItem(retroUId: string, name: string, authorEmail: string, assignedEmail: string) {
  return await prisma.actionItem.create({
    data: {
      retroUId,
      name,
      assignedEmail,
      authorEmail,
    },
  });
}

export async function deleteActionItem(itemId: number) {
  return await prisma.actionItem.delete({
    where: { id: itemId },
  });
}

export async function updateActionItem(itemId: number, newActionItem: ActionItem) {
  return await prisma.actionItem.update({
    where: { id: itemId },
    data: newActionItem,
  });
}

export async function updateRetro(retroId: string, newRetro: Omit<Retro, "id">) {
  return await prisma.retro.update({
    where: { uId: retroId },
    data: newRetro,
  });
}

export async function getStore(email: string) {
  const user = await getUser(email);
  if (!user) {
    return [];
  }

  return await prisma.retro.findMany({
    where: {
      OR: [
        { createdBy: email },
        { uId: { in: user.retroUIds } },
      ],
    },
  });
}

export async function getFullStore(email: string) {
  const retros = await getStore(email);
  const fullRetros = await Promise.all(retros
    .map(retro => retro.uId)
    .map(async (retroUId) => await getFullRetro(retroUId)));
  return fullRetros.filter(v => !!v);
}
