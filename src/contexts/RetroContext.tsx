"use client";
import { createContext, useContext, useState, ReactNode, useEffect, SetStateAction, Dispatch } from "react";
import { getSocket } from "@/socket";
import { useSession } from "next-auth/react";
import { Retro, User, Stage, Group, Idea } from "@prisma/client";
import { FullRetro } from "@/app/api/storage/storage";
import { IdeaType } from "@/app/api/storage/storageHelpers";

export type UserData = {
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export type RawGroup = Omit<Group, "id" | "retroUId">;

export type errResponse = { status: 404, error: string };

export type CreateRetroCallback = (
  data: { status: 200, id: string, retro: FullRetro } | errResponse
) => void;

export type GetRetroCallback = (
  data: { status: 200, retro: FullRetro } | errResponse
) => void;

export type ChangeRetroStateCallback = (
  data: { status: 200, retro: FullRetro} | errResponse
) => void;

export type InitPositionsCallback = (
  data: { status: 200 } | errResponse
) => void;

export type InitGroupsCallback = (
  data: { status: 200 } | errResponse
) => void;

interface RetroContextType {
  isLoading: boolean;
  retros: Record<string, FullRetro>;
  users?: Record<string, Record<string, UserData>>;
  updStorage: (email: string) => void;
  updateRetroInfo: (retroId: string, newName?: string, newDescription?: string) => void;
  sendUserData: (retroId: string, userData: UserData) => void;
  sendIdea: (retroId: string, type: IdeaType, message: string) => void;
  removeIdea: (retroId: string, ideaId: string) => void;
  updateIdea: (retroId: string, ideaId: string, newType: IdeaType, newIdea: string) => void;
  initPositions: (retroId: string, ideas: Idea[], callback: InitPositionsCallback) => void;
  initGroups: (retroId: string, groups: Record<string, string[]>, callback: InitGroupsCallback) => void;
  updateGroupName: (retroId: string, groupId: string, newName: string) => void;
  updatePosition: (retroId: string, ideaId: string, newPosition: { x: number; y : number }) => void;
  updatePositions: (retroId: string, positions: Record<string, { x: number; y: number }>) => void;
  voteAdd: (retroId: string, groupId: string, email: string) => void;
  voteSubstract: (retroId: string, groupId: string, email: string) => void;
  sendActionItem: (retroId: string, author: User, assignee: User, item: string) => void;
  removeActionItem: (retroId: string, itemId: string) => void;
  updateActionItem: (retroId: string, actionItemId: string, newAssignee: User | "unassigned", newName: string) => void;
  updateActionAuthor: (retroId: string, actionItemId: string, newAuthor: User | "unauthored") => void;
  changeRetroStage: (
    retroId: string,
    stage: Stage,
    callback: ChangeRetroStateCallback,
  ) => void;
  getGroup: (retroId: string, groupId: string) => Group | undefined;
}

const RetroContext = createContext<RetroContextType | undefined>(undefined);

export const RetroProvider = ({
  children,
  initialRetros
}: {
  children: ReactNode,
  initialRetros: Record<string, FullRetro>
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [retros, setRetros] = useState<Record<string, FullRetro>>(initialRetros);
  const [users, setUsers] = useState<Record<string, Record<string, UserData>>>();

  useEffect(() => {
    const socket = getSocket();
    function onConnect() {
    }

    function onDisconnect() {
      setIsLoading(true);
    }

    function onRetroUpdated(updatedRetro: FullRetro, retroId: string) {
      setRetros((prevRetros) => ({
        ...prevRetros,
        [retroId]: updatedRetro
      }));
    }

    function onStorage(store: FullRetro[]) {
      const storeRecord: Record<string, FullRetro> = store.reduce((acc, retro) => {
        acc[retro.uId] = retro;
        return acc;
      }, {} as Record<string, FullRetro>);
      setRetros(storeRecord);
      setIsLoading(false);
    }

    function onUsers(retroId: string, usersData: Record<string, UserData>) {
      setUsers((prevUsers) => {
        const newUsers = { ...prevUsers };
        newUsers[retroId] = usersData;
        return newUsers;
      });
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("retroUpdated", onRetroUpdated);
    socket.on("storage", onStorage);
    socket.on("users", onUsers);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("retroUpdated", onRetroUpdated);
      socket.off("storage", onStorage);
      socket.off("users", onUsers);
    };
  }, []);

  const socket = getSocket();

  const updateRetroInfo = (retroId: string, newName?: string, newDescription?: string) => {
    socket.emit("updateRetroInfo", retroId, newName, newDescription);
  };

  const sendIdea = (retroId: string, type: IdeaType, message: string) => {
    socket.emit("idea", retroId, type, message);
  };

  const removeIdea = (retroId: string, ideaId: string) => {
    socket.emit("removeIdea", retroId, ideaId);
  };

  const updateIdea = (retroId: string, ideaId: string, newType: IdeaType, newIdea: string) => {
    socket.emit("updateIdea", retroId, ideaId, newType, newIdea);
  };

  const initPositions = (retroId: string, ideas: Idea[], callback: InitPositionsCallback) => {
    socket.emit("initPositions", retroId, ideas, callback);
  };

  const updatePosition = (retroId: string, ideaId: string, newPosition: { x: number; y : number }) => {
    socket.emit("updatePosition", retroId, ideaId, newPosition);
  };

  const updatePositions = (retroId: string, positions: Record<string, { x: number; y: number }>) => {
    socket.emit("updatePositions", retroId, positions);
  };

  const initGroups = (retroId: string, groups: Record<string, string[]>, callback: InitGroupsCallback) => {
    socket.emit("initGroups", retroId, groups, callback);
  };

  const updateGroupName = (retroId: string, groupId: string, newName: string) => {
    socket.emit("updateGroupName", retroId, groupId, newName);
  };

  const voteAdd = (retroId: string, groupId: string, email: string) => {
    socket.emit("voteAdd", retroId, groupId, email);
  };

  const voteSubstract = (retroId: string, groupId: string, email: string) => {
    socket.emit("voteSubstract", retroId, groupId, email);
  };

  const sendActionItem = (retroId: string, author: User, assignee: User, item: string) => {
    socket.emit("sendActionItem", retroId, author, assignee, item);
  };

  const removeActionItem = (retroId: string, actionItemId: string) => {
    socket.emit("removeActionItem", retroId, actionItemId);
  };

  const updateActionItem = (retroId: string, actionItemId: string, newAssignee: User | "unassigned", newName: string) => {
    socket.emit("updateActionItem", retroId, actionItemId, newAssignee, newName);
  };

  const updateActionAuthor = (retroId: string, actionItemId: string, newAuthor: User | "unauthored") => {
    socket.emit("updateActionAuthor", retroId, actionItemId, newAuthor);
  };

  const sendUserData = (retroId: string, userData: UserData) => {
    socket.emit("user", retroId, userData);
  };

  const updStorage = (email: string) => {
    socket.emit("upd", email);
  };

  const changeRetroStage = (
    retroId: string,
    stage: Stage,
    callback: ChangeRetroStateCallback
  ) => {
    socket.emit("changeRetroStage", retroId, stage, callback);
  };

  const getGroup = (retroId: string, groupId: string) => {
    return retros[retroId]?.groups
      .find(group => group.id === groupId);
  };

  return (
    <RetroContext.Provider value={{
      isLoading,
      retros,
      updateRetroInfo,
      users,
      updStorage,
      sendUserData,
      changeRetroStage,
      sendIdea,
      removeIdea,
      updateIdea,
      initPositions,
      updatePosition,
      updatePositions,
      initGroups,
      updateGroupName,
      voteAdd,
      voteSubstract,
      sendActionItem,
      removeActionItem,
      updateActionItem,
      updateActionAuthor,
      getGroup,
    }}>
      {children}
    </RetroContext.Provider>
  );
};

export const useRetroContext = () => {
  const context = useContext(RetroContext);
  if (!context) {
    throw new Error("useRetroContext must be used within a RetroProvider");
  }
  return context;
};
