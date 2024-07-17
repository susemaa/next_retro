"use client";
import { createContext, useContext, useState, ReactNode, useEffect, SetStateAction, Dispatch } from "react";
import { getSocket } from "@/socket";
import { useSession } from "next-auth/react";

export const retroStages = [
  "lobby",
  "prime_directive",
  "idea_generation",
  "grouping",
  "group_labeling",
  "voting",
  "action_items",
  "finished",
] as const;
export type RetroStages = typeof retroStages[number];

export interface Idea {
  idea: string;
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  },
  // todo add type
}

export const ideaTypes = ["happy", "sad", "confused"] as const;
export type IdeaType = (typeof ideaTypes)[number];
// todo upd type Ideas = { "ideaId": Idea }
export type Ideas = { [key in IdeaType]: Idea[] };

export type ActionItem = {
  assignedUser: User,
  name: string,
  author: User,
  id: string;
};

export type Groups = Record<string, { name: string; ideas: Array<string>; votes: Array<string> }>;

export type User = {
  email: string;
  name: string;
  votes: number;
}

export interface Retro {
  createdAt: number;
  createdBy: string;
  stage: RetroStages;
  ideas: Ideas;
  groups: Groups;
  everJoined: Array<User>;
  actionItems: Array<ActionItem>;
}

export interface Store {
  retros: Record<string, Retro>;
}

export type UserData = {
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export type errResponse = { status: 404, error: string };

export type CreateRetroCallback = (
  data: { status: 200, id: string, retro: Retro } | errResponse
) => void;

export type GetRetroCallback = (
  data: { status: 200, retro: Retro } | errResponse
) => void;

export type ChangeRetroStateCallback = (
  data: { status: 200, retro: Retro} | errResponse
) => void;

export type InitPositionsCallback = (
  data: { status: 200 } | errResponse
) => void;

export type InitGroupsCallback = (
  data: { status: 200 } | errResponse
) => void;

interface RetroContextType {
  isLoading: boolean;
  retros: Record<string, Retro>;
  users?: Record<string, Record<string, UserData>>;
  updStorage: () => void;
  sendUserData: (retroId: string, userData: UserData) => void;
  sendIdea: (retroId: string, type: IdeaType, message: string) => void;
  removeIdea: (retroId: string, ideaId: string, type: IdeaType) => void;
  updateIdea: (retroId: string, ideaId: string, newType: IdeaType, newIdea: string) => void;
  initPositions: (retroId: string, ideas: Ideas, callback: InitPositionsCallback) => void;
  initGroups: (retroId: string, groups: Groups, callback: InitGroupsCallback) => void;
  updateGroupName: (retroId: string, groupId: string, newName: string) => void;
  updatePosition: (retroId: string, ideaId: string, newPosition: { x: number; y : number }) => void;
  voteAdd: (retroId: string, groupId: string, email: string) => void;
  voteSubstract: (retroId: string, groupId: string, email: string) => void;
  sendActionItem: (retroId: string, author: User, assignee: User, item: string) => void;
  removeActionItem: (retroId: string, itemId: string) => void;
  updateActionItem: (retroId: string, itemId: string, newAssignee: User, newName: string) => void;
  createRetro: (
    email: string,
    callback: CreateRetroCallback,
  ) => void;
  getRetro: (
    retroId: string,
    callback: GetRetroCallback,
  ) => void;
  changeRetroStage: (
    retroId: string,
    stage: RetroStages,
    callback: ChangeRetroStateCallback,
  ) => void;
}

const RetroContext = createContext<RetroContextType | undefined>(undefined);

export const RetroProvider = ({
  children,
  initialRetros
}: {
  children: ReactNode,
  initialRetros: Record<string, Retro>
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [retros, setRetros] = useState<Record<string, Retro>>(initialRetros);
  const [users, setUsers] = useState<Record<string, Record<string, UserData>>>();

  useEffect(() => {
    const socket = getSocket();
    function onConnect() {
      console.log("ON CONNECT");
    }

    function onDisconnect() {
      setIsLoading(true);
    }

    function onRetroCreated(newRetro: Retro) {
      console.log("on retro created");
      // setRetros((prevRetros) => ({ ...prevRetros, [newRetro.id]: newRetro }));
    }

    function onRetroUpdated(updatedRetro: Retro, retroId: string) {
      setRetros((prevRetros) => ({
        ...prevRetros,
        [retroId]: updatedRetro
      }));
    }

    function onStorage(store: Store) {
      console.log("GOT STORE", store);
      setRetros(store.retros);
      setIsLoading(false);
    }

    function onUsers(retroId: string, usersData: Record<string, UserData>) {
      setUsers((prevUsers) => {
        const newUsers = { ...prevUsers };
        console.log("userdata", usersData);
        newUsers[retroId] = usersData;
        console.log("SETTED USERS", newUsers);
        console.log(Object.entries(newUsers));
        return newUsers;
      });
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("retroCreated", onRetroCreated);
    socket.on("retroUpdated", onRetroUpdated);
    socket.on("storage", onStorage);
    socket.on("users", onUsers);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("retroCreated", onRetroCreated);
      socket.off("retroUpdated", onRetroUpdated);
      socket.off("storage", onStorage);
      socket.off("users", onUsers);
    };
  }, []);

  const socket = getSocket();

  const createRetro = (email: string, callback: CreateRetroCallback) => {
    socket.emit("createRetro", email, callback);
  };

  const getRetro = (retroId: string, callback: GetRetroCallback) => {
    socket.emit("getRetro", retroId, callback);
  };

  const sendIdea = (retroId: string, type: IdeaType, message: string) => {
    socket.emit("idea", retroId, type, message);
  };

  const removeIdea = (retroId: string, ideaId: string, type: IdeaType) => {
    socket.emit("removeIdea", retroId, ideaId, type);
  };

  const updateIdea = (retroId: string, ideaId: string, newType: IdeaType, newIdea: string) => {
    socket.emit("updateIdea", retroId, ideaId, newType, newIdea);
  };

  const initPositions = (retroId: string, ideas: Ideas, callback: InitPositionsCallback) => {
    socket.emit("initPositions", retroId, ideas, callback);
  };

  const updatePosition = (retroId: string, ideaId: string, newPosition: { x: number; y : number }) => {
    socket.emit("updatePosition", retroId, ideaId, newPosition);
  };

  const initGroups = (retroId: string, groups: Groups, callback: InitGroupsCallback) => {
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

  const updateActionItem = (retroId: string, actionItemId: string, newAssignee: User, newName: string) => {
    socket.emit("updateActionItem", retroId, actionItemId, newAssignee, newName);
  };

  const sendUserData = (retroId: string, userData: UserData) => {
    socket.emit("user", retroId, userData);
  };

  const updStorage = () => {
    socket.emit("upd");
  };

  const changeRetroStage = (
    retroId: string,
    stage: RetroStages,
    callback: ChangeRetroStateCallback
  ) => {
    socket.emit("changeRetroStage", retroId, stage, callback);
  };

  return (
    <RetroContext.Provider value={{
      isLoading,
      retros,
      users,
      updStorage,
      sendUserData,
      createRetro,
      getRetro,
      changeRetroStage,
      sendIdea,
      removeIdea,
      updateIdea,
      initPositions,
      updatePosition,
      initGroups,
      updateGroupName,
      voteAdd,
      voteSubstract,
      sendActionItem,
      removeActionItem,
      updateActionItem,
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
