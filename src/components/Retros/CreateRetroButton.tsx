"use client";
import { openModal } from "@/helpers";
import { memo } from "react";

const CreateRetroButton: React.FC = () => {
  return (
    <button className="btn btn-primary" onClick={() => openModal("create_retro_modal") }>
      Create a Retrospective!
    </button>
  );
};

export default memo(CreateRetroButton);
