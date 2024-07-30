import { getServerSession } from "next-auth";
import RetroLi from "./RetroLi";
import { FullRetro } from "@/app/api/storage/storage";
import { CreateRetroModal } from "../Modals";
import CreateRetroButton from "@/components/Retros/CreateRetroButton";

async function getRetros(): Promise<FullRetro[]> {
  const session = await getServerSession();
  if (!session) {
    return [];
  }
  await fetch(new URL(`/api/storage/user/${session.user?.email}`, "http://localhost:3000"), {
    method: "POST",
    body: JSON.stringify({
      session,
    }),
  });
  const res = await fetch(new URL("/api/storage", "http://localhost:3000"), {
    method: "GET",
    headers: {
      "email": session.user?.email || "",
    },
    cache: "no-store"
  });
  const data = await res.json();
  return data.retros;
}

const Retros: React.FC = async () => {
  const retros = await getRetros();
  return (
    <main className="flex-grow flex flex-col p-8 h-full">
      <h1 className="text-2xl font-bold mb-4 border-b pb-2 inline-block border-current">
        My Retros
      </h1>
      {retros?.map((retro) => (
        <RetroLi
          key={retro.uId}
          id={retro.uId}
          title={`${retro.name ? retro.name : `created by ${retro.createdBy} on`} ${new Date(retro.createdAt * 1000).toLocaleDateString()}`}
          // items={[{ itemName: "Stage", owner: retro.stage }]}
          retro={retro}
        />
      ))}
      <CreateRetroButton/>
      <CreateRetroModal title="Select Format" />
    </main>
  );
};

export default Retros;
