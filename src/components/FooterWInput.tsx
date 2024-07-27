import { forwardRef, memo } from "react";
import { openModal } from "@/helpers";

interface FooterWInputProps {
  options: string[];
  selectedOption: string;
  onSelectChange: React.ChangeEventHandler<HTMLSelectElement>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  buttonTag: string;
  isAuthor: boolean;
}

const FooterWInput = forwardRef<HTMLInputElement, FooterWInputProps>(({
  options,
  selectedOption,
  onSelectChange,
  message,
  setMessage,
  handleSubmit,
  buttonTag,
  isAuthor,
}, ref) => {

  return (
    <div className="flex flex-col md:flex-row px-8  py-4 justify-between">
      <select
        className="select select-bordered w-full md:w-1/4 mb-2 md:mb-0"
        onChange={onSelectChange}
        value={selectedOption}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
      <form
        className="flex w-full"
        onSubmit={handleSubmit}
      >
        <input
          ref={ref}
          type="text"
          className="input input-bordered w-full mb-2 md:mb-0 md:mx-4"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary w-1/4 md:mr-4"
          disabled={message.length === 0}
        >
          Submit
        </button>
      </form>
      <button className="btn btn-primary md:w-1/6 mt-2 md:mt-0" disabled={!isAuthor} onClick={() => openModal("confirm_modal")}>
        {buttonTag}
      </button>
    </div>
  );
});
FooterWInput.displayName = "FooterWInput";

export default memo(FooterWInput);
