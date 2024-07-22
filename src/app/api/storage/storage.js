import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

export async function getRetro(uId) {
  return await prisma.retro.findUnique({
    where: { uId },
  });
}

export async function getGroups(uId) {
  return await prisma.group.findMany({
    where: { retroUId: uId },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getIdeas(uId) {
  return await prisma.idea.findMany({
    where: { retroUId: uId },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getActionItems(uId) {
  return await prisma.actionItem.findMany({
    where: { retroUId: uId },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getEverjoined(uId) {
  return await prisma.user.findMany({
    where: {
      retroUIds: {
        has: uId,
      },
    },
  });
}

export async function getUser(email) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function getFullRetro(uId) {
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

export async function createRetro(createdBy, retroType) {
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
      createdAt: Math.floor(Date.now() / 1000),
      everJoined: [],
      ideas: { create: [] },
      groups: { create: [] },
      actionItems: { create: [] },
    },
  });
}

export async function addUser(email, name, image) {
  return await prisma.user.create({
    data: {
      email,
      name,
      image,
    },
  });
}

export async function updateUser(email, joinedRetroId) {
  return await prisma.user.update({
    where: { email },
    data: {
      retroUIds: {
        push: joinedRetroId,
      },
    },
  });
}

export async function addGroup(retroUId, ideaIds) {
  return await prisma.group.create({
    data: {
      retroUId,
      name: "",
      ideas: ideaIds,
    },
  });
}

export async function addGroups(retroUId, ideaIds) {
  const groupsData = ideaIds.map(ideas => ({
    retroUId,
    name: "",
    ideas: { set: ideas },
  }));

  return await prisma.group.createMany({
    data: groupsData,
  });
}

export async function updateGroup(groupId, newGroup) {
  return await prisma.group.update({
    where: { id: groupId },
    data: newGroup,
  });
}

export async function addIdea(retroUId, idea, ideaType) {
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

export async function updateIdea(ideaId, newIdeaData) {
  return await prisma.idea.update({
    where: { id: ideaId },
    data: newIdeaData,
  });
}

export async function deleteIdea(ideaId) {
  return await prisma.idea.delete({
    where: { id: ideaId },
  });
}

export async function addEverjoined(retroUId, email) {
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

export async function addActionItem(retroUId, name, authorEmail, assignedEmail) {
  return await prisma.actionItem.create({
    data: {
      retroUId,
      name,
      assignedEmail,
      authorEmail,
    },
  });
}

export async function deleteActionItem(itemId) {
  return await prisma.actionItem.delete({
    where: { id: itemId },
  });
}

export async function updateActionItem(itemId, newActionItem) {
  return await prisma.actionItem.update({
    where: { id: itemId },
    data: newActionItem,
  });
}

export async function updateRetro(retroId, newRetro) {
  return await prisma.retro.update({
    where: { uId: retroId },
    data: newRetro,
  });
}

export async function getStore(email) {
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

export async function getFullStore(email) {
  const retros = await getStore(email);
  const fullRetros = await Promise.all(retros
    .map(retro => retro.uId)
    .map(async (retroUId) => await getFullRetro(retroUId)));
  return fullRetros.filter(v => !!v);
}
