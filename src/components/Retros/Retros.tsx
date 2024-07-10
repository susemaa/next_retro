import { memo } from "react";
import RetroLi from "./RetroLi";
import CreateRetroModal from "@/components/Modals/CreateRetroModal";
import CreateRetroButton from "@/components/Retros/CreateRetroButton";
import { Retro } from "@/contexts/RetroContext";

async function getRetros(): Promise<Record<string, Retro>> {
  const res = await fetch(new URL("/api/retros", "http://localhost:3000"), {
    method: "GET",
    cache: "no-store"
  });
  return res.json();
}

// todo make it client i guess
// const Retros: React.FC = async () => {
const Retros: React.FC = async () => {
  const retros = await getRetros();
  return (
    <main className="flex-grow flex flex-col p-8 h-full">
      <h1 className="text-2xl font-bold mb-4 border-b pb-2 inline-block border-current">
        My Retros
      </h1>
      {Object.entries(retros).map(([id, retro]) => (
        <RetroLi
          key={id}
          id={id}
          title={`created by ${retro.createdBy} at ${retro.createdAt}`}
          items={[{ itemName: "Stage", owner: retro.stage }]}
        />
      ))}
      <CreateRetroButton/>
      <CreateRetroModal title="Select Format" />
    </main>
  );
};

export default memo(Retros);
