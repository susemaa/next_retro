"use client";
import { memo } from "react";
import { openModal } from "@/helpers";

const CreateRetroButton: React.FC = () => {
  return (
    <button className="btn btn-primary" onClick={() => openModal("create_retro_modal") }>
      Create a Retrospective!
    </button>
  );
};

export default memo(CreateRetroButton);
