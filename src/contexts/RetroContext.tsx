"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
// import { socket } from "@/socket";
import Retro from "@/components/Retros/Retro";

export interface Retro {
  createdAt: number;
  createdBy: string;
}

interface RetroContextType {
  retros: Retro[];
  setRetros: React.Dispatch<React.SetStateAction<Retro[]>>;
}

const RetroContext = createContext<RetroContextType | undefined>(undefined);

export const RetroProvider = ({ children, initialRetros }: { children: ReactNode, initialRetros: Retro[] }) => {
  // const [isConnected, setIsConnected] = useState(socket.connected);
  const [retros, setRetros] = useState<Retro[]>(initialRetros);

  // useEffect(() => {
  //   function onConnect() {
  //     setIsConnected(true);
  //   }

  //   function onDisconnect() {
  //     setIsConnected(false);
  //   }

  //   function onRetrosEvent(value) {
  //     console.log(value);
  //     if (value instanceof Retro) {
  //       setRetros(r => [...r, value as Retro]);
  //     }
  //   }

  //   socket.on("connect", onConnect);
  //   socket.on("disconnect", onDisconnect);
  //   socket.on("retrso", onRetrosEvent);

  //   return () => {
  //     socket.off("connect", onConnect);
  //     socket.off("disconnect", onDisconnect);
  //     socket.off("retros", onRetrosEvent);
  //   };
  // }, []);

  return (
    <RetroContext.Provider value={{ retros, setRetros }}>
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
