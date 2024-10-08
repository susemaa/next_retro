"use client";
import { memo, useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { notify } from "@/helpers";

interface ModalProps {
}

const ShareLinkModal: React.FC<ModalProps> = () => {
  const pathname = usePathname();
  const [currentLink, setCurrentLink] = useState<string>("");

  useEffect(() => {
    setCurrentLink(`${window.location.origin}${pathname}`);
  }, [pathname]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentLink).then(() => {
      notify("successful", "Link copied ✓", document.getElementById("share_link_modal"));
    });
  };

  return (
    <dialog id="share_link_modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <Image
          src="/share.svg"
          alt="Share"
          width={100}
          height={100}
          className="mx-auto dark:invert"
        />
        <h3 className="font-bold text-lg text-center">Share the retro link below with teammates!</h3>
        <div className="flex items-center justify-center mt-4">
          <input type="text" value={currentLink} readOnly className="input input-bordered w-full max-w-xs" />
          <button className="btn btn-primary btn-outline ml-2" onClick={handleCopy}>
            <Image
              src="/copy-link.svg"
              alt="copy link"
              width={20}
              height={20}
              className="mx-auto dark:invert"
            />
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default memo(ShareLinkModal);
