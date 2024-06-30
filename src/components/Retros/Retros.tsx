import { memo } from "react";
import RetroLi from "./RetroLi";
import CreateRetroModal from "@/components/Retros/CreateRetroModal";
import CreateRetroButton from "@/components/Retros/CreateRetroButton";

// fetch retros here

const Retros: React.FC = () => {
  return (
    <main className="flex-grow flex flex-col p-8 h-full">
      <h1
        className="text-2xl font-bold mb-4 border-b pb-2"
        style={{ borderBottomColor: "currentColor" }}>
        My Retros
      </h1>
      <RetroLi
        title="created 1 day ago"
        items={[{ itemName: "Foo", owner: "John" }, { itemName: "Bar", owner: "Doe" }]}
      />
      <RetroLi
        title="created 2 days ago"
        items={[{ itemName: "Baz", owner: "Ryan" }, { itemName: "Foo", owner: "Gosling" }]}
      />
      <CreateRetroButton/>
      <CreateRetroModal title="Select Format" />
    </main>
  );
};

export default memo(Retros);
