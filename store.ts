import { Retro } from "@/contexts/RetroContext";
import fs from "fs";
import path from "path";

const storePath = path.resolve(process.cwd(), "store.json");

interface Store {
  retros: Record<string, Retro>;
}

function readStore(): Store {
  try {
    const data = fs.readFileSync(storePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading store:", error);
    return { retros: {} };
  }
}

function writeStore(store: Store) {
  try {
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error("Error writing to store:", error);
  }
}

export function get(id: string): Retro | undefined {
  const store = readStore();
  return store.retros[id];
}

export function set(id: string, value: Retro): void {
  const store = readStore();
  store.retros[id] = value;
  writeStore(store);
}

export function getStore(): Store {
  return readStore();
}
