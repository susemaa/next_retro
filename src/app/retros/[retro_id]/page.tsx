import Retro from "@/components/Retros/Retro";

async function getRetroData(retroId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const response = await fetch(new URL(`/api/retros/${retroId}`, baseUrl).toString(), { method: "GET" });
  const data = response.json();
  return data;
}

export default async function RetroPage({ params }: { params: { retro_id: string } }) {
  const { createdBy } = await getRetroData(params.retro_id);
  console.log(createdBy);
  return (
    <Retro id={params.retro_id} createdBy={createdBy}/>
  );
}
