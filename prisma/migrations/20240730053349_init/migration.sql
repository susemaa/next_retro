-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('lobby', 'prime_directive', 'idea_generation', 'grouping', 'group_labeling', 'voting', 'action_items', 'finished');

-- CreateEnum
CREATE TYPE "RetroType" AS ENUM ('emotions', 'progress');

-- CreateTable
CREATE TABLE "Retro" (
    "id" SERIAL NOT NULL,
    "uId" TEXT NOT NULL,
    "retroType" "RetroType" NOT NULL,
    "votesAmount" INTEGER NOT NULL,
    "stage" "Stage" NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "everJoined" TEXT[],

    CONSTRAINT "Retro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "idea" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "retroUId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "z" INTEGER NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ideas" TEXT[],
    "votes" TEXT[],
    "retroUId" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "retroUIds" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "retroUId" TEXT NOT NULL,
    "assignedEmail" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Retro_uId_key" ON "Retro"("uId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_retroUId_fkey" FOREIGN KEY ("retroUId") REFERENCES "Retro"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_retroUId_fkey" FOREIGN KEY ("retroUId") REFERENCES "Retro"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_retroUId_fkey" FOREIGN KEY ("retroUId") REFERENCES "Retro"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;
