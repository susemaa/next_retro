import { memo } from "react";
import { openModal } from "@/helpers";

interface FooterProps {
  isAuthor: boolean;
  title: string;
  caption: string;
  buttonTag: string;
  optionalEl?: React.ReactNode;
  customOnClick?: () => void;
  customBtnClasses?: string;
}

const Footer: React.FC<FooterProps> = ({
  isAuthor,
  title,
  caption,
  optionalEl,
  buttonTag,
  customOnClick,
  customBtnClasses,
}) => {
  const handleClick = () => {
    if (!customOnClick) {
      openModal("confirm_modal");
    } else {
      customOnClick();
    }
  };

  return (
    <div className="flex py-2 justify-between border grid grid-cols-3">
      <div className="flex items-center justify-center">
        {optionalEl}
      </div>
      <div className="flex flex-col items-center justify-center text-center">
        {title}
        <div className="opacity-70 text-xs">{caption}</div>
      </div>
      <button
        className={`btn btn-primary w-1/2 justify-self-end mr-8 ${customBtnClasses}`}
        disabled={!isAuthor}
        onClick={handleClick}
      >
        {buttonTag}
      </button>
    </div>
  );
};

export default memo(Footer);
