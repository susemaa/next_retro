import fs from "fs";
import path from "path";

const storePath = path.resolve(process.cwd(), "store.json");

function readStore() {
  try {
    const data = fs.readFileSync(storePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading store:", error);
    return { retros: {} };
  }
}

function writeStore(store) {
  try {
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error("Error writing to store:", error);
  }
}

export function get(id) {
  const store = readStore();
  return store.retros[id];
}

export function set(id, value) {
  const store = readStore();
  store.retros[id] = value;
  writeStore(store);
}

export function getStore() {
  return readStore();
}
