"use server";
import { getServerSession } from "next-auth";
import RetroLi from "./RetroLi";
import { addUser, FullRetro, getFullStore, getUser } from "@/app/api/storage/storage";
import { CreateRetroModal } from "../Modals";
import CreateRetroButton from "@/components/Retros/CreateRetroButton";
import { authOptions } from "@/app/api/auth/[...nextauth]/nextAuth";

async function getRetros(): Promise<FullRetro[]> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return [];
  }
  const user = await getUser(session.user.email);
  if (!user) {
    await addUser(session.user.email, session.user.name || "", session.user.image || "");
  }
  const store = await getFullStore(session.user.email);
  return store;
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
