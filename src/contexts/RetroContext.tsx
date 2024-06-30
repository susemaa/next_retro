"use client";
import { createContext, useContext, useState, ReactNode } from "react";

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
  const [retros, setRetros] = useState<Retro[]>(initialRetros);

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
